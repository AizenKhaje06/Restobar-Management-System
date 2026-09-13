-- ============================================
-- AUTO-CLOSE TABLE SESSIONS WHEN ALL ORDERS ARE PAID
-- ============================================

-- Function to check if a session should be auto-closed
CREATE OR REPLACE FUNCTION auto_close_fully_paid_session()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id UUID;
  v_table_id UUID;
  v_unpaid_count INTEGER;
  v_total_count INTEGER;
BEGIN
  -- Get the session_id from the updated order
  v_session_id := NEW.session_id;
  
  -- Skip if no session
  IF v_session_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if session is still active
  IF NOT EXISTS (
    SELECT 1 FROM table_sessions 
    WHERE id = v_session_id AND status = 'active'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Count orders for this session
  SELECT 
    COUNT(*) FILTER (WHERE payment_status != 'paid'),
    COUNT(*),
    MAX(table_id)
  INTO v_unpaid_count, v_total_count, v_table_id
  FROM orders
  WHERE session_id = v_session_id;
  
  -- If all orders are paid and there's at least one order, close the session
  IF v_total_count > 0 AND v_unpaid_count = 0 THEN
    -- Close the session
    UPDATE table_sessions
    SET 
      status = 'closed',
      closed_reason = 'paid',
      closed_at = NOW()
    WHERE id = v_session_id;
    
    -- Free the table
    IF v_table_id IS NOT NULL THEN
      UPDATE tables
      SET status = 'available'
      WHERE id = v_table_id;
    END IF;
    
    -- Log the activity
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

-- Trigger: Auto-close session when order payment status changes to 'paid'
DROP TRIGGER IF EXISTS trigger_auto_close_session_on_payment ON orders;
CREATE TRIGGER trigger_auto_close_session_on_payment
  AFTER UPDATE OF payment_status ON orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid' AND OLD.payment_status != 'paid')
  EXECUTE FUNCTION auto_close_fully_paid_session();

-- Trigger: Also check when order status changes to 'completed'
DROP TRIGGER IF EXISTS trigger_auto_close_session_on_complete ON orders;
CREATE TRIGGER trigger_auto_close_session_on_complete
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION auto_close_fully_paid_session();

COMMENT ON FUNCTION auto_close_fully_paid_session IS 
  'Automatically closes table sessions when all orders are paid and frees the table';
