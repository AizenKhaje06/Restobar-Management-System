-- ============================================================
-- FIX: Allow customers to create their own profile during signup
-- ============================================================
-- Issue: event_customers table was missing INSERT policy for new signups
-- This was blocking customer registration at the database level
-- ============================================================

-- Drop any existing INSERT policies
DROP POLICY IF EXISTS "Customers can create own profile" ON event_customers;
DROP POLICY IF EXISTS "Allow signup" ON event_customers;

-- Allow authenticated users to INSERT their own profile during signup
-- The auth_id must match their authenticated user ID
-- This ensures security: users can only create a profile for themselves
CREATE POLICY "Customers can create own profile" ON event_customers
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- After applying this fix, run this query to verify the policy exists:
--
-- SELECT * FROM pg_policies 
-- WHERE tablename = 'event_customers' 
-- AND policyname = 'Customers can create own profile';
--
-- You should see the new INSERT policy listed
-- ============================================================
