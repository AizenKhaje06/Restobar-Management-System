# Database Migration - STEP BY STEP

## ⚠️ IMPORTANT: Do this BEFORE any code changes!

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run Migration
1. Click **"New query"**
2. Copy and paste this ENTIRE script:

```sql
-- Add username column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add unique constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username) 
WHERE username IS NOT NULL;

-- Auto-generate usernames for existing staff
UPDATE profiles 
SET username = LOWER(split_part(email, '@', 1))
WHERE role IN ('admin', 'pos', 'waiter') 
AND username IS NULL;
```

3. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify Migration Worked

Run this verification query:

```sql
SELECT id, email, username, role, is_active 
FROM profiles 
WHERE role IN ('admin', 'pos', 'waiter');
```

**Expected Result:**
- You should see all your staff accounts
- Each should have a `username` column filled in
- Username should be the part before @ in email

### Step 4: Confirm Here

Once you've run the migration and verified it worked, **type "migration done"** and I'll proceed with the code changes.

---

## If Something Goes Wrong

Run this to rollback:
```sql
DROP INDEX IF EXISTS idx_profiles_username;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_unique;
ALTER TABLE profiles DROP COLUMN IF EXISTS username;
```

Then let me know what error you got.
