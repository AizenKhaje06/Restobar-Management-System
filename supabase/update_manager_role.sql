-- =====================================================
-- UPDATE MANAGER ACCOUNT ROLE
-- Change waiter role to landing_page_manager
-- =====================================================

-- Update the role in profiles table
UPDATE profiles
SET role = 'landing_page_manager',
    full_name = 'Landing Page Manager'
WHERE email = 'manager@test.com';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles
WHERE email = 'manager@test.com';
