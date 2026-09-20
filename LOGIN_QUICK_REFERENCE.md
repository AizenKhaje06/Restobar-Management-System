# 🚀 Quick Login Reference

## ONE Login Page for All
```
http://localhost:3000/login
```

---

## 🔑 Login Credentials

### Staff (Username)
```
Username: your_username    ← Use username
Password: your_password
```

### Customers (Email)
```
Email: customer@email.com  ← Use email
Password: customer_password
```

---

## 📍 Auto-Redirect After Login

| Role | Goes To | URL |
|------|---------|-----|
| 👑 **Admin** | Admin Console | `/admin` |
| 💰 **POS** | Cashier Dashboard | `/pos` |
| 🍽️ **Waiter** | Waiter Orders | `/waiter` |
| 👤 **Customer** | Homepage | `/` |

---

## ✨ Quick Access

After logging in once, bookmark:
- Admin: `http://localhost:3000/admin`
- POS: `http://localhost:3000/pos`
- Waiter: `http://localhost:3000/waiter`

---

## 🎯 Testing

1. Create staff account (username + role)
2. Go to `/login`
3. Enter username + password
4. System auto-redirects to your dashboard ✅

---

## 🔧 Create Admin Account (SQL)

```sql
-- Option 1: Update existing user to admin
UPDATE profiles 
SET role = 'admin', is_active = true 
WHERE email = 'your@email.com';

-- Option 2: Through admin interface
-- Login as admin → Go to /admin/staff → Add New Staff
```

---

## 🆘 Troubleshooting

❌ **"Invalid username or password"**
- Staff use **USERNAME** (not email)
- Customers use **EMAIL** (not username)

❌ **Wrong page after login**
- Check role is: `admin`, `pos`, or `waiter` (lowercase)
- Ensure `is_active = true`

---

**Full Guide:** See `STAFF_LOGIN_GUIDE.md` for complete details
