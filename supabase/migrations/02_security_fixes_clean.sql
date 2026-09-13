-- ============================================================
-- STEP 3: SECURITY FIXES MIGRATION (CLEAN VERSION)
-- ============================================================
-- Description: Hardens security with stronger PINs, session timeout, and tracking
-- Date: 2026-09-13
-- Dependencies: 01_critical_fixes.sql
-- Tested: PostgreSQL 15+

BEGIN;

-- ============================================================
-- 1. STRENGTHEN SESSION PINS (4 digits → 6 digits)
-- ============================================================

-- Drop policies that depend on access_code
DO $$
BEGIN
  DROP POLICY IF EXISTS sessions_create_public ON table_sessions;
  DROP POLICY IF EXISTS sessions_read_by_token ON table_sessions;
  DROP POLICY IF EXISTS sessions_update_staff ON table_sessions;
  DROP POLICY IF EXISTS sessions_staff_read ON table_sessions;
  DROP POLICY IF EXISTS sessions_staff_update ON table_sessions;
  RAISE NOTICE '1. Dropped existing policies';
END $$;

-- Change access_code from VARCHAR(4) to VARCHAR(6)
ALTER TABLE table_sessions ALTER COLUMN access_code TYPE VARCHAR(6);

-- Update existing 4-digit PINs to 6-digit (add "00" prefix)
UPDATE table_sessions 
SET access_code = LPAD(access_code, 6, '0')
WHERE LENGTH(access_code) = 4;

-- Add check constraint for 6 digits
ALTER TABLE table_sessions DROP CONSTRAINT IF EXISTS access_code_format;
ALTER TABLE table_sessions ADD CONSTRAINT access_code_format CHECK (access_code ~ '^\d{6}$');

-- Recreate RLS policies
CREATE POLICY sessions_create_public ON table_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY sessions_read_by_token ON table_sessions FOR SELECT USING (true);
CREATE POLICY sessions_staff_read ON table_sessions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pos', 'waiter')));
CREATE POLICY sessions_staff_update ON table_sessions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pos', 'waiter')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pos', 'waiter')));

-- ============================================================
-- 2. SESSION ACTIVITY TRACKING
-- ============================================================

ALTER TABLE table_sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_table_sessions_activity 
  ON table_sessions(status, last_activity_at) WHERE status = 'active';

-- ============================================================
-- 3. AUTO-UPDATE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    UPDATE table_sessions
    SET last_activity_at = NOW()
    WHERE id::text = NEW.session_id::text AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_session_activity ON orders;
CREATE TRIGGER trigger_update_session_activity
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- ============================================================
-- 4. CLEANUP FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_stale_sessions(p_timeout_hours INTEGER DEFAULT 4)
RETURNS TABLE(closed_count INTEGER, session_ids TEXT[]) AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_session_ids TEXT[];
  v_table_ids UUID[];
  v_count INTEGER;
BEGIN
  v_cutoff := NOW() - (p_timeout_hours || ' hours')::INTERVAL;
  
  SELECT ARRAY_AGG(id::text), ARRAY_AGG(table_id)
  INTO v_session_ids, v_table_ids
  FROM table_sessions
  WHERE status = 'active' AND last_activity_at < v_cutoff;
  
  v_count := COALESCE(ARRAY_LENGTH(v_session_ids, 1), 0);
  
  IF v_count = 0 THEN
    RETURN QUERY SELECT 0, ARRAY[]::TEXT[];
    RETURN;
  END IF;
  
  UPDATE table_sessions SET status = 'closed', closed_reason = 'timeout', closed_at = NOW()
  WHERE id::text = ANY(v_session_ids);
  
  UPDATE tables SET status = 'available' WHERE id = ANY(v_table_ids);
  
  UPDATE orders SET status = 'cancelled', payment_status = 'unpaid'
  WHERE session_id::text = ANY(v_session_ids) AND payment_status IN ('unpaid', 'pending');
  
  RETURN QUERY SELECT v_count, v_session_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. RATE LIMITING TABLE (optional)
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
  ON rate_limit_attempts(identifier, action, attempted_at DESC);

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limit_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. VERIFICATION
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_sessions' AND column_name = 'access_code' AND character_maximum_length = 6) THEN
    RAISE NOTICE '✓ access_code is VARCHAR(6)';
  ELSE
    RAISE EXCEPTION 'access_code not updated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_sessions' AND column_name = 'last_activity_at') THEN
    RAISE NOTICE '✓ last_activity_at added';
  ELSE
    RAISE EXCEPTION 'last_activity_at missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_session_activity') THEN
    RAISE NOTICE '✓ Trigger created';
  ELSE
    RAISE EXCEPTION 'Trigger missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_stale_sessions') THEN
    RAISE NOTICE '✓ Cleanup function created';
  ELSE
    RAISE EXCEPTION 'Function missing';
  END IF;
  
  RAISE NOTICE '✓ All verifications passed!';
END $$;

COMMIT;

-- Summary
SELECT 'STEP 3: SECURITY FIXES COMPLETE' as status, NOW() as completed_at;
