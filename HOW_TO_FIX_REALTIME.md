# How to Fix Real-Time Updates Issue

## The Problem
Kapag nag-create ng session sa POS Tables page (table T-1), hindi agad nag-update yung Admin Tables page. Kailangan i-refresh manually.

## The Solution - Step by Step

### Step 1: Run SQL Migration in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/project/szfvjfvukicjmuxogglt/sql/new

2. **Paste this SQL:**
   ```sql
   -- Enable realtime for tables
   ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;

   -- Verify it worked
   SELECT tablename, schemaname 
   FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'tables';
   ```

3. **Click RUN button**

4. **Check Results:**
   - You should see a row with `tables` and `public` in the results
   - If you see this, realtime is now enabled! ✅

---

### Step 2: Test the Fix

1. **Open 2 Browser Windows:**
   - Window 1: Login as **Admin** → Go to `/admin/tables`
   - Window 2: Login as **POS** → Go to `/pos/tables`

2. **Check Live Indicator (Admin window):**
   - Look at the page header near "Tables & Floor Plan"
   - You should see a **green dot** with "Live" text
   - If you see "Connecting..." or "Offline", there's still an issue

3. **Test Real-Time Update:**
   - **In POS window:** Click any Available table (e.g., T-1)
   - Start a new session (enter name, 6-digit PIN, create)
   - **In Admin window:** Watch the table card
   - It should automatically change to "Occupied" with orange badge
   - You should see a toast notification: "Table T-1 is now occupied"

4. **Check Browser Console:**
   - Press F12 in Admin window
   - Go to Console tab
   - You should see:
     ```
     [Admin Tables] Setting up realtime subscription...
     [Admin Tables] Subscription status: SUBSCRIBED
     [Admin Tables] Successfully subscribed to realtime updates
     [Admin Tables] Updated table: T-1 Status: occupied
     ```

---

### Step 3: Troubleshooting

#### Issue: "Offline" or "Connecting..." status

**Possible Causes:**
1. SQL migration not run yet
2. Supabase project connection issue
3. Browser blocking WebSocket

**Fix:**
1. Make sure you ran the SQL in Step 1
2. Check internet connection
3. Try different browser
4. Check browser console for errors

---

#### Issue: Console shows "CHANNEL_ERROR"

**Cause:** Realtime is not properly enabled for tables table.

**Fix:**
```sql
-- Remove and re-add to force refresh
ALTER PUBLICATION supabase_realtime DROP TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
```

---

#### Issue: Updates work but with 5+ second delay

**Cause:** Multiple subscriptions or network latency.

**Fix:**
1. Close all other tabs with Admin tables page
2. Hard refresh (Ctrl + Shift + R)
3. Check internet speed

---

#### Issue: Green "Live" indicator but no updates

**Cause:** Subscription connected but not receiving events.

**Fix:**
1. Check RLS policies in Supabase
2. Verify admin user has permission to read tables
3. Run this SQL to test:
   ```sql
   UPDATE public.tables 
   SET status = 'occupied' 
   WHERE label = 'T-1';
   ```
4. If admin page updates, it's working! The issue might be with POS not updating the table.

---

### Expected Behavior After Fix

✅ **Admin page shows "Live" indicator (green dot)**  
✅ **When POS creates session → Admin page updates within 1 second**  
✅ **Toast notification appears on status change**  
✅ **Console shows update logs**  
✅ **No page refresh needed**  

---

### How to Verify It's Working

Run this test scenario:

1. Admin opens `/admin/tables` → sees "Live" 🟢
2. POS opens `/pos/tables` 
3. POS clicks table T-1 (Available)
4. POS creates new session (name: "Test", PIN: "123456")
5. **IMMEDIATELY watch Admin page** (don't click anything)
6. Within 1 second: T-1 card should turn orange "Occupied"
7. Toast notification: "Table T-1 is now occupied"

If all 7 steps work = **SUCCESS!** ✅

---

### What Changed in Code

1. **`components/admin/tables-manager.tsx`**
   - Added Supabase realtime subscription
   - Added live status indicator
   - Added console logging for debugging
   - Added toast notifications

2. **`supabase/enable_realtime_tables.sql`**
   - SQL to enable realtime for tables table

3. **No changes needed in POS** - it already updates table status correctly

---

### Notes

- Real-time updates only work when page is open
- Each browser tab creates separate subscription
- WebSocket reconnects automatically if disconnected
- Normal latency: 100-500ms
- Maximum expected latency: 2 seconds

---

### Still Not Working?

If after following all steps it still doesn't work:

1. **Check Supabase Dashboard:**
   - Go to Settings → API
   - Make sure project is not paused
   - Check if realtime is enabled (should be on by default)

2. **Check `.env.local` file:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

3. **Clear browser cache:**
   - Ctrl + Shift + Delete
   - Clear all cache
   - Restart browser

4. **Restart dev server:**
   ```bash
   # Stop the dev server
   # Then restart:
   npm run dev
   ```

---

## Quick Test Command

Paste this in Supabase SQL Editor to manually trigger an update:

```sql
-- This should make T-1 occupied on Admin page
UPDATE public.tables 
SET status = 'occupied', updated_at = now()
WHERE label = 'T-1';

-- Wait 1-2 seconds, check Admin page

-- Then set it back to available
UPDATE public.tables 
SET status = 'available', updated_at = now()
WHERE label = 'T-1';
```

If the Admin page updates when you run these, **realtime is working!** 🎉
