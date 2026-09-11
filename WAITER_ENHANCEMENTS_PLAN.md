# Waiter Account Enhancements - Implementation Plan

Restaurant: **Lydias Lechon**  
Date: September 11, 2026  
Status: **In Progress**

---

## **✅ FEATURE 1: Order History / Completed Tab**

### **Status:** COMPLETED ✅

### **Changes Made:**
1. **Backend** (`app/actions/waiter.ts`):
   - Removed filter that excluded completed/cancelled orders
   - Now returns ALL orders to frontend
   - Frontend handles filtering via tabs

2. **Frontend** (`components/dashboard/waiter-orders-client.tsx`):
   - Already has "Completed" and "Cancelled" status tabs
   - Tabs already show correct counts
   - No additional changes needed!

### **Result:**
- Waiters can now view completed orders
- Waiters can see cancelled orders
- Full order history available
- Tabs show all statuses with counts

---

## **🚧 FEATURE 2: Table Management View**

### **Status:** PENDING

### **Implementation Plan:**

**A. Add "Tables" Button to Header**
```tsx
<Button variant="ghost" size="sm" onClick={() => setShowTablesSheet(true)}>
  <Grid3x3 className="size-4" />
  <span className="ml-2 hidden sm:inline">Tables</span>
</Button>
```

**B. Create Tables Sheet Component**
- Sliding sheet from right (desktop) or bottom (mobile)
- Grid view of all tables
- Color-coded by status:
  - Green: Available
  - Blue: Occupied
  - Amber: Reserved
- Show table number, capacity, assigned waiter

**C. Table Actions**
- Tap to view table details
- See active orders for that table
- Quick "Seat Customer" button

**D. Backend Already Exists**
- `getWaiterTables()` already implemented
- Returns tables with order counts
- Just need to call it

---

## **🚧 FEATURE 3: Notifications System**

### **Status:** PENDING

### **Implementation Plan:**

**A. Real-Time Notifications**
- Supabase real-time subscription for:
  - New orders (pending)
  - Orders ready (ready status)
  - Urgent orders (>15min old)

**B. Notification UI**
- Bell icon in header with badge count
- Click to show notifications sheet
- List of recent notifications with:
  - Icon (🔔 New, ✅ Ready, ⚠️ Urgent)
  - Message ("Order B-1 is ready!")
  - Time ago ("2m ago")
  - Action button ("View Order")

**C. Browser Notifications**
- Request permission on first load
- Send browser notification for urgent orders
- Vibration on mobile (if supported)

**D. Sound Alerts (Optional)**
- Subtle notification sound
- Different sounds for different events
- Toggle on/off in settings

---

## **🚧 FEATURE 4: Customer Service Features**

### **Status:** PENDING

### **Implementation Plan:**

**A. Enhanced Order Details**
Show in View Details dialog:
- Customer name (already shown)
- Customer phone number
- Special requests/notes
- Dietary restrictions
- Previous orders (optional)

**B. Add Special Requests Field**
In Assist Modal:
```tsx
<Textarea
  placeholder="Special requests (e.g., no onions, allergies...)"
  value={specialRequests}
  onChange={(e) => setSpecialRequests(e.target.value)}
/>
```

**C. Internal Notes**
- Add notes visible only to staff
- "Customer prefers table by window"
- "VIP customer"
- "Celebrating birthday"

**D. Customer History (Optional)**
- Show previous orders from this customer
- Favorite dishes
- Average spending
- Last visit date

**E. Database Schema Update**
May need to add:
```sql
ALTER TABLE orders 
ADD COLUMN customer_phone TEXT,
ADD COLUMN special_requests TEXT,
ADD COLUMN dietary_restrictions TEXT,
ADD COLUMN internal_notes TEXT;
```

---

## **Priority Order:**

1. ✅ **Order History** - DONE
2. 🔴 **Notifications System** - HIGH PRIORITY (improves service speed)
3. 🟡 **Table Management** - MEDIUM (nice to have for seating)
4. 🟢 **Customer Service** - LOW (enhances but not critical)

---

## **Implementation Status:**

- [x] Order History / Completed Tab
- [ ] Notifications System
  - [ ] Real-time subscription
  - [ ] Notification bell UI
  - [ ] Browser notifications
  - [ ] Sound alerts
- [ ] Table Management View
  - [ ] Tables sheet/modal
  - [ ] Grid layout
  - [ ] Status indicators
  - [ ] Table actions
- [ ] Customer Service Features
  - [ ] Special requests field
  - [ ] Customer info display
  - [ ] Internal notes
  - [ ] Order history

---

**Next Steps:**
1. Implement Notifications System first (highest value)
2. Then Table Management View
3. Finally Customer Service enhancements

