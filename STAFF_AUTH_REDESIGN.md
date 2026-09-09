# Staff Authentication Redesign - Implementation Plan

## Current System (TO BE CHANGED)
- Staff created via email invitation system
- Staff must signup on login page using invited email
- All users login with email + password
- Signup page accessible to everyone

## New System Requirements

### 1. Staff Accounts (Admin, POS, Waiter)
✅ Created ONLY by Admin in `/admin/staff` page  
✅ Use **USERNAME + PASSWORD** for login  
✅ Direct account creation (no email invite)  
✅ Admin sets the username and password  
❌ NO signup from login page  
❌ NO email-based authentication  

### 2. Customer Accounts
✅ Can signup from login/signup page  
✅ Use **EMAIL + PASSWORD** (existing)  
✅ No role (or role = 'customer')  

### 3. Login Flow
- **Staff (Admin/POS/Waiter):** Login with USERNAME + PASSWORD
- **Customers:** Login with EMAIL + PASSWORD or USERNAME + PASSWORD (flexible)

---

## Database Changes Required

### 1. Add Username Column to `profiles` table

```sql
-- Add username column (unique, nullable for backward compatibility)
ALTER TABLE profiles 
ADD COLUMN username TEXT UNIQUE;

-- Add index for faster username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Add check constraint: staff must have username
ALTER TABLE profiles
ADD CONSTRAINT check_staff_username 
CHECK (
  (role IN ('admin', 'pos', 'waiter') AND username IS NOT NULL) OR
  (role NOT IN ('admin', 'pos', 'waiter'))
);
```

### 2. Remove or Deprecate `staff_invitations` table (optional)
Current invite system won't be needed, but can keep for backward compatibility.

---

## Code Changes Required

### 1. Staff Creation Flow (`/admin/staff` page)

**Current:** Send email invitation → Staff signs up with email  
**New:** Admin creates account directly with username + password

**File:** `components/admin/staff-manager.tsx`

Changes needed:
- Replace "Send Invite" dialog with "Create Staff Account" dialog
- Add fields:
  - Full name
  - Username (unique, required)
  - Password (required, min 8 chars)
  - Role (Admin/POS/Waiter)
  - Phone (optional)
  - Address (optional)
  - Status (Active/Inactive)
- Remove email field for staff
- Create account directly in Supabase auth

**File:** `app/actions/admin.ts`

New action needed:
```typescript
export async function createStaffAccountAction(formData: FormData) {
  // 1. Validate admin permission
  // 2. Extract: username, password, role, full_name, etc.
  // 3. Create user in Supabase auth (using admin API)
  // 4. Create profile with username + role
  // 5. Return success or error
}
```

### 2. Login Page Modifications

**File:** `app/login/page.tsx` or login component

Changes needed:
- Accept BOTH email OR username
- Try username-based login first (for staff)
- Fallback to email-based login (for customers)
- Remove "Don't have an account? Sign up" link for clarity
  - OR keep it but clarify "For customers only"

**File:** `lib/auth.ts` or auth actions

New login logic:
```typescript
export async function signInWithUsernameOrEmail(
  identifier: string, // username or email
  password: string
) {
  // 1. Check if identifier contains '@' → email
  // 2. If no '@' → assume username, lookup email from profiles
  // 3. Sign in with Supabase using email + password
  // 4. Return session or error
}
```

### 3. Signup Page Modifications

**File:** `app/signup/page.tsx`

Changes needed:
- Add banner: "Staff accounts are created by administrators only"
- Clarify: "Sign up as a customer to place orders and make reservations"
- Keep signup form (for customers only)
- Set role = 'customer' or null for signups

### 4. Authentication Helper

**File:** `lib/auth.ts`

New helper function:
```typescript
export async function getEmailFromUsername(username: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('email, id')
    .eq('username', username)
    .single()
  
  if (!data) return null
  
  // Get email from auth.users using profile.id
  const { data: authUser } = await supabase.auth.admin.getUserById(data.id)
  return authUser?.email ?? null
}
```

---

## UI Changes Summary

### Admin Staff Page (`/admin/staff`)

**Before:**
```
[+ Add Staff] → "Send Invite" dialog
   - Full name
   - Email
   - Phone
   - Role
   - Address
   → Sends invitation email
```

**After:**
```
[+ Create Staff Account] → "Create Staff Account" dialog
   - Full name *
   - Username * (unique)
   - Password * (min 8 chars)
   - Role * (Admin/POS/Waiter)
   - Phone
   - Address
   - Status (Active/Inactive)
   → Creates account immediately
```

### Login Page (`/login`)

**Before:**
```
Email: [_____________]
Password: [_____________]
[Login]

Don't have an account? Sign up
```

**After:**
```
Username or Email: [_____________]
Password: [_____________]
[Login]

Customers: Create an account | Staff accounts are managed by administrators
```

### Signup Page (`/signup`)

**After:**
```
[Info Banner]
📢 Staff Accounts
Staff accounts (Admin, POS, Waiter) are created by administrators only.
If you're a staff member, contact your administrator for login credentials.

Sign up as a Customer
Create an account to place orders and make reservations.

[Signup Form]
```

---

## Implementation Steps

### Phase 1: Database (Must be done first!)
1. ✅ Add `username` column to `profiles` table
2. ✅ Add unique index on `username`
3. ✅ Add check constraint for staff usernames
4. ✅ Test migration

### Phase 2: Backend (Server Actions)
1. ✅ Create `createStaffAccountAction` in `app/actions/admin.ts`
2. ✅ Update `signInAction` to support username OR email
3. ✅ Add `getEmailFromUsername` helper in `lib/auth.ts`
4. ✅ Update signup action to set role = 'customer' by default

### Phase 3: Frontend (UI Components)
1. ✅ Replace "Add Staff" dialog in `staff-manager.tsx`
   - Add username field
   - Add password field
   - Remove email field
   - Remove invitation logic
2. ✅ Update login page
   - Change "Email" label to "Username or Email"
   - Update form submission
3. ✅ Update signup page
   - Add info banner about staff accounts
   - Clarify it's for customers

### Phase 4: Testing
1. ✅ Test staff account creation
2. ✅ Test staff login with username
3. ✅ Test customer signup and login with email
4. ✅ Test admin permissions
5. ✅ Test existing accounts still work

---

## Breaking Changes & Migration

### For Existing Staff Accounts
**Problem:** Existing staff don't have usernames yet

**Solutions:**
1. **Option A (Recommended):** Auto-generate usernames
   ```sql
   -- Generate usernames from email (before @ symbol)
   UPDATE profiles 
   SET username = split_part(email, '@', 1)
   WHERE role IN ('admin', 'pos', 'waiter') 
   AND username IS NULL;
   ```

2. **Option B:** Force staff to set username on first login
   - Add "Set Username" step after login if username is null

### For Existing Admin Account
- Must have username to continue managing staff
- Can be set via SQL or special setup page

---

## Security Considerations

1. ✅ **Username bruteforce protection**
   - Rate limit login attempts
   - Use Supabase built-in rate limiting

2. ✅ **Password requirements**
   - Minimum 8 characters
   - Require at least one number (optional)
   - Use Supabase password validation

3. ✅ **Admin-only staff creation**
   - Check admin role in server action
   - Use Row Level Security (RLS) policies

4. ✅ **Username uniqueness**
   - Enforce at database level (UNIQUE constraint)
   - Validate before creation

---

## Files to Modify

### Backend:
- [ ] `app/actions/admin.ts` - Add `createStaffAccountAction`
- [ ] `app/actions/auth.ts` - Update `signInAction`
- [ ] `lib/auth.ts` - Add `getEmailFromUsername`

### Frontend:
- [ ] `components/admin/staff-manager.tsx` - Replace invite dialog
- [ ] `app/login/page.tsx` - Update to accept username/email
- [ ] `app/signup/page.tsx` - Add customer-only banner

### Database:
- [ ] Migration script to add `username` column
- [ ] Migration script to populate existing staff usernames

---

## Timeline Estimate
- Database changes: 30 minutes
- Backend changes: 2-3 hours
- Frontend changes: 2-3 hours
- Testing: 1-2 hours
- **Total: 6-8 hours**

---

## Questions to Confirm

1. ✅ Should customers also be able to login with username (if they set one)?
   - **Suggested:** Yes, allow both for flexibility

2. ✅ Should signup page be completely removed or just disabled for staff?
   - **Suggested:** Keep for customers, add clarification banner

3. ✅ Username format requirements?
   - **Suggested:** 
     - Alphanumeric + underscores only
     - 3-20 characters
     - Case-insensitive (store lowercase)

4. ✅ What happens to existing staff_invitations?
   - **Suggested:** Mark as deprecated, don't delete (for history)

5. ✅ Password policy?
   - **Suggested:** Min 8 chars (Supabase default)

---

**Status:** 📋 PLAN READY - Awaiting confirmation to proceed with implementation
