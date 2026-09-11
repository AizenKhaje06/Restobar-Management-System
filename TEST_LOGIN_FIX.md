# ✅ Login Redirect Fix - Testing Guide

## 🔧 What Was Fixed

**Problem:** Super Admin and POS accounts were redirecting to `/waiter` instead of their correct dashboards.

**Root Cause:** Login form was using a hardcoded redirect without checking user role first.

**Solution:** Updated `components/auth/login-form.tsx` to:
1. Fetch user profile after successful login
2. Get the user's role from database
3. Redirect to correct dashboard based on role

---

## 🧪 How to Test

### Step 1: Clear Browser Cache
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Click **"Clear site data"**
4. Close browser and reopen

### Step 2: Test Each Account

Open browser console (F12 → Console tab) to see redirect logs.

#### Test Admin Account:
```
Username: admin (or your admin username)
Password: (your admin password)
Expected: Redirects to /admin
```

#### Test POS Account:
```
Username: pos (or your POS username)
Password: (your POS password)
Expected: Redirects to /pos
```

#### Test Waiter Account:
```
Username: waiter (or your waiter username)
Password: (your waiter password)
Expected: Redirects to /waiter
```

### Step 3: Check Console Logs

After clicking "Sign In", you should see in browser console:
```
[login] Redirecting: { 
  role: "admin", 
  roleHome: "/admin",
  next: null,
  dest: "/admin"
}
```

The `role` and `dest` should match the account you're logging in with.

---

## 🔍 If It Still Doesn't Work

### Option 1: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Start again
npm run dev
```

### Option 2: Check Database Roles

Run this in Supabase SQL Editor:

```sql
SELECT 
  username,
  email,
  role,
  is_active
FROM profiles
WHERE is_active = true
ORDER BY role;
```

Make sure each user has the correct role:
- Admin users: `role = 'admin'`
- POS users: `role = 'pos'`
- Waiter users: `role = 'waiter'`

If wrong, fix with:
```sql
-- Fix admin role
UPDATE profiles 
SET role = 'admin' 
WHERE username = 'your-admin-username';

-- Fix POS role
UPDATE profiles 
SET role = 'pos' 
WHERE username = 'your-pos-username';
```

### Option 3: Test Direct URL

After logging in (even if redirected wrong):
1. Manually type in browser: `http://localhost:3000/admin`
2. Does it load the admin dashboard?
3. Or does it redirect again?

If **direct URL works** → Issue is in login redirect (should be fixed now)
If **direct URL redirects** → Issue is in profile/role data

---

## 📋 What Changed in Code

### Before (WRONG):
```typescript
// Hardcoded to /admin or next param only
const dest = next || "/admin"
router.push(dest)
```

### After (CORRECT):
```typescript
// Fetch profile, get role, redirect to role-specific dashboard
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role) {
  const roleHome = ROLE_HOME[profile.role] || "/admin"
  const dest = next || roleHome  // Use next param OR role home
  router.push(dest)
}
```

### Role Home Mapping:
```typescript
ROLE_HOME = {
  admin: "/admin",
  pos: "/pos",
  waiter: "/waiter",
}
```

---

## ✅ Expected Behavior

| Account Type | Role in DB | Should Redirect To |
|-------------|------------|-------------------|
| Super Admin | `admin`    | `/admin`          |
| POS/Cashier | `pos`      | `/pos`            |
| Waiter      | `waiter`   | `/waiter`         |

---

## 🎯 Success Criteria

✅ Admin login → Admin dashboard  
✅ POS login → POS dashboard  
✅ Waiter login → Waiter dashboard  
✅ Console shows correct role in logs  
✅ No unwanted redirects  

---

## 💬 Report Results

Pag na-test mo na, sabihin mo:

1. ✅ Gumana ba pagkatapos ng clear cache?
2. ❌ Kung hindi, ano nakita mo sa console logs?
3. 🔍 Ano roles sa database (from SQL query)?
4. 📍 Direct URL test - gumana ba?

This will help identify any remaining issues!
