# ⚡ QUICK START: Step 2 - Fix Authentication

**Time:** 10 minutes (if you skip testing)  
**Goal:** Enable immediate staff account creation

---

## 🎯 3 Quick Steps

### 1️⃣ Get Service Role Key (2 min)

1. Open: https://app.supabase.com/project/szfvjfvukicjmuxogglt/settings/api
2. Copy the **`service_role`** key (long key, ~200 characters)

### 2️⃣ Add to Environment (1 min)

Edit `.env.local`, add this line:

```env
SUPABASE_SERVICE_ROLE_KEY=your_copied_key_here
```

Save and restart dev server:
```bash
Ctrl+C
npm run dev
```

### 3️⃣ Update Code (7 min)

**A. Create `lib/supabase/admin.ts`:**

```typescript
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials")
}

export const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
```

**B. Update `app/actions/admin.ts`:**

Add import at top:
```typescript
import { createAdminClient } from "@/lib/supabase/admin"
```

Find `createStaffAccountAction`, replace the auth creation part:

**Replace this:**
```typescript
// OLD: Uses signUp (requires email confirmation)
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: internalEmail,
  password: password,
  options: {
    data: {
      full_name,
      role,
    },
    emailRedirectTo: undefined,
  },
})
```

**With this:**
```typescript
// NEW: Uses Admin API (bypasses email confirmation)
const adminClient = createAdminClient()

const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
  email: internalEmail,
  password: password,
  email_confirm: true,
  user_metadata: {
    full_name,
    role,
  },
})
```

**Add rollback after profile update error:**

Find this section:
```typescript
if (profileError) {
  console.error("Profile update failed:", profileError)
  return { error: "Failed to create profile: " + profileError.message }
}
```

Replace with:
```typescript
if (profileError) {
  console.error("Profile update failed:", profileError)
  
  // Rollback: Delete the auth user
  await adminClient.auth.admin.deleteUser(authData.user.id)
  
  return { error: "Failed to create profile: " + profileError.message }
}
```

---

## ✅ Test (3 min)

1. Go to: `/admin/staff`
2. Click "Create Staff Account"
3. Fill:
   - Username: `test_waiter`
   - Password: `password123`
   - Role: Waiter
4. Create account
5. Logout → Login with `test_waiter` / `password123`
6. Should work immediately! ✅

---

## 🐛 Troubleshooting

**"Missing Supabase credentials"**
→ Restart dev server (`Ctrl+C`, then `npm run dev`)

**"Invalid API key"**
→ Copy the correct **service_role** key (not anon key)

**"Failed to create account"**
→ Check Step 1 completed successfully

---

**Done?** Continue to Step 3: Security Fixes

See `MIGRATION_GUIDE_STEP_2.md` for detailed explanation.
