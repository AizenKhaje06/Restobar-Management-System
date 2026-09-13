# ✅ Step 1 Migration Checklist

Print this page or keep it open while you work!

---

## Pre-Flight ✈️

- [ ] I have Supabase dashboard access
- [ ] I know which project to update
- [ ] I've backed up database (optional but recommended)
- [ ] I've read START_HERE.md or QUICK_START.md
- [ ] Development server is stopped (optional)

**Time Check:** ⏰ Started at: _________

---

## Execute Migration 🚀

- [ ] Opened https://app.supabase.com
- [ ] Selected correct project
- [ ] Clicked "SQL Editor" in sidebar
- [ ] Clicked "New Query" button
- [ ] Opened `supabase/migrations/01_critical_fixes.sql`
- [ ] Copied **ENTIRE** file (all 293 lines)
- [ ] Pasted into SQL Editor
- [ ] Clicked **RUN** button
- [ ] Waited for completion (~10 seconds)
- [ ] Saw "Success" message (or harmless "already exists" errors)

**Time Check:** ⏰ Completed at: _________

---

## Verify Success ✅

Run these queries ONE AT A TIME:

### Query 1: Check table_sessions
```sql
SELECT COUNT(*) FROM public.table_sessions;
```
- [ ] Query ran successfully
- [ ] Result shows: `count: 0`

### Query 2: Check username column
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'username';
```
- [ ] Query ran successfully
- [ ] Result shows: `column_name: username`

### Query 3: Check order columns
```sql
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('order_type', 'parent_order_id', 'assisted_by', 'is_notified', 'session_id');
```
- [ ] Query ran successfully
- [ ] Result shows: `count: 5`

### Query 4: Test functions
```sql
SELECT get_revenue(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);
```
- [ ] Query ran successfully
- [ ] Result shows: `get_revenue: 0` (or any number)

**All verification queries passed?** → ✅ Migration successful!

---

## Test Features 🧪

### Test 1: QR Ordering Flow
- [ ] Visited a table QR code URL
- [ ] Saw "Welcome" modal (not error)
- [ ] Able to enter customer name
- [ ] Able to set access code
- [ ] Session created successfully

### Test 2: Username Login
- [ ] Go to admin panel
- [ ] Create staff account with username
- [ ] Log out
- [ ] Log in using username (not email)
- [ ] Login successful

### Test 3: Check Console
- [ ] Opened browser DevTools (F12)
- [ ] Checked Console tab
- [ ] No red errors about "table_sessions"
- [ ] No red errors about "username"
- [ ] No red errors about "order_type"

**All tests passed?** → ✅ Features working!

---

## Cleanup 🧹

- [ ] Closed unused SQL Editor tabs
- [ ] Restarted dev server (if it was running)
  ```bash
  npm run dev
  # or
  pnpm dev
  ```
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Tested main workflows one more time

---

## Documentation 📝

- [ ] Updated `MIGRATION_PROGRESS.md` - marked Step 1 complete
- [ ] Added completion date to checklist
- [ ] Noted any issues encountered (for team reference)
- [ ] Saved any error messages (if any occurred)

---

## Next Steps ➡️

- [ ] Reviewed what Step 2 involves (see MIGRATION_PROGRESS.md)
- [ ] Scheduled time for Step 2: _________
- [ ] Informed team of Step 1 completion
- [ ] Committed migration file to git (if not already)
  ```bash
  git add supabase/migrations/01_critical_fixes.sql
  git add MIGRATION_PROGRESS.md
  git commit -m "feat: add critical database fixes migration"
  ```

---

## Final Verification 🎯

**Before marking complete, confirm ALL of these:**

✅ Core Features:
- [ ] QR ordering works (no crashes)
- [ ] Username login works (staff can log in)
- [ ] Additional orders work (customers can add items)
- [ ] No database errors in console
- [ ] Application loads without crashes

✅ Database:
- [ ] `table_sessions` table exists
- [ ] `profiles.username` column exists
- [ ] All 5 order columns exist
- [ ] All helper functions work
- [ ] All verification queries passed

✅ Documentation:
- [ ] Step 1 marked complete in MIGRATION_PROGRESS.md
- [ ] This checklist completed
- [ ] Team notified (if applicable)

---

## Sign Off ✍️

**Completed by:** _______________________

**Date:** _________  **Time:** _________

**Issues encountered:**
- [ ] None - smooth migration! ✅
- [ ] Minor issues (describe): ___________________
- [ ] Major issues (describe): ___________________

**Overall experience:**
- [ ] 😊 Easy, worked perfectly
- [ ] 😐 Okay, had some questions
- [ ] 😟 Difficult, needed help

---

## Notes & Observations

_Use this space to record anything useful for next time:_

```
Problem: _________________________________

Solution: _________________________________

Time spent: _________________________________

Additional notes: _________________________________
```

---

## If Things Went Wrong ⚠️

### Error Occurred?
- [ ] Copied exact error message
- [ ] Checked MIGRATION_GUIDE_STEP_1.md troubleshooting
- [ ] Identified which line of SQL failed
- [ ] Reviewed rollback instructions (if needed)

### Need to Rollback?
- [ ] See MIGRATION_GUIDE_STEP_1.md "Rollback" section
- [ ] Ran rollback SQL
- [ ] Verified rollback successful
- [ ] Reported issue for investigation

### Got Help?
- [ ] Documented the solution
- [ ] Added to MIGRATION_GUIDE troubleshooting
- [ ] Thanked whoever helped! 🙏

---

## Success! 🎉

If you checked all boxes above:

```
╔════════════════════════════════════════╗
║                                        ║
║   🎉 CONGRATULATIONS! 🎉               ║
║                                        ║
║   Step 1 Complete!                     ║
║                                        ║
║   ✅ Database fixed                    ║
║   ✅ Features working                  ║
║   ✅ Ready for Step 2                  ║
║                                        ║
║   Time to celebrate! 🍾                ║
║                                        ║
╚════════════════════════════════════════╝
```

**You fixed 3 critical bugs in your system!** 

**What's next?** 
→ Take a break (you earned it!)
→ Then continue to Step 2 when ready

---

## Quick Reference 📖

| If you need | Look here |
|-------------|-----------|
| Quick overview | START_HERE.md |
| 5-min guide | QUICK_START.md |
| Detailed help | MIGRATION_GUIDE_STEP_1.md |
| Visual summary | STEP_1_SUMMARY.md |
| Track progress | MIGRATION_PROGRESS.md |
| Full context | PROJECT_AUDIT_REPORT.md |

---

**Checklist Version:** 1.0  
**Last Updated:** 2026-09-13  
**Migration:** 01_critical_fixes.sql
