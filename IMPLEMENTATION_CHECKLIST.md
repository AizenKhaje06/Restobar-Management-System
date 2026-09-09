# Staff Authentication Redesign - Implementation Checklist

**IMPORTANT:** Follow this checklist IN ORDER. Do not skip steps.

## ✅ Pre-Implementation Checklist

- [ ] Backup current database
- [ ] Backup all modified files
- [ ] Test in development environment first
- [ ] Have admin credentials ready for testing

---

## Phase 1: Database Migration (MUST DO FIRST!)

### Step 1.1: Run SQL Migration
**Location:** `supabase/migrations/add_username_to_profiles.sql`

**Instructions:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `add_username_to_profiles.sql`
3. Run the migration
4. **Verify:** Check that username column exists
5. **Verify:** Existing staff have auto-generated usernames

**Verification Queries:**
```sql
-- Should show username column
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'username';

-- Should show usernames for all staff
SELECT id, email, username, role, is_active 
FROM profiles 
WHERE role IN ('admin', 'pos', 'waiter');
```

**Expected Result:**
- ✅ Column `username` exists (TEXT, nullable)
- ✅ All staff have usernames (from email prefix)
- ✅ Unique constraint works

**⚠️ STOP HERE if migration fails. Do not proceed until fixed.**

---

## Phase 2: Backend Changes

### Step 2.1: Update TypeScript Types
**File:** `lib/types.ts`

- [ ] Add `username?: string | null` to Profile type
- [ ] Verify no TypeScript errors

### Step 2.2: Create Staff Account Action
**File:** `app/actions/admin.ts`

- [ ] Add `createStaffAccountAction()` function
- [ ] Validate admin permission
- [ ] Create user with Supabase Admin API
- [ ] Set username in profile
- [ ] Test function independently

### Step 2.3: Update Login Action  
**File:** `app/actions/auth.ts`

- [ ] Add username-based login support
- [ ] Keep email-based login working
- [ ] Test both login methods

### Step 2.4: Add Helper Functions
**File:** `lib/auth.ts`

- [ ] Add `getEmailFromUsername()` function
- [ ] Add username validation function
- [ ] Test helpers independently

**⚠️ Test each backend change before moving to frontend.**

---

## Phase 3: Frontend Changes

### Step 3.1: Update Staff Manager Component
**File:** `components/admin/staff-manager.tsx`

**Changes:**
- [ ] Create new "Add Staff Account" dialog component
- [ ] Add username input field (required for staff)
- [ ] Add password input field (required, min 8 chars)
- [ ] Add password confirmation field
- [ ] Remove email field for staff creation
- [ ] Update form submission to use new action
- [ ] Keep existing edit dialog working
- [ ] Test: Create a test staff account

**⚠️ DO NOT delete old code yet. Comment it out for safety.**

### Step 3.2: Update Login Page
**File:** `app/login/page.tsx` or login component

**Changes:**
- [ ] Change label from "Email" to "Username or Email"
- [ ] Update form validation (accept both formats)
- [ ] Update submit handler to use new login action
- [ ] Add helper text: "Staff: use username"
- [ ] Test: Login with username (staff)
- [ ] Test: Login with email (customer)

### Step 3.3: Update Signup Page
**File:** `app/signup/page.tsx`

**Changes:**
- [ ] Add info banner about staff accounts
- [ ] Clarify "Customer signup only"
- [ ] Keep all existing functionality
- [ ] Test: Signup as customer still works

---

## Phase 4: Testing (CRITICAL)

### Test 4.1: Staff Account Creation
- [ ] Login as admin
- [ ] Go to `/admin/staff`
- [ ] Click "Create Staff Account"
- [ ] Fill all required fields (username, password, role)
- [ ] Submit form
- [ ] Verify: Success notification appears
- [ ] Verify: New staff appears in list
- [ ] Verify: Username is unique (try duplicate)

### Test 4.2: Staff Login with Username
- [ ] Logout
- [ ] Go to `/login`
- [ ] Enter staff username (not email)
- [ ] Enter password
- [ ] Click Login
- [ ] Verify: Login successful
- [ ] Verify: Redirected to correct dashboard (based on role)

### Test 4.3: Customer Login with Email
- [ ] Logout
- [ ] Go to `/login`  
- [ ] Enter customer email
- [ ] Enter password
- [ ] Click Login
- [ ] Verify: Login successful
- [ ] Verify: Customer features work

### Test 4.4: Customer Signup
- [ ] Logout
- [ ] Go to `/signup`
- [ ] Fill signup form (email, password, name)
- [ ] Submit
- [ ] Verify: Account created
- [ ] Verify: Can login with email

### Test 4.5: Existing Accounts
- [ ] Test: Existing admin can still login (with email or username)
- [ ] Test: Existing staff can login (with email or username)
- [ ] Test: Existing customers can login (with email)

### Test 4.6: Permissions
- [ ] Test: Non-admin cannot access staff creation
- [ ] Test: Staff cannot create other staff
- [ ] Test: Customer cannot access admin pages

### Test 4.7: Edge Cases
- [ ] Test: Invalid username format
- [ ] Test: Duplicate username
- [ ] Test: Weak password
- [ ] Test: Username with special characters
- [ ] Test: Case sensitivity (username should be case-insensitive)

---

## Phase 5: Cleanup (After All Tests Pass)

### Step 5.1: Remove Old Code
- [ ] Remove staff invitation system code (if not needed)
- [ ] Remove commented-out code
- [ ] Update documentation

### Step 5.2: Update User Documentation
- [ ] Document new staff creation process
- [ ] Document login process for staff vs customers
- [ ] Update admin guide

---

## Rollback Plan (If Something Goes Wrong)

### If Database Migration Fails:
```sql
-- Rollback SQL
DROP INDEX IF EXISTS idx_profiles_username;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_unique;
ALTER TABLE profiles DROP COLUMN IF EXISTS username;
```

### If Code Changes Break:
1. Revert all modified files from backup
2. Clear browser cache
3. Restart dev server
4. Test with reverted code

### If Accounts Stop Working:
1. Check Supabase logs for auth errors
2. Verify username column data
3. Temporarily allow email-only login
4. Contact support if needed

---

## Production Deployment Checklist

**⚠️ Only deploy after ALL tests pass in development**

- [ ] All Phase 4 tests completed successfully
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Database migration tested on staging first
- [ ] Backup production database
- [ ] Run migration on production
- [ ] Deploy code changes
- [ ] Test immediately after deployment
- [ ] Monitor error logs for 24 hours
- [ ] Have rollback plan ready

---

## Current Status

**Phase:** Not Started  
**Last Updated:** 2026-09-09  
**Next Step:** Run database migration (Phase 1)

---

## Notes & Issues

(Document any issues or deviations from plan here)

---

**⚠️ IMPORTANT REMINDERS:**
1. Test each change immediately
2. Don't skip verification steps
3. Keep backups of all modified files
4. Test in development before production
5. If anything breaks, STOP and rollback
