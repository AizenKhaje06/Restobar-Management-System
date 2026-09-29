# Landing Page Manager System

## Overview

The Landing Page Manager is a separate role and dashboard for managing the public-facing website content, customer orders, event bookings, and customer interactions. This keeps the main admin dashboard focused on internal operations while providing specialized tools for managing the online presence.

## Key Features

### 1. **Separate Dashboard** (`/manager`)
- Dedicated interface for landing page management
- Real-time stats for orders, bookings, and customers
- Quick access to pending items requiring attention

### 2. **Online Orders Management**
- View and manage customer orders from the website
- Update order status (pending → confirmed → preparing → ready → completed)
- Assign orders to staff
- Track delivery/pickup schedules
- Monitor payment status

### 3. **Event Bookings Management**
- View event booking requests
- Approve or reject bookings
- Manage booking calendar
- Track booking status and payments

### 4. **Customer Management**
- View registered customers
- Track customer order history
- View customer spending patterns
- Manage customer accounts

### 5. **Content Management**
- **Menu Items**: Add, edit, delete menu items with images and pricing
- **Event Packages**: Manage event packages and pricing
- **Venues**: Update venue information and photos
- **Gallery**: Upload and manage gallery images

### 6. **Reviews & Feedback**
- View customer reviews
- Moderate reviews (approve/reject)
- Respond to customer feedback
- Feature best reviews on landing page

### 7. **Landing Page Settings**
- Update business information
- Manage contact details
- Set business hours
- Update social media links
- Configure hero section
- Toggle features (online ordering, bookings, etc.)

### 8. **Activity Log**
- Track all content changes
- See who made what changes
- Audit trail for compliance

## Database Schema

### New Tables Created:

1. **`landing_page_settings`**
   - Stores configurable landing page content
   - Business info, hours, contact, social media
   - Hero section configuration
   - Feature toggles

2. **`online_orders`**
   - Customer orders from the website
   - Order details, status tracking
   - Delivery/pickup information
   - Payment tracking

3. **`customer_reviews`**
   - Customer feedback and ratings
   - Moderation status
   - Admin responses

4. **`content_updates_log`**
   - Audit trail for all content changes
   - Tracks who changed what and when

### New Role:
- `landing_page_manager` - Added to `user_role` enum

## Access Control

### Landing Page Manager Can:
✅ View and manage online orders
✅ View and manage event bookings
✅ View customer information
✅ Edit menu items, packages, venues
✅ Manage gallery images
✅ Update landing page settings
✅ Moderate customer reviews
✅ View activity logs

### Landing Page Manager Cannot:
❌ Access POS system
❌ View financial reports
❌ Manage staff accounts
❌ Access kitchen display
❌ Manage inventory
❌ View cashier sessions

## Dashboard Sections

### 1. Dashboard (`/manager`)
- Overview stats
- Recent orders
- Recent bookings
- Quick actions

### 2. Orders (`/manager/orders`)
- List all online orders
- Filter by status, date
- Update order status
- View order details

### 3. Bookings (`/manager/bookings`)
- List event bookings
- Filter by status, date, venue
- Approve/reject bookings
- View booking details

### 4. Customers (`/manager/customers`)
- List all customers
- View customer profiles
- Track order history
- Customer analytics

### 5. Reviews (`/manager/reviews`)
- List customer reviews
- Moderate reviews
- Respond to feedback
- Feature reviews

### 6. Menu Management (`/manager/menu`)
- Add/edit/delete menu items
- Upload item images
- Set pricing and availability
- Organize by categories

### 7. Packages (`/manager/packages`)
- Manage event packages
- Set package details and pricing
- Upload package images

### 8. Venues (`/manager/venues`)
- Update venue information
- Upload venue photos
- Set capacity and features

### 9. Gallery (`/manager/gallery`)
- Upload images
- Organize by category
- Set featured images

### 10. Settings (`/manager/settings`)
- Update business info
- Set business hours
- Manage contact details
- Configure social media
- Feature toggles

### 11. Activity Log (`/manager/activity`)
- View all content changes
- Filter by type, user, date
- Export logs

## Setup Instructions

### 1. Run Database Migration

```bash
# Run the SQL file to create tables and policies
psql -U postgres -d your_database < supabase/create_landing_page_manager.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `create_landing_page_manager.sql`
3. Run the query

### 2. Create Landing Page Manager Account

```sql
-- Create a new user with landing_page_manager role
INSERT INTO users (
  id,
  full_name,
  role,
  pin,
  is_active
) VALUES (
  gen_random_uuid(),
  'Content Manager',
  'landing_page_manager',
  '123456', -- Change this!
  true
);
```

### 3. Access the Dashboard

Navigate to: `https://your-domain.com/manager`

Login with the landing page manager credentials.

## Security Features

1. **Role-Based Access Control (RLS)**
   - Only admin and landing_page_manager roles can access
   - Customers can only see their own data

2. **Audit Logging**
   - All content changes are logged
   - Tracks who made changes and when

3. **Separate Authentication**
   - Landing page managers don't have access to sensitive operational data
   - Different permission set from admin users

## Benefits

✅ **Clear Separation**: Operations team vs. content team
✅ **Better Security**: Limited access to sensitive data
✅ **Focused Interface**: Tools specific to content management
✅ **Scalability**: Can assign multiple managers
✅ **Audit Trail**: Track all content changes
✅ **Customer Focus**: Dedicated tools for customer interaction

## Next Steps

1. **Complete Implementation**: Create remaining pages (orders, bookings, etc.)
2. **Add Notifications**: Real-time alerts for new orders/bookings
3. **Email Integration**: Automated emails for order/booking status
4. **Analytics Dashboard**: Customer behavior, popular items, conversion rates
5. **Bulk Operations**: Import/export functionality for content
6. **Mobile App**: Dedicated mobile app for managers on-the-go

## File Structure

```
app/
├── manager/
│   ├── layout.tsx              # Manager dashboard layout
│   ├── page.tsx                # Main dashboard
│   ├── orders/
│   │   └── page.tsx           # Orders management
│   ├── bookings/
│   │   └── page.tsx           # Bookings management
│   ├── customers/
│   │   └── page.tsx           # Customer management
│   ├── reviews/
│   │   └── page.tsx           # Reviews management
│   ├── menu/
│   │   └── page.tsx           # Menu management
│   ├── packages/
│   │   └── page.tsx           # Packages management
│   ├── venues/
│   │   └── page.tsx           # Venues management
│   ├── gallery/
│   │   └── page.tsx           # Gallery management
│   ├── settings/
│   │   └── page.tsx           # Settings management
│   └── activity/
│       └── page.tsx           # Activity log

components/
├── manager/
│   ├── manager-sidebar.tsx    # Navigation sidebar
│   └── manager-header.tsx     # Top header bar

supabase/
└── create_landing_page_manager.sql  # Database schema
```

## API Endpoints (Actions)

Create these server actions for manager operations:

- `app/actions/manager-orders.ts` - Order management
- `app/actions/manager-bookings.ts` - Booking management
- `app/actions/manager-content.ts` - Content management
- `app/actions/manager-settings.ts` - Settings management

## Notes

- The system is designed to work alongside the existing admin system
- Admin users also have access to the manager dashboard
- Landing page managers do NOT have access to `/admin` routes
- All operations are logged for audit purposes
