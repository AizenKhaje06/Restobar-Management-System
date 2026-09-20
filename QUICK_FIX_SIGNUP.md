# 🚀 Quick Fix: Customer Signup RLS Error

## The Problem
```
Error: new row violates row-level security policy for table "event_customers"
```

## The Solution (2 minutes)

### 1. Open Supabase SQL Editor
- Go to [supabase.com](https://supabase.com) → Your Project → **SQL Editor**

### 2. Copy & Run This SQL
```sql
-- Add missing INSERT policy for customer signup
DROP POLICY IF EXISTS "Customers can create own profile" ON event_customers;

CREATE POLICY "Customers can create own profile" ON event_customers
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);
```

### 3. Test Signup
- Go to `http://localhost:3000/events/signup`
- Create account → Should work now! ✅

---

## Why This Works
The `event_customers` table had SELECT and UPDATE policies but **no INSERT policy**. New users couldn't create their profile. This adds the missing INSERT policy.

---

## Full Details
See `FIX_SIGNUP_RLS.md` for complete documentation.
