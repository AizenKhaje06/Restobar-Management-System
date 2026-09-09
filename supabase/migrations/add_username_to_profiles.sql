-- ============================================================
-- Migration: Add username field to profiles for staff authentication
-- Date: 2026-09-09
-- Description: Adds username column to support username-based login for staff
-- ============================================================

-- Step 1: Add username column (nullable initially for backward compatibility)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Step 2: Add unique constraint on username
ALTER TABLE profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Step 3: Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username) 
WHERE username IS NOT NULL;

-- Step 4: Auto-generate usernames for existing staff from their email
-- This ensures existing staff accounts continue to work
UPDATE profiles 
SET username = LOWER(split_part(email, '@', 1))
WHERE role IN ('admin', 'pos', 'waiter') 
AND username IS NULL;

-- Step 5: Add constraint that staff MUST have username
-- (Skip this for now to allow gradual migration)
-- We'll enforce this in application logic instead
-- ALTER TABLE profiles
-- ADD CONSTRAINT check_staff_username 
-- CHECK (
--   (role IN ('admin', 'pos', 'waiter') AND username IS NOT NULL) OR
--   (role NOT IN ('admin', 'pos', 'waiter'))
-- );

-- Step 6: Update RLS policies to allow username-based queries
-- No changes needed - existing policies work with username column

-- ============================================================
-- Verification Queries (Run these to verify migration)
-- ============================================================

-- Check if username column exists
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'username';

-- Check existing staff usernames
-- SELECT id, email, username, role, is_active 
-- FROM profiles 
-- WHERE role IN ('admin', 'pos', 'waiter');

-- Check for duplicate usernames (should return 0 rows)
-- SELECT username, COUNT(*) 
-- FROM profiles 
-- WHERE username IS NOT NULL 
-- GROUP BY username 
-- HAVING COUNT(*) > 1;

-- ============================================================
-- Rollback (if needed)
-- ============================================================

-- To rollback this migration:
-- DROP INDEX IF EXISTS idx_profiles_username;
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_unique;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS username;
