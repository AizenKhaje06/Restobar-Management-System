-- ============================================
-- AUTO-SYNC TABLE STATUS TRIGGERS
-- ============================================
-- These triggers automatically keep table status in sync with table_sessions

-- Function: Update table status when session changes
CREATE OR REPLACE FUNCTION sync_table_status_from_session()
RETURNS TRIGGER AS $$
BEGIN
  -- When a session is created or reactivated → set table to occupied
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'active')) THEN
    UPDATE tables 
    SET status = 'occupied', updated_at = NOW()
    WHERE id = NEW.table_id;
    
    RAISE NOTICE 'Table % set to occupied (session %)', NEW.table_id, NEW.id;
  END IF;

  -- When a session is closed/cancelled → check if table should be available
  IF (TG_OP = 'UPDATE' AND NEW.status != 'active' AND OLD.status = 'active') THEN
    -- Only set to available if no other active sessions exist
    IF NOT EXISTS (
      SELECT 1 FROM table_sessions 
      WHERE table_id = NEW.table_id 
      AND status = 'active' 
      AND id != NEW.id
    ) THEN
      UPDATE tables 
      SET status = 'available', updated_at = NOW()
      WHERE id = NEW.table_id;
      
      RAISE NOTICE 'Table % set to available (no active sessions)', NEW.table_id;
    END IF;
  END IF;

  -- When a session is deleted → check if table should be available
  IF (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
    IF NOT EXISTS (
      SELECT 1 FROM table_sessions 
      WHERE table_id = OLD.table_id 
      AND status = 'active'
    ) THEN
      UPDATE tables 
      SET status = 'available', updated_at = NOW()
      WHERE id = OLD.table_id;
      
      RAISE NOTICE 'Table % set to available (session deleted)', OLD.table_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_sync_table_status_on_session_change ON table_sessions;
DROP TRIGGER IF EXISTS trigger_sync_table_status_on_session_delete ON table_sessions;

-- Trigger: Sync when session is created or updated
CREATE TRIGGER trigger_sync_table_status_on_session_change
  AFTER INSERT OR UPDATE ON table_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_table_status_from_session();

-- Trigger: Sync when session is deleted
CREATE TRIGGER trigger_sync_table_status_on_session_delete
  AFTER DELETE ON table_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_table_status_from_session();

-- Test the trigger (optional - uncomment to test)
-- INSERT INTO table_sessions (table_id, customer_name, access_code, status)
-- VALUES (
--   (SELECT id FROM tables WHERE label = 'T-1'),
--   'Test Customer',
--   '123456',
--   'active'
-- );

COMMENT ON FUNCTION sync_table_status_from_session IS 
  'Automatically syncs table status based on table_sessions state. Keeps tables.status accurate in real-time.';
