# 🚀 Quick Start: Database Migration

## TL;DR - 5 Minute Fix

### What You'll Do
Run 1 SQL file in Supabase to fix broken features

### Where to Run It
Supabase Dashboard → SQL Editor

### Steps
1. Open: https://app.supabase.com → Your Project → SQL Editor
2. Copy entire contents of: `supabase/migrations/01_critical_fixes.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Wait 5-10 seconds
6. ✅ Done!

---

## Verification (30 seconds)

Run this in SQL Editor to verify success:

```sql
-- Should return 0
SELECT COUNT(*) FROM public.table_sessions;

-- Should return 'username'
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'username';

-- Should return 5 rows
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('order_type', 'parent_order_id', 'assisted_by', 'is_notified', 'session_id');
```

**All queries returned results?** ✅ You're done with Step 1!

---

## What This Fixes

✅ Customer QR ordering (was completely broken)  
✅ Username-based login (was failing)  
✅ Additional orders feature (was broken)  
✅ Performance issues (added indexes)  
✅ Security holes (fixed RLS policies)

---

## If Something Goes Wrong

**Error: "relation already exists"**  
→ ✅ It's OK! Already have that table. Continue.

**Error: "column already exists"**  
→ ✅ It's OK! Already have that column. Continue.

**Error: "CREATE INDEX CONCURRENTLY cannot run inside a transaction block"**  
→ ✅ **FIXED!** The file has been updated. Just re-copy and re-run the ENTIRE file.

**Other errors?**  
→ Copy the error message and check `MIGRATION_GUIDE_STEP_1.md` for troubleshooting.

---

## Next Steps

1. ✅ Step 1: Database Migration (YOU ARE HERE)
2. ⏭️ Step 2: Fix Authentication (coming next)
3. ⏭️ Step 3: Security Fixes
4. ⏭️ Step 4: Add Validation

**Full guide:** See `MIGRATION_GUIDE_STEP_1.md`

---

## Need Help?

Check the detailed guide: `MIGRATION_GUIDE_STEP_1.md`

It includes:
- Detailed step-by-step instructions
- Screenshots and examples
- Troubleshooting for every error
- Rollback instructions
- Test procedures
