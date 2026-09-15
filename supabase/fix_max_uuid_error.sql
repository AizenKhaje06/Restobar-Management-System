-- ============================================
-- FIX: max(uuid) error in auto_close_fully_paid_session function
-- ============================================

-- Recreate the function with the fix
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
  -- FIX: Changed MAX(table_id) to subquery since MAX doesn't work on UUID
  SELECT 
    COUNT(*) FILTER (WHERE payment_status != 'paid'),
    COUNT(*),
    (SELECT table_id FROM orders WHERE session_id = v_session_id LIMIT 1)
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

-- The triggers remain the same, no need to recreate them
