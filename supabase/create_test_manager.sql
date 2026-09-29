-- =====================================================
-- CREATE TEST LANDING PAGE MANAGER ACCOUNT
-- Username: manager
-- Password: manager123
-- Email: manager@test.com
-- =====================================================

-- This script creates a complete manager account in one go
-- Just copy and paste this entire file into Supabase SQL Editor

-- Step 1: Create the auth user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'manager@test.com',
    crypt('manager123', gen_salt('bf')), -- Password: manager123
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Landing Page Manager"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Step 2: Create the profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    is_active
  ) VALUES (
    new_user_id,
    'manager@test.com',
    'Landing Page Manager',
    'landing_page_manager',
    true
  );

  -- Output success message
  RAISE NOTICE 'Successfully created manager account with email: manager@test.com';
  RAISE NOTICE 'User ID: %', new_user_id;
END $$;

-- Verify the account was created
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles
WHERE email = 'manager@test.com';
