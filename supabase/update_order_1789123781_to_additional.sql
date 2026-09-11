-- Update order 1789123781 to be an additional order
-- Run this in Supabase SQL Editor

-- First check if the order exists
SELECT 
  order_number, 
  order_type, 
  customer_name, 
  status,
  created_at
FROM orders
WHERE order_number = 1789123781;

-- Update to 'additional' type
UPDATE orders
SET order_type = 'additional'
WHERE order_number = 1789123781;

-- Optional: Link to parent order (1789123764) if they're related
-- Uncomment the lines below if you want to link them:

-- UPDATE orders
-- SET 
--   order_type = 'additional',
--   parent_order_id = (SELECT id FROM orders WHERE order_number = 1789123764 LIMIT 1)
-- WHERE order_number = 1789123781;

-- Verify the update
SELECT 
  order_number, 
  order_type,
  parent_order_id,
  customer_name, 
  status
FROM orders
WHERE order_number IN (1789123781, 1789123764)
ORDER BY order_number;
