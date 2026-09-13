# 🚀 Step 1: Database Migration Guide

## Overview
This migration fixes **critical database schema issues** that are preventing core features from working:
- ❌ Customer QR ordering (missing `table_sessions` table)
- ❌ Username-based login (missing `username` column)
- ❌ Additional orders (missing order columns)

**Estimated Time:** 15-20 minutes  
**Difficulty:** Easy  
**Risk Level:** Low (only adds new tables/columns, doesn't modify existing data)

---

## Prerequisites

Before you begin, make sure you have:
- [ ] Access to your Supabase project dashboard
- [ ] Database credentials (or logged into Supabase)
- [ ] No active users on the system (recommended but not required)

---

## Step-by-Step Instructions

### 1. **Backup Your Database** (Recommended)

Even though this migration is safe, always backup first:

#### Option A: Via Supabase Dashboard (Easiest)
1. Go to your Supabase project: https://app.supabase.com
2. Click on your project
3. Navigate to **Settings** → **Database**
4. Scroll to **Database Backups**
5. Click **Create Backup** (if on paid plan)

#### Option B: Manual Export
```bash
# If you have direct database access
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres -F c -f backup_$(date +%Y%m%d).dump
```

---

### 2. **Open Supabase SQL Editor**

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

---

### 3. **Run the Migration**

1. Open the file: `supabase/migrations/01_critical_fixes.sql`
2. **Copy the ENTIRE contents** of the file
3. **Paste** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

**Expected Output:**
```
Success. No rows returned
```

**⏱️ This should take 5-10 seconds to complete.**

---

### 4. **Verify Migration Success**

Run these verification queries **one at a time** in the SQL Editor:

#### Query 1: Check table_sessions exists
```sql
SELECT COUNT(*) as session_count FROM public.table_sessions;
```
**Expected Output:** `session_count: 0` (empty table is correct)

#### Query 2: Check profiles.username column
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'username';
```
**Expected Output:** 
```
column_name: username
data_type: text
```

#### Query 3: Check orders new columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('order_type', 'parent_order_id', 'assisted_by', 'is_notified', 'session_id')
ORDER BY column_name;
```
**Expected Output:** All 5 columns should be listed

#### Query 4: Test helper functions
```sql
-- Should return 0 (no revenue yet, but function works)
SELECT get_revenue(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE) as weekly_revenue;
```
**Expected Output:** `weekly_revenue: 0`

---

### 5. **Check for Errors**

If you see any errors during migration:

#### Error: "relation already exists"
**Solution:** This is OK! It means the table was already created. Continue with verification.

#### Error: "column already exists"
**Solution:** This is OK! The migration uses `IF NOT EXISTS` to be safe. Continue with verification.

#### Error: "permission denied"
**Solution:** 
1. Make sure you're logged in as the project owner
2. Try running the migration in smaller chunks
3. Contact Supabase support if issue persists

#### Other Errors
**Solution:**
1. Copy the exact error message
2. Check which line failed
3. Open an issue or contact me with the error details

---

## 6. **Update Local Environment** (Optional but Recommended)

If you're running a local Supabase instance for development:

```bash
# Navigate to project directory
cd /path/to/restobar-management-system

# Apply migration locally
supabase db reset  # WARNING: This clears local data
# OR
supabase db push  # Push migration to local instance
```

---

## 7. **Test the Fixed Features**

### Test 1: Username Login
1. Go to your admin panel
2. Create a new staff account with a username (e.g., "john_doe")
3. Log out
4. Try logging in with the username (not email)
5. ✅ Should work!

### Test 2: QR Ordering (Basic)
1. Visit any table QR code URL
2. You should see the "Welcome" modal
3. Try creating a session
4. ✅ Should work without errors!

### Test 3: Database Functions
```sql
-- Test revenue function
SELECT get_revenue('2024-01-01'::date, CURRENT_DATE) as total_revenue;

-- Test top items function
SELECT * FROM get_top_items('2024-01-01'::date, CURRENT_DATE, 10);
```

---

## Troubleshooting

### Issue: Migration runs but features still broken

**Possible Causes:**
1. Browser cache - Clear cache and hard reload (Ctrl+Shift+R)
2. App needs restart - Restart your Next.js dev server
3. RLS policies not updated - Re-run the migration

**Solution:**
```bash
# Restart dev server
npm run dev
# Or
pnpm dev
```

### Issue: "Cannot find table_sessions"

**Solution:**
The migration didn't complete. Check:
1. Did you run the ENTIRE migration file?
2. Were there any errors in the SQL output?
3. Try running just the table_sessions section:

```sql
CREATE TABLE IF NOT EXISTS public.table_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  access_code text NOT NULL CHECK (access_code ~ '^\d{4}$'),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  closed_reason text CHECK (closed_reason IN ('paid', 'cancelled', 'timeout')),
  closed_at timestamptz,
  closed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
```

---

## What Changed?

### New Tables
✅ `table_sessions` - Manages customer dining sessions with access codes

### New Columns
✅ `profiles.username` - Username for staff login  
✅ `orders.order_type` - Distinguishes initial vs additional orders  
✅ `orders.parent_order_id` - Links additional orders to main order  
✅ `orders.assisted_by` - Tracks which waiter helped  
✅ `orders.is_notified` - Notification flag for additional orders  
✅ `orders.session_id` - Links orders to table sessions

### New Indexes
✅ 11 new indexes for performance optimization

### New Functions
✅ `get_table_active_orders()` - Count active orders for a table  
✅ `get_revenue()` - Calculate revenue for date range  
✅ `get_top_items()` - Get best-selling menu items  
✅ `get_session_summary()` - Get session totals

### Updated Policies
✅ Fixed insecure reservation policy  
✅ Improved orders access control  
✅ Added session-based ordering

---

## What to Do Next?

After successful migration:

1. ✅ Mark Step 1 as **COMPLETE**
2. 🔄 Continue to **Step 2: Fix Authentication**
   - See: `MIGRATION_GUIDE_STEP_2.md` (coming next)
3. 📝 Update your team about the changes
4. 🧪 Run a quick smoke test of key features

---

## Rollback (If Needed)

If something goes terribly wrong and you need to undo:

```sql
-- DANGER: Only run if you need to rollback
BEGIN;

-- Drop new table
DROP TABLE IF EXISTS public.table_sessions CASCADE;

-- Remove new columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS username;
ALTER TABLE public.orders DROP COLUMN IF EXISTS order_type;
ALTER TABLE public.orders DROP COLUMN IF EXISTS parent_order_id;
ALTER TABLE public.orders DROP COLUMN IF EXISTS assisted_by;
ALTER TABLE public.orders DROP COLUMN IF EXISTS is_notified;
ALTER TABLE public.orders DROP COLUMN IF EXISTS session_id;

-- Drop new functions
DROP FUNCTION IF EXISTS get_table_active_orders(uuid);
DROP FUNCTION IF EXISTS get_revenue(date, date);
DROP FUNCTION IF EXISTS get_top_items(date, date, int);
DROP FUNCTION IF EXISTS get_session_summary(text);

COMMIT;
```

**Note:** This won't harm existing data, only removes the new structures.

---

## Support

If you encounter issues:
1. Check the verification queries above
2. Review the error messages carefully
3. Feel free to ask for help with specific error messages
4. Include the output of verification queries when asking for help

---

## ✅ Completion Checklist

Before moving to Step 2, confirm:

- [ ] Migration ran without errors
- [ ] All verification queries passed
- [ ] `table_sessions` table exists
- [ ] `profiles.username` column exists
- [ ] All 5 new order columns exist
- [ ] Helper functions work
- [ ] Features tested and working
- [ ] No errors in application logs

**If all checkboxes are ✅, you're ready for Step 2!**

---

**Next:** [Step 2: Fix Authentication →](MIGRATION_GUIDE_STEP_2.md)
