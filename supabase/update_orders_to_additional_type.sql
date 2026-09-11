-- Helper script: Update existing orders to mark them as 'additional' type
-- Use this to convert any existing order to an Add-On order

-- ============================================================================
-- OPTION 1: Update a SINGLE order by order number
-- ============================================================================
-- Replace 3781 with your actual order number
-- Replace 3764 with the parent/initial order number

UPDATE orders
SET 
  order_type = 'additional',
  parent_order_id = (
    SELECT id FROM orders WHERE order_number = 3764 LIMIT 1
  )
WHERE order_number = 3781;


-- ============================================================================
-- OPTION 2: Update MULTIPLE orders at once
-- ============================================================================
-- Replace the order numbers in the VALUES list

WITH orders_to_update AS (
  SELECT * FROM (VALUES
    (3781, 3764),  -- (additional_order_number, parent_order_number)
    (3800, 3795),  -- Add more rows as needed
    (3850, 3840)
  ) AS t(additional_order, parent_order)
)
UPDATE orders o
SET 
  order_type = 'additional',
  parent_order_id = (
    SELECT id FROM orders WHERE order_number = updates.parent_order LIMIT 1
  )
FROM orders_to_update updates
WHERE o.order_number = updates.additional_order;


-- ============================================================================
-- OPTION 3: Set order as additional WITHOUT a parent (standalone add-on)
-- ============================================================================

UPDATE orders
SET order_type = 'additional'
WHERE order_number = 3781;


-- ============================================================================
-- VERIFICATION: Check all additional orders
-- ============================================================================

SELECT 
  o.order_number,
  o.order_type,
  o.customer_name,
  o.table_id,
  t.label as table_label,
  parent.order_number as parent_order_number,
  parent.customer_name as parent_customer,
  o.total,
  o.status,
  o.created_at
FROM orders o
LEFT JOIN orders parent ON o.parent_order_id = parent.id
LEFT JOIN tables t ON o.table_id = t.id
WHERE o.order_type = 'additional'
ORDER BY o.created_at DESC
LIMIT 20;


-- ============================================================================
-- ROLLBACK: Convert additional orders back to initial type
-- ============================================================================

-- Uncomment and run this if you need to undo the changes:
-- UPDATE orders
-- SET 
--   order_type = 'initial',
--   parent_order_id = NULL
-- WHERE order_number = 3781;

