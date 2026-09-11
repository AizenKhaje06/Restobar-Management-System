-- Add assisted_by column to track which waiter took/assisted the customer with the order
-- This complements served_by which tracks who physically served the food

-- Add assisted_by column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS assisted_by UUID REFERENCES profiles(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_assisted_by ON orders(assisted_by);

-- Add foreign key constraint with a named constraint for easier reference
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_assisted_by_fkey;

ALTER TABLE orders
ADD CONSTRAINT orders_assisted_by_fkey
FOREIGN KEY (assisted_by)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- Add similar constraint for served_by if not already properly set up
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_served_by_fkey;

ALTER TABLE orders
ADD CONSTRAINT orders_served_by_fkey
FOREIGN KEY (served_by)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN orders.assisted_by IS 'Waiter who assisted the customer and took the order (claimed/took responsibility)';
COMMENT ON COLUMN orders.served_by IS 'Waiter who physically served the food to the customer';
