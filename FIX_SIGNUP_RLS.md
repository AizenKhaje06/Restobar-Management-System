# Fix Customer Signup RLS Issue

## Problem
When customers try to create an account at `/events/signup`, they get an RLS policy error. The `event_customers` table is missing an INSERT policy for new user registration.

## Root Cause
The `event_customers` table has these RLS policies:
- ✅ SELECT policy (view own profile)
- ✅ UPDATE policy (update own profile)
- ❌ INSERT policy (CREATE own profile) - **MISSING**

Without an INSERT policy, authenticated users cannot create their customer profile record, blocking the entire signup flow.

## Solution
Apply the SQL fix to add the missing INSERT policy.

---

## Step 1: Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **Restobar Management System** project
4. Click **SQL Editor** in the left sidebar

---

## Step 2: Apply the Fix

1. Click **New Query** button
2. Copy the entire contents of `supabase/fix_event_customers_rls.sql`
3. Paste into the SQL editor
4. Click **Run** (or press Ctrl+Enter)

You should see:
```
Success. No rows returned
```

---

## Step 3: Verify the Fix

Run this verification query in the SQL Editor:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'event_customers' 
AND policyname = 'Customers can create own profile';
```

**Expected Result:**
You should see a row with:
- `policyname`: "Customers can create own profile"
- `cmd`: "INSERT"
- `qual`: null
- `with_check`: "(auth.uid() = auth_id)"

---

## Step 4: Test Signup Flow

1. Go to `http://localhost:3000/events/signup`
2. Fill in the signup form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+63 917 123 4567`
   - Password: `testpassword123`
   - Confirm Password: `testpassword123`
3. Check "I agree to the Terms of Service..."
4. Click **Create Account**

**Expected Result:**
- ✅ Account created successfully
- ✅ Success message showing email verification sent
- ✅ No RLS policy errors

---

## Step 5: Check Your Email

1. Open the email account you used for signup
2. Look for email from Supabase
3. Click the verification link
4. You'll be redirected to confirm your email

---

## Step 6: Test Login

1. Go to `http://localhost:3000/events/login`
2. Enter your email and password
3. Click **Sign In**

**Expected Result:**
- ✅ Successfully logged in
- ✅ Redirected to `/events/dashboard`
- ✅ Can see your profile and booking options

---

## Troubleshooting

### Issue: Still getting RLS error after applying fix

**Solution:** Check if the policy was created correctly:
```sql
SELECT * FROM pg_policies WHERE tablename = 'event_customers';
```

You should see 4 policies:
1. "Customers can view own profile" (SELECT)
2. "Customers can update own profile" (UPDATE)
3. **"Customers can create own profile" (INSERT)** ← New one
4. "Staff can view all event data" (ALL)

### Issue: Email verification not working

**Solution:** Check Supabase Auth settings:
1. Go to **Authentication** → **Settings** in Supabase Dashboard
2. Under "Email Settings", ensure:
   - ✅ Enable Email Signup is ON
   - ✅ Confirm Email is ON (recommended for production)
   - For development, you can turn off "Confirm Email" to skip verification

### Issue: Can't find verification email

**Solutions:**
- Check spam/junk folder
- For development, you can disable email confirmation in Supabase Auth settings
- Use Supabase's email testing feature (Messages tab in Dashboard)

---

## Technical Details

### The Fix SQL

```sql
-- Drop any existing INSERT policies (cleanup)
DROP POLICY IF EXISTS "Customers can create own profile" ON event_customers;

-- Create the missing INSERT policy
CREATE POLICY "Customers can create own profile" ON event_customers
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);
```

### How It Works

1. **User fills signup form** → Form data sent to `createEventCustomer` action
2. **Auth user created** → Supabase Auth creates user with `auth.uid()`
3. **Profile insert** → Insert into `event_customers` with `auth_id = auth.uid()`
4. **RLS check** → Policy verifies `auth.uid() = auth_id` ✅
5. **Success** → Customer profile created, signup complete

### Security

The policy is secure because:
- ✅ Only authenticated users can insert (must have `auth.uid()`)
- ✅ Users can only create profiles for themselves (`auth.uid() = auth_id`)
- ✅ Users cannot create profiles for other users
- ✅ Existing SELECT/UPDATE policies still protect user data

---

## Next Steps After Fix

1. ✅ Apply the RLS fix (this document)
2. Test signup flow end-to-end
3. Test login after email verification
4. Test booking flow with new account
5. Verify customer dashboard shows correctly
6. Test payment proof upload
7. Ready for production! 🎉

---

## Files Modified

- `supabase/fix_event_customers_rls.sql` - The SQL fix
- This guide - `FIX_SIGNUP_RLS.md`

## Related Files

- `app/actions/events.ts` - `createEventCustomer` function (line 36-77)
- `app/events/signup/page.tsx` - Signup form
- `supabase/create_events_system.sql` - Original schema (line 368-400)
