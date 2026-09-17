# Device Tracking Security - Setup Guide

## Overview
This feature prevents customers from scanning multiple tables with the same mobile device by implementing device fingerprinting and session tracking.

## What's Been Implemented

### 1. Device Fingerprinting (`lib/device-fingerprint.ts`)
- Client-side browser fingerprinting using device characteristics
- Generates unique ID based on: screen resolution, timezone, language, platform, user agent
- Stores fingerprint in localStorage for persistence

### 2. Database Migration (`supabase/add_device_tracking.sql`)
- Adds `device_id` column to `table_sessions` table
- Creates index for fast device lookups
- Ready to apply to your database

### 3. Backend Logic (`app/actions/table-sessions.ts`)
- Updated `createTableSession()` to accept and store device_id
- Checks if device has active session on different table before creating new session
- Returns error with existing table info if conflict detected

### 4. Frontend Integration (`app/order/page.tsx`)
- Generates device fingerprint on page load
- Checks for device conflicts before showing session modals
- Displays professional warning modal if device has active session elsewhere
- Passes device_id when creating new session

### 5. API Route (`app/api/table-sessions/route.ts`)
- Updated to pass device_id to backend action

## Setup Instructions

### Step 1: Apply Database Migration

You need to run the SQL migration to add the device_id column. Choose one of these methods:

#### Option A: Supabase Dashboard (Recommended)
1. Go to https://app.supabase.com/project/szfvjfvukicjmuxogglt/editor
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase/add_device_tracking.sql`
5. Click "Run" to execute

#### Option B: Supabase CLI
```bash
# If you have Supabase CLI installed
npx supabase db push

# Or run the migration directly
psql "postgresql://postgres:[YOUR-PASSWORD]@db.szfvjfvukicjmuxogglt.supabase.co:5432/postgres" -f supabase/add_device_tracking.sql
```

### Step 2: Verify Migration
Run this query in Supabase SQL Editor to verify the column was added:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'table_sessions' AND column_name = 'device_id';
```

Expected result:
```
column_name | data_type | is_nullable
device_id   | text      | YES
```

### Step 3: Test the Feature

1. **Test Normal Flow:**
   - Open your restaurant app in a mobile browser
   - Scan a table QR code (e.g., Table 1)
   - Create a session successfully
   - Verify session works normally

2. **Test Security Feature:**
   - While still having an active session on Table 1
   - Try to scan a DIFFERENT table's QR code (e.g., Table 2)
   - You should see a red warning modal: "Active Session Detected"
   - The modal should show your current active table (Table 1)
   - Confirm you cannot create a new session

3. **Test Session Completion:**
   - Have staff process payment for Table 1 (closes session)
   - Now try scanning Table 2's QR code
   - You should be able to create a new session successfully

## How It Works

```
Customer Scans QR Code
        ↓
Generate Device Fingerprint
        ↓
Check Database for Active Sessions
        ↓
    ┌───────┴───────┐
    ↓               ↓
Has Active     No Active
Session on     Session
Different      Anywhere
Table              ↓
    ↓          Allow Session
Show Warning   Creation
Modal              ↓
    ↓          Store device_id
Block New      with Session
Session
```

## Security Benefits

1. **Prevents Confusion:** Customers can't accidentally have orders going to multiple tables
2. **Accurate Billing:** Ensures all orders from a device go to the correct table
3. **Fraud Prevention:** Makes it harder for customers to abuse the system
4. **Better UX:** Clear feedback when trying to scan multiple tables

## Privacy Considerations

- Device fingerprint is **anonymous** - no personal data collected
- Fingerprint uses only browser characteristics (screen size, timezone, etc.)
- No tracking across sessions or restaurants
- Stored only in browser's localStorage
- Automatically cleared when session is closed (optional enhancement)

## Optional Enhancements

### Auto-clear Device Fingerprint After Session
Add this to the payment processing function:
```typescript
// After closing session
if (typeof window !== "undefined") {
  localStorage.removeItem("device_fp")
}
```

### Admin Override
Allow staff to manually clear a device's active session in case of emergencies:
```sql
-- Clear device_id from a specific session
UPDATE table_sessions
SET device_id = NULL
WHERE id = 'session-id-here';
```

## Troubleshooting

### Issue: Warning shows even though I don't have an active session
**Solution:** The previous session might not have been closed properly. Ask staff to check and close any open sessions for your table.

### Issue: Can't create session at all
**Solution:** Check the browser console for errors. Clear localStorage and try again:
```javascript
localStorage.clear()
```

### Issue: Multiple devices at same table can't join
**Solution:** This is working as intended! Each device should join the SAME session using the 6-digit access code, not create separate sessions.

## Files Modified

- ✅ `lib/device-fingerprint.ts` (NEW)
- ✅ `supabase/add_device_tracking.sql` (NEW)
- ✅ `app/actions/table-sessions.ts` (MODIFIED)
- ✅ `app/order/page.tsx` (MODIFIED)
- ✅ `app/api/table-sessions/route.ts` (MODIFIED)

## Next Steps

1. Apply the database migration (see Step 1 above)
2. Test the feature thoroughly
3. Deploy to production when ready
4. Monitor for any edge cases

---

**Status:** ✅ Implementation Complete - Ready for Database Migration
