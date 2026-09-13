# 🔐 STEP 2: Fix Authentication
## Secure Staff Account Creation

**Status:** Ready to execute  
**Priority:** P0 - CRITICAL  
**Time:** 30-45 minutes  
**Prerequisites:** ✅ Step 1 completed

---

## 📋 What This Fixes

### Problem
Currently, staff account creation uses `supabase.auth.signUp()` which:
- ❌ Requires email confirmation (users get a verification email)
- ❌ Doesn't work for internal staff accounts (`username@staff.internal`)
- ❌ Admins can't create immediate-use staff accounts
- ❌ Staff can't login with username/password right away

### Solution
Use Supabase **Admin API** with service role key to:
- ✅ Create staff accounts without email confirmation
- ✅ Accounts are active immediately
- ✅ Staff can login with username/password right away
- ✅ Secure admin-only creation

---

## 🎯 Step-by-Step Guide

### Phase 1: Get Your Service Role Key (5 minutes)

#### 1. Open Supabase Dashboard
```
https://app.supabase.com/project/szfvjfvukicjmuxogglt/settings/api
```

#### 2. Find "Service Role Key"
- Look for section: **Project API keys**
- Find the key labeled: **`service_role` secret**
- It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long)

⚠️ **SECURITY WARNING:**
- This key has **FULL DATABASE ACCESS**
- **NEVER** expose it in client-side code
- **NEVER** commit it to Git
- Only use on the **server side**

#### 3. Copy the Key
Click the **Copy** button next to service_role key

---

### Phase 2: Add Key to Environment (2 minutes)

#### 1. Open Your `.env.local` File
Location: `Restobar-Management-System/.env.local`

#### 2. Add This Line at the Bottom:
```env
# Service Role Key (Server-side only - NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### 3. Paste Your Actual Key
Replace `your_service_role_key_here` with the key you copied.

**Example `.env.local` (after):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://szfvjfvukicjmuxogglt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_F0YFhnyT82KlMNny7t3hUg_i89JPklS
PING_MESSAGE=ping pong

# Service Role Key (Server-side only - NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZnZqZnZ1a2ljam11eG9nZ2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTIzNDU2NywiZXhwIjoyMDA2ODEwNTY3fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 4. Save the File
Press `Ctrl+S` (Windows) or `Cmd+S` (Mac)

---

### Phase 3: Create Admin Supabase Client (5 minutes)

#### 1. Create New File: `lib/supabase/admin.ts`

📁 **Path:** `Restobar-Management-System/lib/supabase/admin.ts`

```typescript
/**
 * Supabase Admin Client
 * 
 * WARNING: This client has FULL database access.
 * - Only use on the server side (never in browser code)
 * - Only use for admin operations (staff creation, etc.)
 * - Never expose service role key to client
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase credentials. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  )
}

/**
 * Create an admin Supabase client with service role privileges.
 * 
 * Capabilities:
 * - Bypass Row Level Security (RLS)
 * - Create users without email confirmation
 * - Full database read/write access
 * 
 * Use ONLY for:
 * - Staff account creation
 * - Admin-only operations
 * - Server-side actions
 */
export const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
```

#### 2. Verify File Structure
Your `lib/supabase/` folder should now have:
```
lib/supabase/
├── admin.ts     ← NEW! (admin client)
├── client.ts    (browser client)
├── server.ts    (server client)
└── proxy.ts     (middleware proxy)
```

---

### Phase 4: Update Staff Creation Action (10 minutes)

#### 1. Open File: `app/actions/admin.ts`

#### 2. Add Import at Top (After Other Imports)
Find the imports at the top of the file and add:

```typescript
import { createAdminClient } from "@/lib/supabase/admin"
```

**Should look like:**
```typescript
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"  // ← ADD THIS
import type {
  OrderStatus,
  PaymentMethod,
  ReservationStatus,
} from "@/lib/types"
import { getTaxRate } from "@/lib/settings"
```

#### 3. Find `createStaffAccountAction` Function
Search for: `export async function createStaffAccountAction`

#### 4. Replace Entire Function
Delete the entire `createStaffAccountAction` function and replace with:

```typescript
// ============================================================
// STAFF ACCOUNT CREATION (Direct creation using Admin API)
// ============================================================
export async function createStaffAccountAction(formData: FormData) {
  const supabase = await createClient()

  // Verify admin permission
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Only administrators can create staff accounts" }
  }

  // Extract and validate form data
  const username = ((formData.get("username") as string) || "").trim().toLowerCase()
  const password = (formData.get("password") as string) || ""
  const full_name = ((formData.get("full_name") as string) || "").trim() || null
  const phone = ((formData.get("phone") as string) || "").trim() || null
  const address = ((formData.get("address") as string) || "").trim() || null
  const role = (formData.get("role") as string) || "waiter"

  // Validation
  if (!username) return { error: "Username is required" }
  if (username.length < 3 || username.length > 20) {
    return { error: "Username must be 3-20 characters" }
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "Username can only contain letters, numbers, and underscores" }
  }
  if (!password) return { error: "Password is required" }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }
  if (!["admin", "pos", "waiter"].includes(role)) {
    return { error: "Invalid role" }
  }

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (existingUsername) {
    return { error: "Username already taken" }
  }

  // Generate internal email for staff (users never see this)
  const internalEmail = `${username}@staff.internal`

  // Check if internal email exists (shouldn't happen, but safety check)
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", internalEmail)
    .maybeSingle()

  if (existingEmail) {
    return { error: "An error occurred. Please try a different username." }
  }

  // ✅ CREATE USER WITH ADMIN CLIENT (bypasses email confirmation)
  const adminClient = createAdminClient()
  
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: internalEmail,
    password: password,
    email_confirm: true, // ← Bypass email confirmation
    user_metadata: {
      full_name,
      role,
    },
  })

  if (authError || !authData.user) {
    console.error("[createStaffAccount] Auth error:", authError)
    return { error: authError?.message || "Failed to create account" }
  }

  // Update profile with username and details
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username,
      full_name,
      phone,
      address,
      role,
      is_active: true,
    })
    .eq("id", authData.user.id)

  if (profileError) {
    console.error("[createStaffAccount] Profile update failed:", profileError)
    
    // Rollback: Delete the auth user we just created
    await adminClient.auth.admin.deleteUser(authData.user.id)
    
    return { error: "Failed to create profile: " + profileError.message }
  }

  // Log activity
  await supabase.rpc("log_activity", {
    p_action: "staff.created",
    p_entity: "profile",
    p_entity_id: authData.user.id,
    p_detail: { username, role },
  })

  revalidatePath("/admin/staff")
  return { success: true, username }
}
```

#### 5. Save the File
Press `Ctrl+S` (Windows) or `Cmd+S` (Mac)

---

### Phase 5: Restart Development Server (2 minutes)

Environment variables are loaded when Next.js starts. You **must restart** the server.

#### 1. Stop Current Server
In your terminal, press: `Ctrl+C`

#### 2. Start Server Again
```bash
npm run dev
```

#### 3. Wait for Ready Message
```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
```

---

### Phase 6: Test Staff Creation (10 minutes)

#### Test 1: Create a Waiter Account

1. **Login as Admin**
   - Go to: `http://localhost:3000/login`
   - Enter your admin credentials

2. **Navigate to Staff Page**
   - Click: **Admin** → **Staff Management**
   - Or go to: `http://localhost:3000/admin/staff`

3. **Click "Create Staff Account"**

4. **Fill in Form:**
   - **Username:** `waiter_test`
   - **Password:** `password123`
   - **Full Name:** `Test Waiter`
   - **Phone:** `09171234567`
   - **Role:** `Waiter`

5. **Click "Create Account"**

6. **Expected Result:**
   ```
   ✅ Success! Account created for: waiter_test
   ```

7. **Verify in Staff List:**
   - You should see "Test Waiter" in the staff list
   - Role: Waiter
   - Status: Active

#### Test 2: Login with New Account

1. **Logout** (top-right menu)

2. **Go to Login Page**
   - `http://localhost:3000/login`

3. **Login with Username:**
   - **Username:** `waiter_test`
   - **Password:** `password123`

4. **Expected Result:**
   ```
   ✅ Redirected to Waiter Dashboard
   URL: http://localhost:3000/waiter
   ```

5. **Verify:**
   - You should see the waiter interface
   - Top-right should show: "Test Waiter"

#### Test 3: Create a POS Account

1. **Logout and login as admin again**

2. **Create POS Account:**
   - **Username:** `cashier_test`
   - **Password:** `cashier2024`
   - **Full Name:** `Test Cashier`
   - **Role:** `POS`

3. **Logout and Test Login:**
   - Username: `cashier_test`
   - Password: `cashier2024`
   - Should redirect to: `/pos`

#### Test 4: Verify in Supabase Dashboard

1. **Open Supabase Dashboard**
   ```
   https://app.supabase.com/project/szfvjfvukicjmuxogglt/auth/users
   ```

2. **Check Users List:**
   - You should see `waiter_test@staff.internal`
   - You should see `cashier_test@staff.internal`
   - **Email Confirmed:** ✅ (not pending)

3. **Check Profiles Table:**
   ```
   https://app.supabase.com/project/szfvjfvukicjmuxogglt/editor
   ```
   - Open `profiles` table
   - Find your test users
   - Verify `username` column is populated
   - Verify `role` is correct

---

## ✅ Verification Checklist

Check all that apply:

### Environment Setup
- [ ] Service role key added to `.env.local`
- [ ] File saved (no syntax errors)
- [ ] Development server restarted

### Code Changes
- [ ] `lib/supabase/admin.ts` file created
- [ ] Admin client import added to `app/actions/admin.ts`
- [ ] `createStaffAccountAction` function updated
- [ ] No TypeScript errors in terminal

### Functional Testing
- [ ] Created test waiter account (username-based)
- [ ] Waiter account appears in staff list
- [ ] Logged in with waiter username/password
- [ ] Redirected to `/waiter` dashboard
- [ ] Created test POS account
- [ ] Logged in with POS username/password
- [ ] Redirected to `/pos` terminal

### Database Verification
- [ ] Users appear in Supabase Auth Users list
- [ ] Email confirmed (not pending verification)
- [ ] Profiles have username populated
- [ ] Can login immediately after creation

---

## 🐛 Troubleshooting

### Error: "Missing Supabase credentials"

**Cause:** Service role key not found in environment

**Fix:**
1. Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY=...`
2. Key is on a new line (not commented out with `#`)
3. No spaces around `=` sign
4. Restart dev server: `Ctrl+C` then `npm run dev`

---

### Error: "Invalid API key"

**Cause:** Wrong service role key or using anon key instead

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key (not anon key)
3. Service role key is much longer (~200+ characters)
4. Update `.env.local` with correct key
5. Restart dev server

---

### Error: "Failed to create account"

**Cause:** Database trigger or RLS policy issue

**Fix:**
1. Check browser console (F12) for detailed error
2. Check Supabase logs:
   ```
   https://app.supabase.com/project/szfvjfvukicjmuxogglt/logs/explorer
   ```
3. Verify Step 1 migration completed successfully
4. Run this query in SQL Editor to check profile trigger:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

---

### Error: "Username already taken"

**Cause:** Username exists from previous test

**Fix:**
1. Use a different username
2. Or delete test user:
   - Go to: Supabase Dashboard → Auth → Users
   - Find test user
   - Click "Delete User"
   - Try again

---

### Can't Login After Creation

**Cause:** Profile not updated with username

**Fix:**
1. Check Supabase Dashboard → Table Editor → profiles
2. Find the new user by email (`username@staff.internal`)
3. Verify `username` column is populated
4. If empty, manually update:
   ```sql
   UPDATE profiles
   SET username = 'waiter_test'
   WHERE email = 'waiter_test@staff.internal';
   ```

---

### "Not authenticated" Error

**Cause:** Your admin session expired

**Fix:**
1. Logout
2. Login again as admin
3. Try creating staff account again

---

## 📊 What Changed?

### Files Modified
1. **`.env.local`**
   - Added: `SUPABASE_SERVICE_ROLE_KEY`

2. **`lib/supabase/admin.ts`** (NEW FILE)
   - Admin Supabase client
   - Uses service role key
   - Server-side only

3. **`app/actions/admin.ts`**
   - Updated: `createStaffAccountAction`
   - Now uses `adminClient.auth.admin.createUser()`
   - Bypasses email confirmation with `email_confirm: true`
   - Added rollback on profile error

### Key Improvements

**Before (Step 1):**
```typescript
// ❌ Requires email confirmation
const { data: authData } = await supabase.auth.signUp({
  email: internalEmail,
  password: password,
})
// User created but needs to verify email
// Internal emails can't receive verification emails
// Staff can't login immediately
```

**After (Step 2):**
```typescript
// ✅ Bypasses email confirmation
const adminClient = createAdminClient()
const { data: authData } = await adminClient.auth.admin.createUser({
  email: internalEmail,
  password: password,
  email_confirm: true, // ← Magic happens here
})
// User created and confirmed immediately
// Staff can login right away
```

---

## 🔒 Security Notes

### Service Role Key Security

⚠️ **CRITICAL SECURITY RULES:**

1. **NEVER use in client-side code**
   ```typescript
   // ❌ BAD (client component)
   "use client"
   const adminClient = createAdminClient() // EXPOSED!
   
   // ✅ GOOD (server action)
   "use server"
   const adminClient = createAdminClient() // Safe
   ```

2. **NEVER commit to Git**
   - `.env.local` is in `.gitignore` ✅
   - Never add service key to `.env.example`
   - Never hardcode in source files

3. **NEVER expose in API responses**
   ```typescript
   // ❌ BAD
   return { serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY }
   
   // ✅ GOOD
   return { success: true, username }
   ```

4. **Only use for admin operations**
   - Staff account creation ✅
   - Admin-only bulk operations ✅
   - Regular user queries ❌ (use regular client)

5. **Production deployment**
   - Use Vercel environment variables (not committed)
   - Rotate key if ever exposed
   - Monitor Supabase logs for suspicious activity

---

## 🎯 Next Steps

After completing Step 2:

### Immediate
- [ ] **Delete test accounts** (if you don't need them)
  - `waiter_test@staff.internal`
  - `cashier_test@staff.internal`

### Create Real Staff Accounts
- [ ] Create actual waiter accounts for your staff
- [ ] Create POS/cashier accounts
- [ ] Document usernames in a secure location
- [ ] Give staff their credentials securely (not via email!)

### Continue Migration
- [ ] **Step 3:** Security Fixes (rate limiting, RLS hardening)
- [ ] **Step 4:** Input Validation (Zod schemas)
- [ ] **Step 5:** Production deployment

---

## 📝 Summary

**What You Did:**
1. ✅ Added service role key to environment
2. ✅ Created admin Supabase client
3. ✅ Updated staff creation to use Admin API
4. ✅ Tested staff account creation and login

**What You Fixed:**
- ✅ Staff accounts work immediately (no email confirmation)
- ✅ Username login works for staff
- ✅ Admins can create accounts on-demand
- ✅ Internal emails don't need verification

**Impact:**
- 🚀 Staff onboarding is instant
- 🔐 More secure (no email reliance)
- ⚡ Admin can create accounts in seconds
- ✅ Production-ready staff management

---

**Time to complete:** ~30-45 minutes  
**Difficulty:** Medium (environment + code changes)  
**Status:** Ready to execute

---

## 🆘 Need Help?

If you get stuck:

1. **Check the logs:**
   - Browser console (F12)
   - Terminal (where `npm run dev` is running)
   - Supabase logs (Dashboard → Logs)

2. **Verify environment:**
   ```bash
   # In terminal:
   node -e "console.log(process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Key found!' : 'Key missing!')"
   ```

3. **Common issues:**
   - Forgot to restart dev server → Restart
   - Wrong key copied → Re-check Supabase dashboard
   - Syntax error in code → Check for typos
   - Profile trigger missing → Re-run Step 1 migration

---

**Ready to proceed?** Follow Phase 1 above! 🚀
