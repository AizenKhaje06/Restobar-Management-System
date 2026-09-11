# Fix: Login Redirect Issue (Super Admin & POS redirecting to Waiter)

## 🔴 Problem
When logging in as **Super Admin** or **POS**, the system redirects to `/waiter` instead of the correct dashboard.

## ✅ Solution Applied

I fixed the login redirect logic in `components/auth/login-form.tsx`.

**What was wrong:**
```typescript
// BEFORE - WRONG (hardcoded to /admin)
const dest = next || "/admin"  // ❌ Always goes to /admin
router.push(dest)
```

**What is now correct:**
```typescript
// AFTER - CORRECT (lets root page handle role-based redirect)
const dest = next || "/"  // ✅ Goes to "/" which auto-redirects based on role
router.push(dest)
```

The root page (`app/page.tsx`) already has correct logic:
```typescript
if (profile) {
  redirect(ROLE_HOME[profile.role] ?? "/admin")  // admin → /admin, pos → /pos, waiter → /waiter
}
```

---

## 🧪 Testing Steps

### Test 1: Clear Browser Cache & Cookies
**Why:** Old sessions might be cached

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear site data**
4. Close and reopen browser

### Test 2: Try Fresh Login

1. **Logout** if currently logged in
2. Go to `/login`
3. Try each account:

**Super Admin:**
- Username: `admin` (or your admin username)
- Should redirect to: `/admin`

**POS/Cashier:**
- Username: `pos` (or your POS username)  
- Should redirect to: `/pos`

**Waiter:**
- Username: `waiter` (or your waiter username)
- Should redirect to: `/waiter`

---

## 🔍 If Still Not Working

### Check 1: Verify User Roles in Database

Run this query in Supabase SQL Editor:

```sql
SELECT 
  username,
  email,
  role,
  is_active
FROM profiles
WHERE username IN ('admin', 'pos', 'waiter')
ORDER BY role;
```

**Expected Output:**
```
username | email              | role   | is_active
---------|-------------------|--------|----------
admin    | admin@email.com   | admin  | true
pos      | pos@email.com     | pos    | true
waiter   | waiter@email.com  | waiter | true
```

**If roles are wrong**, update them:
```sql
-- Fix admin role
UPDATE profiles 
SET role = 'admin' 
WHERE username = 'admin';

-- Fix POS role
UPDATE profiles 
SET role = 'pos' 
WHERE username = 'pos';

-- Fix waiter role
UPDATE profiles 
SET role = 'waiter' 
WHERE username = 'waiter';
```

### Check 2: Test Profile Fetching

Add temporary logging to `lib/auth.ts`:

```typescript
export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('[auth] No user session')
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  console.log('[auth] Profile fetched:', {
    userId: user.id,
    username: profile?.username,
    role: profile?.role,
    email: profile?.email,
  })
  
  if (profile) return profile as Profile

  // ... rest of code
}
```

Then check browser console after login to see what role was fetched.

### Check 3: Hard Refresh the App

```bash
# Stop dev server (Ctrl+C)
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart dev server
npm run dev
```

### Check 4: Test Direct URL Access

After logging in as POS:
1. Manually go to: `http://localhost:3000/pos`
2. Does it work? Or does it redirect to `/waiter`?

If it **works via direct URL** but **not via login**, the issue is in the login redirect.

If it **redirects to waiter even from direct URL**, the issue is in the profile/role fetching.

---

## 🐛 Debug Mode (Advanced)

Add this to `components/auth/login-form.tsx` after successful login:

```typescript
const result = await signInWithUsernameOrEmail(identifier, password)

if (result.error) {
  setError(result.error)
  setLoading(false)
  return
}

// DEBUG: Log the user info
console.log('[login] Login successful, fetching profile...')

// Wait a bit for session to settle
await new Promise(resolve => setTimeout(resolve, 500))

// Fetch the profile manually to debug
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user?.id)
  .single()

console.log('[login] User profile:', {
  userId: user?.id,
  username: profile?.username,
  role: profile?.role,
  redirectTo: next || '/',
  roleHome: profile ? ROLE_HOME[profile.role] : 'unknown',
})

// Then redirect
const dest = next || "/"
router.push(dest)
router.refresh()
```

Then check browser console for detailed info.

---

## 🎯 Quick Fix if Nothing Works

If all else fails, use this **direct role-based redirect** in the login form:

```typescript
import { createClient } from "@/lib/supabase/client"
import { ROLE_HOME } from "@/lib/constants"

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError(null)

  const result = await signInWithUsernameOrEmail(identifier, password)
  
  if (result.error) {
    setError(result.error)
    setLoading(false)
    return
  }

  // Give session time to settle
  await new Promise(resolve => setTimeout(resolve, 300))

  // Fetch profile to determine role
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role) {
      // Direct redirect based on role
      const dest = next || ROLE_HOME[profile.role] || "/admin"
      router.push(dest)
      router.refresh()
      return
    }
  }

  // Fallback
  router.push(next || "/")
  router.refresh()
}
```

This bypasses the root page redirect and goes directly to the correct dashboard.

---

## 📞 Report Back

After trying these steps, let me know:

1. ✅ Does clearing cache/cookies fix it?
2. ✅ What roles are shown in the database query?
3. ✅ What appears in browser console with debug logging?
4. ✅ Does direct URL access work?

This will help me pinpoint the exact issue!
