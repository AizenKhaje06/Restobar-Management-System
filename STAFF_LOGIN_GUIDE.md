# 🔐 Staff Login Guide - Admin, POS & Waiter

## 📱 How to Access Staff Dashboards

Your system has **ONE login page** that works for everyone - staff and customers alike. The system automatically detects your role and redirects you to the correct dashboard.

---

## 🚪 Login URL
```
http://localhost:3000/login
```

**One page. All roles.**

---

## 👥 How It Works

### 1. Go to Login Page
Navigate to: `http://localhost:3000/login`

### 2. Enter Your Credentials

**Staff use USERNAME:**
```
Username: admin        ← Your staff username
Password: ••••••••     ← Your password
```

**Customers use EMAIL:**
```
Email: customer@example.com   ← Customer email
Password: ••••••••            ← Customer password
```

### 3. Automatic Redirect

After successful login, the system automatically redirects you based on your role:

| Role | Redirects To | Dashboard |
|------|-------------|-----------|
| **Admin** | `/admin` | Full admin console |
| **POS** | `/pos` | POS/Cashier dashboard |
| **Waiter** | `/waiter` | Waiter orders dashboard |
| **Customer** | `/` | Customer homepage |

---

## 🎯 Direct Access URLs

You can also bookmark these URLs (but you still need to login first):

### Admin Dashboard
```
http://localhost:3000/admin
```
**Features:**
- Dashboard & Analytics
- Orders Management
- Cashflow & Remittances
- Menu Management
- Tables & QR Codes
- Reservations
- **Events** (Bookings, Payments, Venues, Packages, Inquiries)
- Staff Management
- Activity Log
- Settings

### POS Dashboard
```
http://localhost:3000/pos
```
**Features:**
- Process orders
- Handle payments
- Print receipts
- Cash management
- Order status updates

### Waiter Dashboard
```
http://localhost:3000/waiter
```
**Features:**
- View assigned tables
- Take orders
- Update order status
- Manage table sessions
- Customer requests

---

## 🔑 How to Create Staff Accounts

### Option A: Through Admin Interface (Recommended)

1. Login as **admin**
2. Go to `/admin/staff`
3. Click **"Add New Staff"**
4. Fill in details:
   - Full Name
   - Email
   - **Username** (for login)
   - **Role** (admin/pos/waiter)
   - Password
5. Click **"Create Staff Account"**

### Option B: Through Supabase SQL Editor

```sql
-- Create an admin account
INSERT INTO auth.users (id, email)
VALUES (gen_random_uuid(), 'admin@restaurant.com');

-- Create profile with admin role
INSERT INTO profiles (id, email, username, full_name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@restaurant.com'),
  'admin@restaurant.com',
  'admin',           -- Username for login
  'Administrator',
  'admin',           -- Role: admin/pos/waiter
  true
);
```

---

## 🎨 Login Page Features

### For All Users:
- ✅ **Username OR Email** - Staff use username, customers use email
- ✅ **Remember this device** - Stay logged in
- ✅ **Forgot Password** - Password recovery
- ✅ **Secure authentication** - Enterprise-grade security
- ✅ **Auto-redirect** - Goes to your role-specific dashboard
- ✅ **Beautiful UI** - Professional luxury design

### Visual Design:
- Full-screen background image (`LydiasBG3.png`)
- Gradient overlay on left side
- Marketing content for brand
- Frosted glass login card
- Responsive mobile layout

---

## 🔄 Login Flow Diagram

```
User visits /login
       ↓
Enters username/email + password
       ↓
System authenticates
       ↓
Checks user role from profiles table
       ↓
   ┌──────┴──────┬────────────┬────────────┐
   ↓             ↓            ↓            ↓
Admin          POS         Waiter      Customer
   ↓             ↓            ↓            ↓
/admin        /pos        /waiter        /
```

---

## 📋 Default Staff Accounts (If Set Up)

Check with your administrator for default credentials, or create accounts using the methods above.

**Example setup:**
```
Username: admin
Password: admin123
Role: Administrator

Username: cashier
Password: cashier123
Role: POS

Username: juan
Password: waiter123
Role: Waiter
```

---

## 🛡️ Security Features

1. **Rate Limiting**
   - Maximum 5 login attempts per minute per IP
   - Prevents brute force attacks

2. **Role-Based Access**
   - Each role can only access their designated areas
   - Automatic redirect if wrong role tries to access page

3. **Session Management**
   - Secure JWT tokens
   - Automatic logout on inactivity
   - Remember device option

4. **Password Security**
   - Hashed passwords (never stored in plain text)
   - Password recovery via email
   - Strong password requirements

---

## 🚨 Troubleshooting

### Issue: "Invalid username or password"

**Solutions:**
1. Check if you're using **username** (not email) as staff
2. Verify username exists in database:
   ```sql
   SELECT username, email, role, is_active 
   FROM profiles 
   WHERE username = 'your_username';
   ```
3. Check if account is active (`is_active = true`)
4. Try password reset

### Issue: Redirect to wrong page after login

**Solutions:**
1. Clear browser cache and cookies
2. Check your role in database:
   ```sql
   SELECT email, username, role 
   FROM profiles 
   WHERE email = 'your@email.com';
   ```
3. Ensure role is exactly: `admin`, `pos`, or `waiter` (lowercase)

### Issue: "Not authenticated" after login

**Solutions:**
1. Check Supabase connection in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
2. Verify RLS policies allow profile lookup
3. Check browser console for errors
4. Try incognito/private window

### Issue: Can't access /admin even though I'm admin

**Solutions:**
1. Verify role in database is exactly `admin`
2. Check `is_active = true`
3. Clear session and re-login
4. Check console logs for permission errors

---

## 🎯 Quick Testing

### Test Admin Login:
1. Create admin account (see "How to Create Staff Accounts")
2. Go to `http://localhost:3000/login`
3. Enter admin username + password
4. Should redirect to `/admin` dashboard

### Test POS Login:
1. Create POS account with role = `pos`
2. Go to `http://localhost:3000/login`
3. Enter POS username + password
4. Should redirect to `/pos` dashboard

### Test Waiter Login:
1. Create waiter account with role = `waiter`
2. Go to `http://localhost:3000/login`
3. Enter waiter username + password
4. Should redirect to `/waiter` dashboard

---

## 📱 Mobile Access

The login page is fully responsive and works on:
- ✅ Desktop/Laptop
- ✅ Tablets
- ✅ Mobile phones

All staff dashboards are mobile-optimized for on-the-go access.

---

## 🔗 Related Pages

### For Staff:
- `/login` - Login page
- `/admin` - Admin dashboard
- `/pos` - POS dashboard
- `/waiter` - Waiter dashboard

### For Customers:
- `/events` - Event booking system
- `/events/login` - Customer login (separate from staff)
- `/events/signup` - Customer registration
- `/events/dashboard` - Customer dashboard

---

## 💡 Pro Tips

1. **Bookmark your dashboard** - Save `/admin`, `/pos`, or `/waiter` for quick access
2. **Use "Remember this device"** - Stay logged in on trusted devices
3. **Set strong passwords** - Especially for admin accounts
4. **Logout when done** - Security best practice on shared devices
5. **Check Activity Log** - Admin can monitor all staff actions

---

## 📚 Related Documentation

- `README.md` - Project overview
- `ADMIN_QUICK_REFERENCE.md` - Admin features guide
- `ADMIN_INTERFACE_COMPLETE.md` - Complete admin documentation
- `DEPLOYMENT_CHECKLIST.md` - Production deployment guide

---

## 🆘 Need Help?

1. Check this guide first
2. Check browser console for errors (F12)
3. Verify database records in Supabase
4. Review authentication logs
5. Contact system administrator

---

**Remember:** ONE login page for everyone. The system automatically knows where to send you based on your role! 🎯
