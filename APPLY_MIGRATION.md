# Apply Payment Status Sync Migration

## What this migration does:
1. Updates all existing orders with status="completed" to have payment_status="paid"
2. Creates a database trigger that automatically syncs payment_status to "paid" when order status changes to "completed"

## How to apply:

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire content of this file:
   `supabase/migrations/20240911000000_sync_completed_status_with_paid.sql`
5. Click "Run" button
6. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

## Verify it worked:
1. Go to SQL Editor
2. Run this query:
```sql
-- Check if existing orders were updated
SELECT id, order_number, status, payment_status 
FROM orders 
WHERE status = 'completed';
```
All completed orders should now have payment_status = 'paid'

3. Check if trigger was created:
```sql
-- Check if trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_completed_order_payment';
```
Should return 1 row with the trigger name.

## After applying:
- All future orders that are marked as "completed" will automatically have payment_status set to "paid"
- This fixes the issue where completed orders were showing up in the "unpaid" filter instead of "paid" filter
