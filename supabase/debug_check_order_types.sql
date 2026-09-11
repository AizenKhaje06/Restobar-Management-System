-- Debug script: Check order_type values for all recent orders
-- Run this in Supabase SQL Editor to see what order_type your orders have

-- Check the most recent 20 orders
SELECT 
  order_number,
  order_type,
  parent_order_id,
  customer_name,
  t.label as table_label,
  status,
  payment_status,
  total,
  created_at
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
ORDER BY created_at DESC
LIMIT 20;

-- Count orders by type
SELECT 
  order_type,
  COUNT(*) as count
FROM orders
GROUP BY order_type;

-- Find orders that might be additional but aren't marked
-- (Same customer_name, same table, created within 2 hours)
SELECT 
  o1.order_number as first_order,
  o2.order_number as possible_additional,
  o1.customer_name,
  t.label as table_label,
  o1.created_at as first_created,
  o2.created_at as second_created,
  o2.order_type as current_type,
  CASE 
    WHEN o2.order_type = 'initial' THEN 'Should be additional'
    ELSE 'Already marked correctly'
  END as recommendation
FROM orders o1
INNER JOIN orders o2 
  ON o1.table_id = o2.table_id 
  AND o1.customer_name = o2.customer_name
  AND o2.created_at > o1.created_at
  AND o2.created_at < o1.created_at + INTERVAL '2 hours'
LEFT JOIN tables t ON o1.table_id = t.id
WHERE o1.status != 'cancelled'
  AND o2.status != 'cancelled'
ORDER BY o1.created_at DESC;
