# Real-Time Updates Setup Guide

## Problem
Admin Tables page doesn't auto-update when POS creates a new table session (table status doesn't change from Available to Occupied in real-time).

## Solution
Enable Supabase Realtime for the `tables` table.

---

## Step 1: Enable Realtime in Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com/project/szfvjfvukicjmuxogglt/database/publications
2. Find the **supabase_realtime** publication
3. Click on it to edit
4. Make sure the **tables** table is checked/enabled
5. Save changes

### Option B: Using SQL Editor

1. Go to https://app.supabase.com/project/szfvjfvukicjmuxogglt/sql/new
2. Paste this SQL:

```sql
-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;

-- Verify it's enabled
SELECT tablename, schemaname 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'tables';
```

3. Click **Run**
4. You should see `tables` in the results

---

## Step 2: Verify Setup

### Check Browser Console

1. Open Admin account → Tables page
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. You should see:
   ```
   [Admin Tables] Setting up realtime subscription...
   [Admin Tables] Subscription status: SUBSCRIBED
   [Admin Tables] Successfully subscribed to realtime updates
   ```

### Test Real-Time Updates

1. **Open 2 browser windows side by side:**
   - Window 1: Admin account → `/admin/tables`
   - Window 2: POS account → `/pos/tables`

2. **In POS window:**
   - Click on any Available table
   - Start a new session

3. **In Admin window:**
   - The table should automatically change to "Occupied" 
   - You should see a toast notification
   - Console should show: `[Admin Tables] Updated table: T-1 Status: occupied`

---

## Troubleshooting

### Issue: "CHANNEL_ERROR" in console

**Cause:** Realtime is not enabled for the tables table.

**Fix:** Run the SQL migration from Step 1 Option B.

---

### Issue: No console logs appear

**Cause:** Component didn't mount properly or subscription failed.

**Fix:** 
1. Hard refresh the page (Ctrl + Shift + R)
2. Check Network tab for WebSocket connections
3. Look for `wss://szfvjfvukicjmuxogglt.supabase.co/realtime/v1/websocket`

---

### Issue: Table updates but with delay

**Cause:** This is normal. Supabase Realtime has ~100-500ms latency.

**Fix:** This is expected behavior, not a bug.

---

### Issue: Updates work but toast notifications don't appear

**Cause:** Toast system might have issues.

**Fix:** Check if other toasts work (try editing a table manually).

---

## How It Works

1. **POS creates session** → Updates `tables.status = 'occupied'`
2. **Supabase Realtime** → Broadcasts UPDATE event to all subscribed clients
3. **Admin page subscription** → Receives event payload
4. **React state update** → `setLocalTables()` updates the UI
5. **User sees change** → Table card shows "Occupied" badge

---

## Additional Notes

- Real-time updates only work when the page is open
- If admin closes the page and reopens, it will fetch latest data from server
- WebSocket connection auto-reconnects if network drops
- Each browser tab creates its own subscription channel

---

## Files Modified

1. `components/admin/tables-manager.tsx` - Added real-time subscription
2. `supabase/enable_realtime_tables.sql` - SQL migration to enable realtime
3. `lib/supabase/client.ts` - Already existed (no changes needed)

---

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify realtime is enabled (check pg_publication_tables)
- [ ] Open Admin tables page
- [ ] Check console for "Successfully subscribed" message
- [ ] Create new session in POS
- [ ] Verify table updates in Admin page WITHOUT refresh
- [ ] Check toast notification appears
- [ ] Verify console shows status change log
