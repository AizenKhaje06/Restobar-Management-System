-- ============================================
-- CLEANUP: Close sessions where all orders are paid
-- ============================================

-- Find sessions with all orders paid but session still active
WITH session_order_status AS (
  SELECT 
    ts.id as session_id,
    ts.table_id,
    ts.customer_name,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.payment_status = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN o.payment_status != 'paid' THEN 1 END) as unpaid_orders
  FROM table_sessions ts
  LEFT JOIN orders o ON o.session_id = ts.id
  WHERE ts.status = 'active'
  GROUP BY ts.id, ts.table_id, ts.customer_name
)
SELECT 
  session_id,
  table_id,
  customer_name,
  total_orders,
  paid_orders,
  unpaid_orders
FROM session_order_status
WHERE total_orders > 0 
  AND unpaid_orders = 0  -- All orders are paid
ORDER BY session_id;

-- ============================================
-- FIX: Close these sessions and free the tables
-- ============================================

-- Step 1: Close sessions where all orders are paid
WITH sessions_to_close AS (
  SELECT 
    ts.id as session_id,
    ts.table_id
  FROM table_sessions ts
  LEFT JOIN orders o ON o.session_id = ts.id
  WHERE ts.status = 'active'
  GROUP BY ts.id, ts.table_id
  HAVING COUNT(o.id) > 0 
    AND COUNT(CASE WHEN o.payment_status != 'paid' THEN 1 END) = 0
)
UPDATE table_sessions
SET 
  status = 'closed',
  closed_reason = 'paid',
  closed_at = NOW()
FROM sessions_to_close
WHERE table_sessions.id = sessions_to_close.session_id;

-- Step 2: Free the tables
WITH tables_to_free AS (
  SELECT DISTINCT t.id
  FROM tables t
  LEFT JOIN table_sessions ts ON ts.table_id = t.id AND ts.status = 'active'
  WHERE t.status = 'occupied'
    AND ts.id IS NULL  -- No active session
)
UPDATE tables
SET status = 'available'
FROM tables_to_free
WHERE tables.id = tables_to_free.id;

-- Verify the cleanup
SELECT 
  t.label,
  t.status as table_status,
  ts.id as session_id,
  ts.status as session_status,
  ts.customer_name,
  COUNT(o.id) as total_orders,
  COUNT(CASE WHEN o.payment_status = 'paid' THEN 1 END) as paid_orders
FROM tables t
LEFT JOIN table_sessions ts ON ts.table_id = t.id AND ts.status = 'active'
LEFT JOIN orders o ON o.session_id = ts.id
WHERE t.label IN ('A-5', 'P-1')
GROUP BY t.label, t.status, ts.id, ts.status, ts.customer_name
ORDER BY t.label;
