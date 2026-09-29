-- =====================================================
-- FIX RLS POLICIES FOR LANDING PAGE MANAGER
-- Grant access to all landing page related tables
-- =====================================================

-- Enable RLS on tables if not already enabled
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Landing page managers can view all bookings" ON event_bookings;
DROP POLICY IF EXISTS "Landing page managers can update bookings" ON event_bookings;
DROP POLICY IF EXISTS "Landing page managers can view packages" ON event_packages;
DROP POLICY IF EXISTS "Landing page managers can view venues" ON event_venues;
DROP POLICY IF EXISTS "Landing page managers can view customers" ON event_customers;

-- Event Bookings: Landing page managers can view and update all bookings
CREATE POLICY "Landing page managers can view all bookings"
ON event_bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
);

CREATE POLICY "Landing page managers can update bookings"
ON event_bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
);

-- Event Packages: Landing page managers can view all packages
CREATE POLICY "Landing page managers can view packages"
ON event_packages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
);

-- Event Venues: Landing page managers can view all venues
CREATE POLICY "Landing page managers can view venues"
ON event_venues FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
);

-- Event Customers: Landing page managers can view all customers
CREATE POLICY "Landing page managers can view customers"
ON event_customers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
);

-- Online Orders: Landing page managers can view and update all orders
-- Note: Check if online_orders table exists first
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'online_orders') THEN
    ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Landing page managers can view orders" ON online_orders;
    DROP POLICY IF EXISTS "Landing page managers can update orders" ON online_orders;
    
    CREATE POLICY "Landing page managers can view orders"
    ON online_orders FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'landing_page_manager'
      )
    );

    CREATE POLICY "Landing page managers can update orders"
    ON online_orders FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'landing_page_manager'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'landing_page_manager'
      )
    );
  END IF;
END $$;

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'event_bookings',
  'event_packages',
  'event_venues',
  'event_customers',
  'online_orders'
)
AND policyname LIKE '%Landing page managers%'
ORDER BY tablename, policyname;
