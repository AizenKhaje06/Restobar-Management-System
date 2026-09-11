# Additional Orders Feature - Implementation Guide

## 🎯 Overview

This feature allows customers who are already dining to order more items (drinks, food, pulutan) directly from their QR menu without needing waiter approval. This is **perfect for Lydias Lechon restobar** where customers frequently order multiple rounds of drinks and snacks.

---

## ✅ What Was Implemented

### 1. Database Schema (`20240911000003_add_additional_orders_support.sql`)

**New Fields Added to `orders` Table:**
- `order_type` - ENUM: 'initial' | 'additional'
- `parent_order_id` - UUID: Links additional orders to the original order
- `is_notified` - BOOLEAN: Tracks if staff has been notified

**New Database Objects:**
- `order_families` VIEW - Groups orders for easy billing (initial + all additional orders)
- `get_initial_order_id()` FUNCTION - Finds the root order for any order
- **Indexes** for performance:
  - `idx_orders_parent_order_id`
  - `idx_orders_order_type`
  - `idx_orders_table_session`

### 2. TypeScript Types (`lib/types.ts`)

- Added `OrderType` type: `"initial" | "additional"`
- Updated `Order` interface with new fields:
  - `order_type: OrderType`
  - `parent_order_id: string | null`
  - `is_notified: boolean`

### 3. Backend Actions (`app/actions/customer-orders.ts`)

**New Server Actions:**
- `createAdditionalOrder()` - Creates additional order, goes directly to kitchen
- `getSessionOrders()` - Gets all orders for a session (initial + additional)
- `canSessionOrderMore()` - Checks if session can place additional orders
- `getCustomerMenu()` - Gets menu for customer view
- `markAdditionalOrderNotified()` - Marks order as seen by staff
- `getUnnotifiedAdditionalOrders()` - Gets new additional orders for notifications

### 4. Customer UI Components

**OrderMoreModal** (`components/customer/order-more-modal.tsx`)
- Full-featured shopping cart interface
- Category filtering and search
- Real-time cart updates with quantity controls
- Success confirmation animation
- Responsive design (mobile + desktop)

**Key Features:**
- Browse menu with categories
- Add items to cart with quantity controls
- See real-time subtotal
- One-click submit to kitchen
- Success feedback with order number

### 5. Staff UI Components

**AdditionalOrderBadge** (`components/staff/additional-order-badge.tsx`)
- Visual badge to identify additional orders
- Animated "new order" indicator (pulsing dot)
- Gradient amber/orange styling for visibility

---

## 🚀 Integration Steps

### Step 1: Apply Database Migration

**Using Supabase Dashboard (Recommended):**
1. Go to: https://szfvjfvukicjmuxogglt.supabase.co
2. Click **SQL Editor** → **New Query**
3. Copy contents of `supabase/migrations/20240911000003_add_additional_orders_support.sql`
4. Run the query
5. Verify success

**Or using Supabase CLI:**
```bash
supabase db push
```

### Step 2: Update Customer Order Page

Modify `app/order/page.tsx` to add the "Order More" button.

**Add imports:**
```typescript
import { OrderMoreModal } from "@/components/customer/order-more-modal"
import { canSessionOrderMore, getCustomerMenu } from "@/app/actions/customer-orders"
import { ShoppingCart } from "lucide-react"
```

**Add state in the component:**
```typescript
const [showOrderMore, setShowOrderMore] = useState(false)
const [canOrderMore, setCanOrderMore] = useState(false)
const [menu, setMenu] = useState<{ categories: Category[], menuItems: MenuItem[] }>({ categories: [], menuItems: [] })
```

**Add effect to check if session can order more:**
```typescript
useEffect(() => {
  if (!sessionState.sessionId) return
  
  async function checkCanOrderMore() {
    const result = await canSessionOrderMore(sessionState.sessionId!)
    setCanOrderMore(result.canOrder ?? false)
    
    if (result.canOrder) {
      const menuData = await getCustomerMenu()
      setMenu({
        categories: menuData.categories,
        menuItems: menuData.menuItems
      })
    }
  }
  
  checkCanOrderMore()
}, [sessionState.sessionId])
```

**Add "Order More" button (place after the OrderStatusTracker):**
```typescript
{canOrderMore && sessionState.sessionId && (
  <Button
    size="lg"
    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
    onClick={() => setShowOrderMore(true)}
  >
    <ShoppingCart className="size-5 mr-2" />
    Order More Items
  </Button>
)}

{/* Order More Modal */}
<OrderMoreModal
  open={showOrderMore}
  onClose={() => setShowOrderMore(false)}
  categories={menu.categories}
  menuItems={menu.menuItems}
  sessionId={sessionState.sessionId ?? ""}
  tableId={table?.id ?? ""}
  customerName={sessionState.myName ?? null}
/>
```

### Step 3: Update Waiter Orders Display

Modify `components/dashboard/waiter-orders-client.tsx` to show additional order badges.

**Add import:**
```typescript
import { AdditionalOrderBadge, NewOrderIndicator } from "@/components/staff/additional-order-badge"
```

**Update the WaiterOrderCard component to show badge:**
```typescript
// In the card header, add:
<div className="flex items-center gap-2 flex-wrap">
  <Badge className={STATUS_CONFIG[order.status]?.color}>
    {STATUS_CONFIG[order.status]?.label}
  </Badge>
  <AdditionalOrderBadge orderType={order.order_type} />
  {order.order_type === 'additional' && !order.is_notified && (
    <NewOrderIndicator />
  )}
</div>
```

**Add notification system (optional but recommended):**
```typescript
// Add at top of component
const [unnotifiedOrders, setUnnotifiedOrders] = useState<string[]>([])

useEffect(() => {
  const checkUnnotified = async () => {
    const result = await getUnnotifiedAdditionalOrders()
    if (result.orders) {
      setUnnotifiedOrders(result.orders.map(o => o.id))
    }
  }
  
  checkUnnotified()
  const interval = setInterval(checkUnnotified, 10000) // Check every 10s
  return () => clearInterval(interval)
}, [])

// When waiter views an additional order:
const handleViewOrder = async (order: WaiterOrder) => {
  if (order.order_type === 'additional' && !order.is_notified) {
    await markAdditionalOrderNotified(order.id)
    setUnnotifiedOrders(prev => prev.filter(id => id !== order.id))
  }
  setSelectedOrder(order)
}
```

### Step 4: Update POS Orders Display

Similar to waiter view, add badges to POS order cards in:
- `app/pos/orders/page.tsx`
- Any order display components

### Step 5: Update Order Detail Dialogs

Show parent order information for additional orders:

```typescript
{selectedOrder?.order_type === 'additional' && selectedOrder?.parent_order_id && (
  <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
    <p className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
      <Sparkles className="size-4" />
      Additional Order
    </p>
    <p className="text-amber-600/80 dark:text-amber-400/70 text-xs mt-1">
      This is a follow-up order from the same table
    </p>
  </div>
)}
```

### Step 6: Update Billing/Payment System

Modify `app/actions/pos.ts` to handle order families:

**Add function to get all orders in a family:**
```typescript
export async function getOrderFamily(orderId: string) {
  const supabase = await createClient()
  
  // Get the initial order ID
  const { data: initialId } = await supabase.rpc('get_initial_order_id', { order_id: orderId })
  
  // Get all orders in this family
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(*)
    `)
    .or(`id.eq.${initialId},parent_order_id.eq.${initialId}`)
    .neq("status", "cancelled")
    .order("created_at")
  
  if (error) return { error: error.message }
  
  // Calculate family totals
  const familySubtotal = orders?.reduce((s, o) => s + Number(o.subtotal), 0) ?? 0
  const familyTax = orders?.reduce((s, o) => s + Number(o.tax), 0) ?? 0
  const familyTotal = orders?.reduce((s, o) => s + Number(o.total), 0) ?? 0
  
  return {
    orders: orders ?? [],
    familySubtotal,
    familyTax,
    familyTotal,
  }
}
```

**Update payment processing to mark all orders in family as paid:**
```typescript
// In processPosPayment, after successful payment:
const { data: familyOrders } = await supabase
  .from("orders")
  .select("id")
  .or(`id.eq.${order_id},parent_order_id.eq.${order_id}`)
  .neq("status", "cancelled")

if (familyOrders) {
  await supabase
    .from("orders")
    .update({ 
      payment_status: "paid", 
      status: "completed",
      completed_at: new Date().toISOString()
    })
    .in("id", familyOrders.map(o => o.id))
}
```

---

## 🧪 Testing Checklist

### Customer Flow
1. ✅ Scan QR code and create initial order
2. ✅ Wait for order to be confirmed/served
3. ✅ Click "Order More Items" button
4. ✅ Browse menu with category filters
5. ✅ Add items to cart, adjust quantities
6. ✅ Submit additional order
7. ✅ Verify success message with order number
8. ✅ See additional order in status tracker
9. ✅ Additional order shows "confirmed" status immediately

### Waiter View
1. ✅ See additional orders with amber "Additional" badge
2. ✅ See pulsing indicator for unnotified additional orders
3. ✅ Click to view order details
4. ✅ Indicator disappears after viewing
5. ✅ Can see parent order information
6. ✅ Additional order goes through normal workflow (preparing → ready → served)

### POS View
1. ✅ See all orders with order type badges
2. ✅ Can view order family (initial + all additional orders)
3. ✅ Billing shows combined total for all orders at table
4. ✅ Payment marks all orders in family as paid

### Kitchen View
1. ✅ Additional orders appear immediately (no waiting for waiter)
2. ✅ Kitchen can see order type badge
3. ✅ Can prepare additional orders independently

---

## 🔧 Configuration Options

### Adjust Auto-Notification Interval
In waiter/POS components, change polling interval:
```typescript
const interval = setInterval(checkUnnotified, 10000) // 10 seconds (default)
// Increase to reduce server load, decrease for faster notifications
```

### Require Waiter Approval for Additional Orders
If you want approval instead of direct-to-kitchen:

In `app/actions/customer-orders.ts`, change:
```typescript
status: "confirmed" as OrderStatus, // Direct to kitchen
```
To:
```typescript
status: "pending" as OrderStatus, // Requires waiter approval
```

### Limit Additional Order Count
Add validation in `canSessionOrderMore()`:
```typescript
const { count } = await supabase
  .from("orders")
  .select("*", { count: "exact", head: true })
  .eq("session_id", sessionId)
  .eq("order_type", "additional")

if (count >= 5) {
  return { canOrder: false, message: "Maximum additional orders reached" }
}
```

---

## 📊 Database Queries for Reporting

### Get All Additional Orders Today
```sql
SELECT 
  o.order_number,
  o.customer_name,
  t.label AS table_label,
  o.total,
  o.created_at
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
WHERE o.order_type = 'additional'
  AND o.created_at >= CURRENT_DATE
  AND o.status != 'cancelled'
ORDER BY o.created_at DESC;
```

### Get Average Additional Orders Per Table
```sql
SELECT 
  AVG(additional_count) as avg_additional_orders
FROM (
  SELECT 
    parent_order_id,
    COUNT(*) as additional_count
  FROM orders
  WHERE order_type = 'additional'
    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY parent_order_id
) subquery;
```

### Get Revenue from Additional Orders
```sql
SELECT 
  SUM(total) as additional_revenue,
  COUNT(*) as additional_order_count
FROM orders
WHERE order_type = 'additional'
  AND payment_status = 'paid'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

## 🆘 Troubleshooting

### Issue: "Order More" button not appearing
**Check:**
1. ✅ Migration applied successfully?
2. ✅ Session has at least one initial order?
3. ✅ `canSessionOrderMore()` returning `canOrder: true`?
4. ✅ Browser console for errors?

### Issue: Additional order not going to kitchen
**Check:**
1. ✅ Order status set to "confirmed" in `createAdditionalOrder()`?
2. ✅ Kitchen view filtering for "confirmed" status?
3. ✅ Check `orders` table for the new order

### Issue: Badge not showing on staff views
**Check:**
1. ✅ `order_type` field populated in query?
2. ✅ `AdditionalOrderBadge` component imported?
3. ✅ Component receiving correct `order_type` prop?

### Issue: Payment not marking all orders as paid
**Check:**
1. ✅ `getOrderFamily()` function implemented?
2. ✅ Payment processing updated to handle families?
3. ✅ All orders have correct `parent_order_id`?

---

## 🎨 UI Customization

### Change Badge Colors
In `components/staff/additional-order-badge.tsx`:
```typescript
className="bg-gradient-to-r from-amber-500 to-orange-500" 
// Change to any color combination you prefer
```

### Modify Order More Button Style
In customer order page:
```typescript
className="bg-gradient-to-r from-amber-500 to-orange-500"
// Match your restaurant's brand colors
```

### Adjust Modal Size
In `OrderMoreModal`:
```typescript
<DialogContent className="max-w-4xl h-[90vh]"> 
// Change max-w-4xl to max-w-5xl for larger modal
// Change h-[90vh] to adjust height
```

---

## 📈 Future Enhancements

### Potential Improvements:
1. **Time-based restrictions** - Limit additional orders during peak hours
2. **Item suggestions** - Recommend popular add-ons based on initial order
3. **Discount rules** - Auto-apply discounts for multiple orders
4. **Guest preferences** - Remember frequently ordered items per guest
5. **Split billing** - Allow splitting payment across order family
6. **Order bundling** - Combine multiple additional orders into single kitchen ticket

---

## ✅ Deployment Checklist

Before going live:

1. ☐ Apply all migrations to production database
2. ☐ Test complete customer flow end-to-end
3. ☐ Verify staff notifications working
4. ☐ Test payment with order families
5. ☐ Train staff on new feature
6. ☐ Update customer-facing materials (table tents, etc.)
7. ☐ Monitor first day for issues
8. ☐ Collect feedback from customers and staff

---

**Questions or issues?** Check the troubleshooting section or review the implementation files listed above.

**Ready to test?** Start with Step 1 (Apply Migration) and work through the integration steps!
