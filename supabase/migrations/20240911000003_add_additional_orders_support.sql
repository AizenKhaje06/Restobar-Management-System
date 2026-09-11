-- Add support for additional orders (customers ordering more items while dining)
-- This allows customers to place follow-up orders via QR menu that go directly to kitchen

-- Create order_type enum to distinguish initial vs additional orders
DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('initial', 'additional');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add order_type column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_type order_type NOT NULL DEFAULT 'initial';

-- Add parent_order_id to link additional orders to the original/initial order
-- This helps track all orders for the same dining session/table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Add index for faster queries on order relationships
CREATE INDEX IF NOT EXISTS idx_orders_parent_order_id ON orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);

-- Add composite index for finding all orders in a session (initial + additional)
CREATE INDEX IF NOT EXISTS idx_orders_table_session ON orders(table_id, session_id) 
WHERE status NOT IN ('cancelled', 'completed');

-- Add is_notified flag to track if staff has been notified about additional orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS is_notified BOOLEAN NOT NULL DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN orders.order_type IS 'Type of order: initial (first order at table) or additional (follow-up order)';
COMMENT ON COLUMN orders.parent_order_id IS 'Links additional orders to their parent initial order for billing';
COMMENT ON COLUMN orders.is_notified IS 'Whether staff has been notified about this additional order';

-- Create a view for easy querying of order families (initial + all additional orders)
CREATE OR REPLACE VIEW order_families AS
SELECT 
  COALESCE(o.parent_order_id, o.id) AS family_id,
  o.id AS order_id,
  o.order_number,
  o.order_type,
  o.table_id,
  o.session_id,
  o.customer_name,
  o.status,
  o.payment_status,
  o.subtotal,
  o.tax,
  o.total,
  o.created_at,
  o.is_notified,
  -- Calculate family totals
  SUM(o.total) OVER (PARTITION BY COALESCE(o.parent_order_id, o.id)) AS family_total,
  COUNT(*) OVER (PARTITION BY COALESCE(o.parent_order_id, o.id)) AS orders_in_family
FROM orders o
WHERE o.status != 'cancelled';

COMMENT ON VIEW order_families IS 'Groups orders by family (initial + additional orders) for easy billing and tracking';

-- Function to get the root/initial order for any order (handles nested relationships)
CREATE OR REPLACE FUNCTION get_initial_order_id(order_id UUID)
RETURNS UUID AS $$
DECLARE
  parent_id UUID;
  initial_id UUID;
BEGIN
  -- Get the parent_order_id for this order
  SELECT parent_order_id INTO parent_id
  FROM orders
  WHERE id = order_id;
  
  -- If no parent, this IS the initial order
  IF parent_id IS NULL THEN
    RETURN order_id;
  END IF;
  
  -- Otherwise, recursively find the root
  -- (shouldn't be nested in practice, but handle it anyway)
  RETURN get_initial_order_id(parent_id);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_initial_order_id IS 'Returns the initial/root order ID for any order, even if nested';
