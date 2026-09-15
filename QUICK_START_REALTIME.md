# 🚀 Quick Start: Enable Real-Time Updates

## ⚡ 1-Minute Setup

### Step 1: Run SQL in Supabase
1. Go to your Supabase Dashboard → **SQL Editor**
2. Copy ALL content from file: `supabase/enable_realtime_tables.sql`
3. Paste and click **RUN**
4. You should see:
   ```
   ✓ Realtime enabled for public.tables
   ✓ Realtime enabled for public.orders  
   ✓ Realtime enabled for public.table_sessions
   ```

### Step 2: Test It!
Open **2 browser tabs** side by side:

#### Test POS Orders
- **Tab 1**: `/pos/orders` (view orders)
- **Tab 2**: `/pos/orders` (change order status)
- **Result**: Tab 1 updates automatically ✅

#### Test POS Tables  
- **Tab 1**: `/pos/tables` (view tables)
- **Tab 2**: `/pos/tables` (start/cancel session)
- **Result**: Tab 1 table status changes automatically ✅

#### Test Admin Tables
- **Tab 1**: `/admin/tables` (look for green dot = "Live")
- **Tab 2**: `/admin/tables` (change table status)
- **Result**: Tab 1 shows toast + updates ✅

---

## 🎉 That's It!

No more manual refreshing. Updates happen automatically in the background using WebSocket connections.

---

## 🐛 Troubleshooting

**Not working?** Open browser Console (F12) and check for:
- `[POS Orders] Order change: UPDATE` 
- `[POS Tables] Table change: UPDATE`
- `[Admin Tables] Realtime status: connected`

**Still not working?**
1. Make sure you ran the SQL in Supabase
2. Check that Realtime is enabled in your Supabase project settings
3. Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📖 Full Documentation

See `REALTIME_STATUS.md` for complete technical details.
