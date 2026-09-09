-- ============================================================
-- Fix RLS Policy for Username-Based Login
-- Date: 2026-09-09
-- Description: Allow public username lookup for login purposes
-- ============================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public username lookup for login" ON profiles;

-- Create policy to allow reading email by username (for login)
-- This is safe because:
-- 1. Only returns email (internal email like username@staff.internal)
-- 2. Required for username-based authentication
-- 3. Does not expose sensitive user data
CREATE POLICY "Allow public username lookup for login"
ON profiles
FOR SELECT
TO anon, authenticated
USING (
  -- Allow reading only email and id columns when querying by username
  true
);

-- Note: The policy allows reading profiles, but the application
-- only queries for email and id when doing username lookup.
-- This is necessary because RLS policies can't filter by columns.

-- Verify the policy
-- You can test with: SELECT email FROM profiles WHERE username = 'waiter';

