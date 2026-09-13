# 📋 Add-On Order Flow Documentation

Complete flow ng add-on orders from customer → waiter → POS.

---

## 🔄 COMPLETE WORKFLOW

### Scenario: Customer wants to order more food after initial order

```
┌─────────────┐
│  CUSTOMER   │ Scan QR → Already has session
│  (Mobile)   │ Browse menu → Add items → Place order
└──────┬──────┘
       │
       │ createAdditionalOrder()
       ▼
┌─────────────┐
│  DATABASE   │ Creates order with:
│             │ - order_type: "additional"
│             │ - status: "confirmed" (skip pending)
│             │ - parent_order_id: (links to initial order)
│             │ - is_notified: false
└──────┬──────┘
       │
       │ Auto-sends to Kitchen
       ▼
┌─────────────┐
│   KITCHEN   │ Sees new order immediately
│             │ Status: confirmed → preparing → ready
└──────┬──────┘
       │
       │ Order marked "ready"
       ▼
┌─────────────┐
│   WAITER    │ Sees "ready" orders
│             │ Marks as "served" when delivered
└──────┬──────┘
       │
       │ Customer continues ordering...
       │ Multiple additional orders allowed
       ▼
┌─────────────┐
│     POS     │ Process payment for ENTIRE session
│             │ - All orders (initial + additionals)
│             │ - Combined total
│             │ - Single payment
└─────────────┘
```

---

## 📍 STEP-BY-STEP FLOW

### Step 1: Customer Creates Additional Order

**File:** `app/actions/customer-orders.ts` → `createAdditionalOrder()`

**What happens:**
1. ✅ Customer already has active session (from initial order)
2. ✅ Customer browses menu via QR code
3. ✅ Adds items to cart
4. ✅ Clicks "Place Order"

**Backend:**
```typescript
export async function createAdditionalOrder(input) {
  // Find initial order to link to
  const initialOrder = await supabase
    .from("orders")
    .eq("session_id", input.session_id)
    .eq("order_type", "initial")
    .single()

  // Create additional order
  const order = await supabase.from("orders").insert({
    order_type: "additional",        // ← Marks as add-on
    parent_order_id: initialOrder.id, // ← Links to initial order
    status: "confirmed",              // ← Skip "pending" - go straight to kitchen
    payment_status: "unpaid",
    is_notified: false,               // ← Staff needs to be notified
    // ... subtotal, tax, total
  })

  // Insert order items
  await supabase.from("order_items").insert(items)

  return { success: true, order_id: order.id }
}
```

**Key Points:**
- ✅ **No waiter approval needed** - goes directly to kitchen
- ✅ **Linked to initial order** via `parent_order_id`
- ✅ **Status: "confirmed"** (not "pending")
- ✅ **Creates notification** for staff

---

### Step 2: Kitchen Receives Order

**What happens:**
1. ✅ Kitchen dashboard automatically shows new order
2. ✅ Order appears with status: "confirmed"
3. ✅ Kitchen marks: confirmed → preparing → ready

**Flow:**
```
confirmed  →  preparing  →  ready
   (auto)     (kitchen)    (kitchen)
```

**No special handling needed** - additional orders work same as initial orders in kitchen.

---

### Step 3: Waiter Gets Notified

**File:** `app/actions/customer-orders.ts` → `getUnnotifiedAdditionalOrders()`

**What happens:**
1. ✅ Waiter dashboard polls for new additional orders
2. ✅ Shows notification: "New add-on order from Table X"
3. ✅ Waiter acknowledges notification

**Backend:**
```typescript
export async function getUnnotifiedAdditionalOrders() {
  const orders = await supabase
    .from("orders")
    .eq("order_type", "additional")
    .eq("is_notified", false)
    .in("status", ["confirmed", "preparing", "ready"])

  return { orders }
}
```

**Waiter Actions:**
- ✅ **View order details** - see what customer ordered
- ✅ **Monitor preparation** - track kitchen progress
- ✅ **Serve when ready** - mark as "served"

---

### Step 4: Waiter Serves Food

**File:** `app/actions/waiter.ts` → `updateWaiterOrderStatus()`

**What happens:**
1. ✅ Kitchen marks order as "ready"
2. ✅ Waiter sees order in "ready" status
3. ✅ Waiter picks up food
4. ✅ Waiter marks as "served"

**Backend:**
```typescript
export async function updateWaiterOrderStatus(orderId, status) {
  // Security: Waiters can ONLY mark "ready" → "served"
  const allowedTransitions = {
    ready: ["served"], // ← Only this transition allowed
  }

  await supabase.from("orders").update({
    status: "served",
    served_by: profile.id // ← Records who served it
  })

  return { success: true }
}
```

**Key Points:**
- ✅ **Waiters can only serve** - cannot modify kitchen statuses
- ✅ **Records who served** - accountability
- ✅ **Updates both order and items** status

---

### Step 5: Customer Orders More (Optional)

**What happens:**
1. ✅ Customer can order **unlimited** additional orders
2. ✅ Each additional order creates a **separate order record**
3. ✅ All linked via `parent_order_id` and `session_id`

**Example Session:**
```
Session #123:
├── Order #1 (initial, ₱500)
├── Order #2 (additional, ₱200)
├── Order #3 (additional, ₱150)
└── Order #4 (additional, ₱100)

Total: ₱950 (all combined at payment)
```

---

### Step 6: POS Processes Payment

**File:** `app/actions/table-sessions.ts` → `processTableSessionPayment()`

**What happens:**
1. ✅ Customer asks for bill
2. ✅ Waiter/POS opens session payment
3. ✅ **All orders aggregated** (initial + all additionals)
4. ✅ Single payment processes everything

**Backend:**
```typescript
export async function processTableSessionPayment(input) {
  // Get ALL unpaid orders for this session
  const orders = await supabase
    .from("orders")
    .eq("session_id", input.session_id)
    .in("payment_status", ["unpaid", "pending"])
    // ↑ Includes initial AND all additional orders

  // Calculate grand total
  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0)

  // Create ONE payment for entire session
  const payment = await supabase.from("payments").insert({
    amount: grandTotal,
    method: input.method, // cash/card/gcash/maya
    status: "paid",
  })

  // Mark ALL orders as paid
  await supabase.from("orders").update({
    payment_status: "paid",
    status: "completed",
  }).in("id", orders.map(o => o.id))

  // Close session
  await supabase.from("table_sessions").update({
    status: "closed",
    closed_reason: "paid",
  })

  return { success: true, total: grandTotal }
}
```

**Key Points:**
- ✅ **One payment for all orders** - not per order
- ✅ **Aggregates automatically** - sums all orders in session
- ✅ **Closes session** - table becomes available

---

## 🔍 DATA STRUCTURE

### Order Record (Additional)
```typescript
{
  id: "uuid",
  session_id: "session-123",        // ← Links to session
  table_id: "table-456",
  order_number: "ORD-789",
  
  order_type: "additional",         // ← Identifies as add-on
  parent_order_id: "order-initial", // ← Links to initial order
  
  status: "confirmed",              // ← Direct to kitchen
  payment_status: "unpaid",
  
  customer_name: "Maria",
  subtotal: 200.00,
  tax: 24.00,
  total: 224.00,
  
  is_notified: false,               // ← Staff notification flag
  
  created_by: null,                 // ← Customer order (not staff)
  assisted_by: null,                // ← No assist needed
  served_by: "waiter-uuid",         // ← Set when served
  
  created_at: "2026-09-13 10:30:00"
}
```

---

## 🎯 KEY FEATURES

### 1. **No Approval Needed**
- ✅ Add-on orders skip "pending" status
- ✅ Go directly to kitchen ("confirmed")
- ✅ Faster service for customers

### 2. **Linked Orders**
```
Initial Order → parent_order_id: null
Additional #1 → parent_order_id: initial_id
Additional #2 → parent_order_id: initial_id
Additional #3 → parent_order_id: initial_id
```

### 3. **Session-Based Payment**
- ✅ All orders in session paid together
- ✅ One receipt for entire session
- ✅ Customer doesn't pay per order

### 4. **Staff Notifications**
```typescript
getUnnotifiedAdditionalOrders()
→ Returns orders where is_notified = false
→ Waiter acknowledges
→ Sets is_notified = true
```

### 5. **Order Tracking**
```
Customer View:
- See ALL orders in session
- Real-time status updates
- Combined total

Waiter View:
- Notified of new add-ons
- Track preparation
- Serve when ready

POS View:
- See all orders by session
- Process combined payment
- Generate consolidated receipt
```

---

## ⚠️ IMPORTANT NOTES

### Security Rules:
1. ✅ **Customers can only create** additional orders (not modify)
2. ✅ **Waiters can only serve** (not change kitchen status)
3. ✅ **Kitchen handles** preparation status
4. ✅ **POS/Admin processes** payment

### Business Logic:
1. ✅ **One session = One table** at a time
2. ✅ **Multiple add-ons** allowed per session
3. ✅ **All orders linked** via session_id
4. ✅ **Single payment** for entire session

### Validation:
```typescript
// Check if session can order more
canSessionOrderMore(sessionId)
→ Returns: { canOrder: true/false, message }

// Requirements:
- Session must exist
- Session must have initial order
- Session must be active (not closed)
```

---

## 📊 EXAMPLE TIMELINE

```
10:00 AM - Customer scans QR, creates session
10:05 AM - Places initial order (burger, fries) = ₱300
10:10 AM - Kitchen prepares
10:20 AM - Waiter serves

10:25 AM - Customer wants more food
10:26 AM - Places additional order #1 (drinks) = ₱100
10:30 AM - Kitchen prepares, waiter serves

10:40 AM - Customer wants dessert
10:41 AM - Places additional order #2 (cake) = ₱150
10:45 AM - Kitchen prepares, waiter serves

11:00 AM - Customer asks for bill
11:01 AM - POS shows total = ₱550 (all 3 orders)
11:02 AM - Customer pays ₱550 cash
11:03 AM - Receipt generated
11:04 AM - Session closed, table available
```

---

## ✅ FLOW SUMMARY

| Step | Actor | Action | Status Change |
|------|-------|--------|---------------|
| 1 | Customer | Place add-on order | pending → confirmed |
| 2 | Kitchen | Prepare food | confirmed → preparing |
| 3 | Kitchen | Food ready | preparing → ready |
| 4 | Waiter | Serve food | ready → served |
| 5 | Customer | Order more (loop to step 1) | - |
| 6 | POS | Process payment | served → completed |
| 7 | System | Close session | session closed |

---

**Status:** ✅ WORKING AS DESIGNED  
**Last Verified:** September 13, 2026  
**Version:** Current (with 6-digit PINs)
