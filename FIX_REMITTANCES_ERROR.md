# 🔧 Fix "Error fetching remittances" 

## Ano ang Problem?

Nakikita mo ang error na ito kasi **hindi pa naka-setup ang database table** para sa cash remittances feature.

---

## ✅ Solution (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** sa sidebar

### Step 2: Run the SQL Migration
1. Open this file sa VS Code:
   ```
   supabase/create_cash_remittances.sql
   ```
2. **Copy ALL content** (Ctrl+A, Ctrl+C)
3. Go back to Supabase SQL Editor
4. **Paste** the SQL code (Ctrl+V)
5. Click **"RUN"** button (bottom right)

### Step 3: Verify Success
You should see messages like:
```
✓ CREATE TABLE
✓ CREATE INDEX
✓ ALTER TABLE
✓ CREATE POLICY
✓ GRANT
```

### Step 4: Refresh Your App
1. Go back to your app
2. Refresh the page (F5)
3. ✅ Error should be gone!

---

## 🎯 What the SQL Does

The migration creates:
- ✅ `cash_remittances` table
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Auto-update triggers
- ✅ Permissions for authenticated users

---

## 🚨 Still Getting Errors?

### Error: "permission denied"
**Solution**: Check if you're logged in as the database owner in Supabase

### Error: "already exists"
**Solution**: Table is already created! Just refresh your app

### Error: Something else
**Solution**: 
1. Copy the full error message
2. Check the browser console (F12)
3. Share the error for debugging

---

## 📝 Quick Copy-Paste

If you can't find the file, here's the path:
```
c:\Users\Aizen Jhake\Documents\GITHUB\Restobar-Management-System\supabase\create_cash_remittances.sql
```

---

## ✅ After Running SQL

You'll be able to:
- ✅ View remittances page (`/admin/remittances`)
- ✅ Submit cash remittances (`/pos/cashflow`)
- ✅ Verify remittances as admin
- ✅ Track cash accountability

---

## 🎉 Summary

**The error happens because the database table doesn't exist yet.**

**Fix it by:**
1. Copy SQL from `create_cash_remittances.sql`
2. Run it in Supabase SQL Editor
3. Refresh your app
4. Done! ✨

---

**That's it! Just run the SQL migration and the error will be gone.** 🚀
