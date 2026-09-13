-- ============================================================
-- STEP 3: SECURITY FIXES MIGRATION
-- ============================================================
-- Description: Hardens security with stronger PINs, session timeout, and tracking
-- Date: 2026-09-13
-- Dependencies: 01_critical_fixes.sql

BEGIN;

-- ============================================================
-- 1. STRENGTHEN SESSION PINS (4 digits → 6 digits)
-- ============================================================

DO $$
BEGIN
  -- Drop all policies on table_sessions temporarily
  DROP POLICY IF EXISTS sessions_create_public ON table_sessions;
  DROP POLICY IF EXISTS sessions_read_by_token ON table_sessions;
  DROP POLICY IF EXISTS sessions_update_staff ON table_sessions;
  DROP POLICY IF EXISTS sessions_staff_read ON table_sessions;
  DROP POLICY IF EXISTS sessions_staff_update ON table_sessions;
  RAISE NOTICE '✓ Dropped existing policies temporarily';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some policies may not exist yet';
END $$;

-- Change access_code from VARCHAR(4) to VARCHAR(6)
ALTER TABLE table_sessions 
  ALTER COLUMN access_code TYPE VARCHAR(6);

-- Add check constraint for 6 digits
ALTER TABLE table_sessions 
  DROP CONSTRAINT IF EXISTS access_code_format;
  
ALTER TABLE table_sessions 
  ADD CONSTRAINT access_code_format CHECK (access_code ~ '^\d{6}$');

COMMENT ON COLUMN table_sessions.access_code IS 
  'Customer access code (6 digits) for joining multi-user sessions. Must be exactly 6 numeric digits.';

-- Recreate RLS policies
CREATE POLICY sessions_create_public ON table_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY sessions_read_by_token ON table_sessions
  FOR SELECT
  USING (true);

CREATE POLICY sessions_staff_read ON table_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'pos', 'waiter')
    )
  );

CREATE POLICY sessions_staff_update ON table_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'pos', 'waiter')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'pos', 'waiter')
    )
  );

-- ============================================================
-- 2. SESSION ACTIVITY TRACKING (for auto-timeout)
-- ============================================================

-- Add last_activity_at timestamp
ALTER TABLE table_sessions 
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN table_sessions.last_activity_at IS 
  'Timestamp of last activity on this session (updated when orders are placed). Used for auto-timeout after 4 hours.';

-- Create index for efficient timeout queries
CREATE INDEX IF NOT EXISTS idx_table_sessions_activity 
  ON table_sessions(status, last_activity_at) 
  WHERE status = 'active';

-- ============================================================
-- 3. AUTO-UPDATE LAST ACTIVITY ON NEW ORDERS
-- ============================================================

-- Trigger to update last_activity_at when orders are created
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if order is linked to a session
  IF NEW.session_id IS NOT NULL THEN
    UPDATE table_sessions
    SET last_activity_at = NOW()
    WHERE id::text = NEW.session_id::text
      AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_session_activity ON orders;
CREATE TRIGGER trigger_update_session_activity
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

COMMENT ON FUNCTION update_session_activity() IS 
  'Automatically updates table_sessions.last_activity_at when a new order is created. Used for session timeout tracking.';

-- ============================================================
-- 4. SESSION TIMEOUT CLEANUP FUNCTION
-- ============================================================

-- Function to close stale sessions (inactive for > 4 hours)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions(p_timeout_hours INTEGER DEFAULT 4)
RETURNS TABLE(
  closed_count INTEGER,
  session_ids TEXT[]
) AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_session_ids TEXT[];
  v_table_ids UUID[];
  v_count INTEGER;
BEGIN
  -- Calculate cutoff time (default: 4 hours ago)
  v_cutoff := NOW() - (p_timeout_hours || ' hours')::INTERVAL;
  
  -- Find stale sessions
  SELECT 
    ARRAY_AGG(id::text),
    ARRAY_AGG(table_id)
  INTO v_session_ids, v_table_ids
  FROM table_sessions
  WHERE status = 'active'
    AND last_activity_at < v_cutoff;
  
  -- Get count
  v_count := COALESCE(ARRAY_LENGTH(v_session_ids, 1), 0);
  
  -- If no stale sessions, return early
  IF v_count = 0 THEN
    RETURN QUERY SELECT 0, ARRAY[]::TEXT[];
    RETURN;
  END IF;
  
  -- Close stale sessions
  UPDATE table_sessions
  SET 
    status = 'closed',
    closed_reason = 'timeout',
    closed_at = NOW()
  WHERE id::text = ANY(v_session_ids);
  
  -- Free tables
  UPDATE tables
  SET status = 'available'
  WHERE id = ANY(v_table_ids);
  
  -- Cancel unpaid orders for these sessions
  UPDATE orders
  SET 
    status = 'cancelled',
    payment_status = 'unpaid'
  WHERE session_id::text = ANY(v_session_ids)
    AND payment_status IN ('unpaid', 'pending');
  
  -- Return result
  RETURN QUERY SELECT v_count, v_session_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_stale_sessions(INTEGER) IS 
  'Closes table sessions that have been inactive for more than the specified hours (default: 4). Frees tables and cancels unpaid orders. Returns count of closed sessions and their IDs.';

-- ============================================================
-- 5. RATE LIMITING TRACKING TABLE (optional, for persistence)
-- ============================================================

-- Optional: Create table to track rate limits across server restarts
-- (For development, we'll use in-memory. For production with multiple instances, use Redis or this table)
CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- IP address or user ID
  action TEXT NOT NULL, -- 'login', 'pin_join', 'staff_create', etc.
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
  ON rate_limit_attempts(identifier, action, attempted_at DESC);

COMMENT ON TABLE rate_limit_attempts IS 
  'Tracks rate limit attempts for persistent rate limiting across server restarts. Optional - can use in-memory store in development.';

-- Auto-cleanup old rate limit entries (keep last 24 hours only)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limit_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_rate_limits() IS 
  'Removes rate limit entries older than 24 hours. Should be called periodically (e.g., daily cron job).';

-- ============================================================
-- 6. ENHANCED ACTIVITY LOGGING
-- ============================================================

-- Add security event logging (extends existing activity_logs)
CREATE TYPE security_event_type AS ENUM (
  'rate_limit_hit',
  'brute_force_attempt',
  'session_timeout',
  'invalid_pin_attempt',
  'suspicious_activity'
);

-- Add security events to activity_logs (optional, uses existing table)
-- We'll just use the existing activity_logs table with action like 'security.rate_limit_hit'

-- ============================================================
-- 7. UPDATE RLS POLICIES (if needed)
-- ============================================================

-- No changes needed - existing RLS policies are adequate
-- Rate limiting is handled at application layer

-- ============================================================
-- 8. VERIFICATION QUERIES
-- ============================================================

-- Verify access_code is now VARCHAR(6)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'table_sessions'
      AND column_name = 'access_code'
      AND character_maximum_length = 6
  ) THEN
    RAISE NOTICE '✓ access_code column updated to VARCHAR(6)';
  ELSE
    RAISE EXCEPTION '✗ access_code column not updated correctly';
  END IF;
END $$;

-- Verify last_activity_at column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'table_sessions'
      AND column_name = 'last_activity_at'
  ) THEN
    RAISE NOTICE '✓ last_activity_at column added';
  ELSE
    RAISE EXCEPTION '✗ last_activity_at column missing';
  END IF;
END $$;

-- Verify trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_update_session_activity'
  ) THEN
    RAISE NOTICE '✓ Session activity trigger created';
  ELSE
    RAISE EXCEPTION '✗ Session activity trigger missing';
  END IF;
END $$;

-- Verify cleanup function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'cleanup_stale_sessions'
  ) THEN
    RAISE NOTICE '✓ Cleanup function created';
  ELSE
    RAISE EXCEPTION '✗ Cleanup function missing';
  END IF;
END $$;

-- ============================================================
-- 9. TEST THE CLEANUP FUNCTION
-- ============================================================

-- Test cleanup (should return 0 closed sessions if all are recent)
DO $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT * INTO v_result FROM cleanup_stale_sessions(4);
  RAISE NOTICE '✓ Cleanup test: Closed % sessions', v_result.closed_count;
END $$;

COMMIT;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Summary
SELECT 
  'STEP 3: SECURITY FIXES MIGRATION COMPLETE' as status,
  NOW() as completed_at;

-- Display summary
SELECT 
  'Security enhancements applied:' as message
UNION ALL SELECT '1. Session PINs: 4 digits → 6 digits'
UNION ALL SELECT '2. Session activity tracking added'
UNION ALL SELECT '3. Auto-timeout trigger created'
UNION ALL SELECT '4. Cleanup function created'
UNION ALL SELECT '5. Rate limiting table added (optional)'
UNION ALL SELECT ''
UNION ALL SELECT 'Next steps:'
UNION ALL SELECT '1. Apply rate limiting in application code'
UNION ALL SELECT '2. Update UI to use 6-digit PINs'
UNION ALL SELECT '3. Schedule cleanup_stale_sessions() hourly'
UNION ALL SELECT '4. Add security headers to next.config.mjs';
