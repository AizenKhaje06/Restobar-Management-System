-- =====================================================
-- CREATE LANDING PAGE MANAGER ACCOUNT
-- Run this to create a test manager account
-- =====================================================

-- Step 1: First, create an auth user in Supabase Auth Dashboard
-- Go to: Authentication → Users → Add user
-- Email: manager@example.com
-- Password: (set a password)
-- Then copy the user ID and use it below

-- Step 2: Create the profile with landing_page_manager role
-- Replace 'USER_ID_FROM_SUPABASE_AUTH' with the actual UUID from step 1

INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  'USER_ID_FROM_SUPABASE_AUTH'::uuid, -- ⚠️ REPLACE THIS with actual user ID
  'manager@example.com',
  'Content Manager',
  'landing_page_manager',
  true
)
ON CONFLICT (id) DO UPDATE
SET role = 'landing_page_manager',
    full_name = 'Content Manager',
    is_active = true;

-- OR if you want to update an existing user to be a manager:
-- UPDATE profiles 
-- SET role = 'landing_page_manager'
-- WHERE email = 'existing.user@example.com';

-- Verify the account was created/updated
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles
WHERE role = 'landing_page_manager'
ORDER BY created_at DESC
LIMIT 5;

