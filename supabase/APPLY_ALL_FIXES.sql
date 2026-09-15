-- ============================================
-- ALL-IN-ONE FIX SCRIPT
-- ============================================
-- Run this ONCE to fix all table status issues
-- Author: AI Assistant
-- Date: 2024

-- ============================================
-- FIX 1: Enable Real-time for tables
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'tables'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
        RAISE NOTICE '✓ Realtime enabled for tables';
    ELSE
        RAISE NOTICE '✓ Realtime already enabled';
    END IF;
END $$;

-- ============================================
-- FIX 2: Sync Current Table Statuses
-- ============================================

-- Show current inconsistencies
DO $$
DECLARE
    wrong_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO wrong_count
    FROM tables t
    WHERE (
        -- Occupied but no active session
        (t.status = 'occupied' AND NOT EXISTS (
            SELECT 1 FROM table_sessions ts 
            WHERE ts.table_id = t.id AND ts.status = 'active'
        ))
        OR
        -- Has active session but not occupied
        (t.status != 'occupied' AND EXISTS (
            SELECT 1 FROM table_sessions ts 
            WHERE ts.table_id = t.id AND ts.status = 'active'
        ))
    );
    
    IF wrong_count > 0 THEN
        RAISE NOTICE '⚠ Found % tables with incorrect status', wrong_count;
    ELSE
        RAISE NOTICE '✓ All table statuses are correct';
    END IF;
END $$;

-- Fix: Set tables to occupied if they have active sessions
UPDATE tables t
SET status = 'occupied', updated_at = NOW()
FROM table_sessions ts
WHERE t.id = ts.table_id 
  AND ts.status = 'active'
  AND t.status != 'occupied';

-- Fix: Set tables to available if they DON'T have active sessions
UPDATE tables t
SET status = 'available', updated_at = NOW()
WHERE t.status = 'occupied'
  AND NOT EXISTS (
    SELECT 1 FROM table_sessions ts 
    WHERE ts.table_id = t.id AND ts.status = 'active'
  );

-- Verify fix
DO $$
DECLARE
    occupied_count INTEGER;
    available_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO occupied_count FROM tables WHERE status = 'occupied';
    SELECT COUNT(*) INTO available_count FROM tables WHERE status = 'available';
    
    RAISE NOTICE '✓ Status sync complete: % occupied, % available', occupied_count, available_count;
END $$;

-- ============================================
-- FIX 3: Auto-Sync Triggers (Permanent Fix)
-- ============================================

-- Create function
CREATE OR REPLACE FUNCTION sync_table_status_from_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Session created/activated → mark table occupied
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'active')) THEN
    UPDATE tables 
    SET status = 'occupied', updated_at = NOW()
    WHERE id = NEW.table_id;
  END IF;

  -- Session closed → check if table should be available
  IF (TG_OP = 'UPDATE' AND NEW.status != 'active' AND OLD.status = 'active') THEN
    IF NOT EXISTS (
      SELECT 1 FROM table_sessions 
      WHERE table_id = NEW.table_id 
      AND status = 'active' 
      AND id != NEW.id
    ) THEN
      UPDATE tables 
      SET status = 'available', updated_at = NOW()
      WHERE id = NEW.table_id;
    END IF;
  END IF;

  -- Session deleted → check if table should be available
  IF (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
    IF NOT EXISTS (
      SELECT 1 FROM table_sessions 
      WHERE table_id = OLD.table_id 
      AND status = 'active'
    ) THEN
      UPDATE tables 
      SET status = 'available', updated_at = NOW()
      WHERE id = OLD.table_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old triggers
DROP TRIGGER IF EXISTS trigger_sync_table_status_on_session_change ON table_sessions;
DROP TRIGGER IF EXISTS trigger_sync_table_status_on_session_delete ON table_sessions;

-- Create new triggers
CREATE TRIGGER trigger_sync_table_status_on_session_change
  AFTER INSERT OR UPDATE ON table_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_table_status_from_session();

CREATE TRIGGER trigger_sync_table_status_on_session_delete
  AFTER DELETE ON table_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_table_status_from_session();

-- Confirm triggers created
DO $$
BEGIN
    RAISE NOTICE '✓ Auto-sync triggers created';
END $$;

-- ============================================
-- FIX 4: Fix max(uuid) error in payment
-- ============================================

CREATE OR REPLACE FUNCTION auto_close_fully_paid_session()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id UUID;
  v_table_id UUID;
  v_unpaid_count INTEGER;
  v_total_count INTEGER;
BEGIN
  v_session_id := NEW.session_id;
  
  IF v_session_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM table_sessions 
    WHERE id = v_session_id AND status = 'active'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- FIXED: Use subquery instead of MAX(uuid)
  SELECT 
    COUNT(*) FILTER (WHERE payment_status != 'paid'),
    COUNT(*),
    (SELECT table_id FROM orders WHERE session_id = v_session_id LIMIT 1)
  INTO v_unpaid_count, v_total_count, v_table_id
  FROM orders
  WHERE session_id = v_session_id;
  
  IF v_total_count > 0 AND v_unpaid_count = 0 THEN
    UPDATE table_sessions
    SET 
      status = 'closed',
      closed_reason = 'paid',
      closed_at = NOW()
    WHERE id = v_session_id;
    
    IF v_table_id IS NOT NULL THEN
      UPDATE tables
      SET status = 'available'
      WHERE id = v_table_id;
    END IF;
    
    PERFORM log_activity(
      'session.auto_closed',
      'table_session',
      v_session_id,
      jsonb_build_object(
        'reason', 'all_orders_paid',
        'total_orders', v_total_count
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirm payment trigger fixed
DO $$
BEGIN
    RAISE NOTICE '✓ Payment trigger fixed (max uuid error)';
END $$;

-- ============================================
-- FINAL VERIFICATION
-- ============================================

-- Show final status
SELECT 
    '📊 FINAL STATUS' as report,
    status,
    COUNT(*) as count
FROM tables
GROUP BY status
ORDER BY status;

-- Show occupied tables with their sessions
SELECT 
    '🔒 OCCUPIED TABLES' as report,
    t.label,
    ts.customer_name as host,
    ts.created_at::date as session_date,
    COUNT(o.id) as orders
FROM tables t
JOIN table_sessions ts ON t.id = ts.table_id AND ts.status = 'active'
LEFT JOIN orders o ON ts.id = o.session_id
WHERE t.status = 'occupied'
GROUP BY t.label, ts.customer_name, ts.created_at
ORDER BY t.label;

-- Check for any remaining issues
SELECT 
    '⚠️ ISSUES' as report,
    CASE
        WHEN COUNT(*) = 0 THEN '✓ No issues found - all systems operational'
        ELSE '⚠ ' || COUNT(*) || ' tables still have status mismatch'
    END as status
FROM tables t
WHERE (
    (t.status = 'occupied' AND NOT EXISTS (
        SELECT 1 FROM table_sessions ts 
        WHERE ts.table_id = t.id AND ts.status = 'active'
    ))
    OR
    (t.status != 'occupied' AND EXISTS (
        SELECT 1 FROM table_sessions ts 
        WHERE ts.table_id = t.id AND ts.status = 'active'
    ))
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '✓ ALL FIXES APPLIED SUCCESSFULLY!';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '  1. ✓ Realtime enabled for tables';
    RAISE NOTICE '  2. ✓ Current table statuses synchronized';
    RAISE NOTICE '  3. ✓ Auto-sync triggers installed';
    RAISE NOTICE '  4. ✓ Payment max(uuid) error fixed';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  • Refresh Admin Tables page';
    RAISE NOTICE '  • Verify table statuses match POS Orders';
    RAISE NOTICE '  • Test creating new session';
    RAISE NOTICE '  • Check realtime updates work';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;
