-- Check A-3 table status and sessions
-- Run this to see what's happening with A-3

-- 1. Find A-3 table
SELECT id, label, status, zone 
FROM tables 
WHERE label = 'A-3';

-- 2. Check for any active sessions on A-3
SELECT ts.id, ts.table_id, ts.customer_name, ts.status, ts.created_at,
       t.label as table_label
FROM table_sessions ts
JOIN tables t ON t.id = ts.table_id
WHERE t.label = 'A-3' AND ts.status = 'active';

-- 3. Check for any unpaid orders on A-3
SELECT o.id, o.order_number, o.status, o.payment_status, o.table_id,
       t.label as table_label
FROM orders o
JOIN tables t ON t.id = o.table_id
WHERE t.label = 'A-3' 
  AND o.payment_status != 'paid'
  AND o.status NOT IN ('completed', 'cancelled');

-- ============================================
-- FIX: If A-3 should be available, run these:
-- ============================================

-- Option 1: Close any orphaned active sessions for A-3
-- UPDATE table_sessions ts
-- SET status = 'completed'
-- FROM tables t
-- WHERE ts.table_id = t.id 
--   AND t.label = 'A-3' 
--   AND ts.status = 'active';

-- Option 2: Set A-3 table status to available
-- UPDATE tables
-- SET status = 'available'
-- WHERE label = 'A-3';

-- Option 3: Complete any unpaid orders for A-3 (if no real customer)
-- UPDATE orders o
-- SET status = 'cancelled', payment_status = 'paid'
-- FROM tables t
-- WHERE o.table_id = t.id
--   AND t.label = 'A-3'
--   AND o.payment_status != 'paid';
