# Quick Fix Guide - Table Status Issues

## Problem Summary
Hindi accurate ang table status sa Admin Tables page compared sa POS Orders page.

## One-Step Fix

### Run this SQL in Supabase Dashboard:

1. Open: https://app.supabase.com/project/szfvjfvukicjmuxogglt/sql/new
2. Copy and paste: `supabase/APPLY_ALL_FIXES.sql`
3. Click **RUN**
4. Wait for success messages

### What it fixes:
✅ Realtime updates for Admin Tables page  
✅ Syncs all table statuses with actual sessions  
✅ Creates automatic triggers for future sync  
✅ Fixes payment "max(uuid)" error  

### Expected Result:
```
✓ ALL FIXES APPLIED SUCCESSFULLY!
```

## Verify the Fix

1. **Refresh Admin Tables page** - Only tables with active orders should show "Occupied"
2. **Check POS Orders page** - Should match Admin page statuses
3. **Test real-time** - Create new session, watch Admin page update automatically

## Files Created

- `supabase/APPLY_ALL_FIXES.sql` - Run this ONE time
- `FIX_TABLE_STATUS_SYNC.md` - Detailed documentation
- `HOW_TO_FIX_REALTIME.md` - Realtime troubleshooting guide

## Still Have Issues?

Check the detailed guides:
- Table sync issues → `FIX_TABLE_STATUS_SYNC.md`
- Realtime not working → `HOW_TO_FIX_REALTIME.md`
- Payment errors → `supabase/fix_max_uuid_error.sql`

---

**Ang POS Orders page ang accurate** - yan ang basehan kung sino talaga ang may active sessions. After running the fix, lahat ng pages mag-match na. 🎯
