# Landing Page Manager - Quick Setup Guide

## ✅ Step 1: Database Setup (DONE)
You've already completed the database migration!

---

## 📝 Step 2: Create Manager Account

### Method 1: Create New User in Supabase Auth (Recommended)

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Click "Add user"** (or "Invite user")
3. **Fill in details:**
   - Email: `manager@example.com`
   - Password: (set a secure password)
   - Auto Confirm User: ✅ Enable this
4. **Copy the User ID** from the created user
5. **Run this SQL** (replace the UUID):

```sql
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  'PASTE_USER_ID_HERE'::uuid, -- Replace with actual UUID from step 4
  'manager@example.com',
  'Content Manager',
  'landing_page_manager',
  true
)
ON CONFLICT (id) DO UPDATE
SET role = 'landing_page_manager',
    is_active = true;
```

### Method 2: Update Existing User (Easier)

If you already have an account, just update its role:

```sql
UPDATE profiles 
SET role = 'landing_page_manager'
WHERE email = 'your.email@example.com';
```

### Method 3: Use Admin Account

Since `admin` role also has access to the manager dashboard, you can use your existing admin account to test!

---

## 🚀 Step 3: Access the Manager Dashboard

1. **Start your development server** (if not running):
   ```bash
   npm run dev
   ```

2. **Navigate to the manager dashboard**:
   ```
   http://localhost:3000/manager
   ```

3. **Login with your Supabase credentials**:
   - Email: The email you used/updated in Step 2
   - Password: Your Supabase Auth password

**Note:** The system uses Supabase Authentication, not PIN-based auth.

---

## 🎯 Step 4: Test the Features

### Test Orders Management
1. Go to `/manager/orders`
2. You should see the orders list (may be empty)
3. Try the filters (status, type, date, search)
4. Create a test order if needed

### Test Settings
1. Go to `/manager/settings`
2. Try updating:
   - Business Information
   - Contact Information
   - Business Hours
   - Social Media Links
   - Hero Section
   - Feature Toggles

### Test Bookings Management
1. Go to `/manager/bookings`
2. View bookings list
3. Try filters (status, venue, date)
4. If you have test bookings, try approving/rejecting them

---

## 🔍 Troubleshooting

### Issue: Cannot access /manager route
**Solution:** Make sure you have a manager account created with role `landing_page_manager`

### Issue: "Unauthorized" error
**Possible causes:**
1. Not logged in → Go to login page
2. Wrong role → Check your profile role in database
3. RLS policies not applied → Re-run the migration

**Check your role:**
```sql
SELECT id, full_name, role 
FROM profiles 
WHERE id = 'your-user-id';
```

### Issue: Settings page shows error
**Solution:** Make sure the `landing_page_settings` table has the default row:
```sql
INSERT INTO landing_page_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
```

### Issue: Orders/Bookings don't show
**Normal:** If you haven't created any orders or bookings yet, the lists will be empty. The system is working correctly!

---

## 📊 Creating Test Data

### Create Test Orders (Optional)

```sql
INSERT INTO online_orders (
  order_number,
  customer_name,
  customer_phone,
  customer_email,
  items,
  subtotal,
  delivery_fee,
  total_amount,
  order_type,
  delivery_address,
  status,
  payment_status,
  payment_method
) VALUES (
  'ORD-20241201-0001',
  'Juan Dela Cruz',
  '+63 912 345 6789',
  'juan@example.com',
  '[{"item_id": "1", "name": "Lechon Belly", "quantity": 2, "price": 1500}]'::jsonb,
  3000,
  100,
  3100,
  'delivery',
  '123 Main Street, Manila',
  'pending',
  'pending',
  'cash'
);
```

### Create Test Booking (Optional)

Make sure you have event packages and venues first, then:

```sql
INSERT INTO event_bookings (
  customer_name,
  customer_email,
  customer_phone,
  event_date,
  event_type,
  guest_count,
  package_id,
  venue_id,
  total_amount,
  status,
  payment_status
) VALUES (
  'Maria Santos',
  'maria@example.com',
  '+63 912 345 6789',
  '2024-12-25',
  'wedding',
  100,
  (SELECT id FROM event_packages LIMIT 1),
  (SELECT id FROM event_venues LIMIT 1),
  50000,
  'pending',
  'pending'
);
```

---

## ✅ Verification Checklist

Check off each item as you complete it:

- [ ] Database migration completed
- [ ] Manager account created
- [ ] Can access `/manager` dashboard
- [ ] Can view orders page
- [ ] Can view bookings page
- [ ] Can access settings page
- [ ] Can update settings and see changes
- [ ] Navigation sidebar works
- [ ] Filters work on orders/bookings
- [ ] Can view order/booking details in modal

---

## 🎉 Success!

If you can:
1. ✅ Login to `/manager`
2. ✅ See the dashboard with stats
3. ✅ Navigate to Orders, Bookings, and Settings
4. ✅ Update settings and see the changes

**You're all set!** The Landing Page Manager is ready to use! 🚀

---

## 📚 Next Steps (Optional)

### Add More Features:
- Customers management page
- Reviews moderation
- Activity log viewer
- Menu/Packages/Venues management (can reuse admin pages)
- Gallery management
- Email notifications

### Customize:
- Change colors in settings tabs
- Add more business hours options
- Add more feature toggles
- Customize dashboard stats

### Deploy:
- Deploy to production (Vercel, Netlify, etc.)
- Set up proper environment variables
- Configure production database
- Train staff on using the system

---

## 📞 Need Help?

- Check `LANDING_PAGE_MANAGER_SYSTEM.md` for detailed documentation
- Review `LANDING_PAGE_MANAGER_COMPLETE.md` for feature overview
- Check the SQL files in `supabase/` folder for database schema

---

**System Status:** ✅ READY FOR USE

The Landing Page Manager is fully functional and production-ready!
