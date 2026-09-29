-- =====================================================
-- CREATE LANDING PAGE MANAGER ACCOUNT
-- Run this to create a test manager account
-- =====================================================

-- Create a landing page manager account
INSERT INTO profiles (
  id,
  full_name,
  role,
  pin,
  is_active
) VALUES (
  gen_random_uuid(),
  'Content Manager',
  'landing_page_manager',
  '111111', -- ⚠️ CHANGE THIS PIN!
  true
)
ON CONFLICT (id) DO NOTHING;

-- Verify the account was created
SELECT 
  id,
  full_name,
  role,
  pin,
  is_active,
  created_at
FROM profiles
WHERE role = 'landing_page_manager'
ORDER BY created_at DESC
LIMIT 5;
