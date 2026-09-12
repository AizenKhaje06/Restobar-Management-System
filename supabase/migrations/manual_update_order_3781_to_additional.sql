-- Manual update: Set order #3781 as an additional order
-- Run this in Supabase SQL Editor to mark the order as Add-On type

-- First, let's check if order #3781 exists and what its current order_type is
-- SELECT id, order_number, order_type, parent_order_id, customer_name, table_id
-- FROM orders
-- WHERE order_number = 3781;

-- Update order #3781 to be an additional order
-- Set its parent_order_id to the initial order (order #3764) if they're from the same customer
UPDATE orders
SET 
  order_type = 'additional',
  parent_order_id = (
    SELECT id FROM orders WHERE order_number = 3764 LIMIT 1
  )
WHERE order_number = 3781;

-- Verify the update
SELECT 
  o.order_number,
  o.order_type,
  o.parent_order_id,
  parent.order_number as parent_order_number,
  o.customer_name,
  o.created_at
FROM orders o
LEFT JOIN orders parent ON o.parent_order_id = parent.id
WHERE o.order_number IN (3764, 3781)
ORDER BY o.order_number;
