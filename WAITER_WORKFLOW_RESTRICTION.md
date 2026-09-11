# Waiter Workflow Restriction - Option B Implementation

## **Complete Separation of Duties**

Restaurant: **Lydias Lechon**  
Updated: September 11, 2026  
Security Level: ⭐⭐⭐⭐⭐ Enterprise Grade

---

## **New Authorization Model:**

### **🔵 WAITER ROLE - Limited Control**

Waiters can ONLY perform 2 actions:

1. **"Confirm"** - For pending orders (via Assist Modal)
2. **"Mark Served"** - When order status is "Ready"

**That's it!** No other status updates allowed.

---

## **Complete Workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│  PENDING ORDER (Customer QR scan or walk-in)                │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    👨‍🍳 WAITER CLAIMS
                    "Take This Order"
                           ↓
                ┌──────────────────────┐
                │   ASSIST MODAL       │
                │  - Add/Edit Items    │
                │  - Review Order      │
                │  [Confirm] Button    │ ✅ WAITER ACTION #1
                └──────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  CONFIRMED (Waiter confirmed order)                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    👨‍🍳 KITCHEN ROLE
                "Start Preparing" Button
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PREPARING (Kitchen is cooking)                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    👨‍🍳 KITCHEN ROLE
                   "Mark Ready" Button
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  READY (Food is ready for pickup)                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    👨‍🍳 WAITER DELIVERS
                  "Mark Served" Button ✅ WAITER ACTION #2
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  SERVED (Food delivered to table)                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    💰 POS/ADMIN ROLE
                 "Process Payment" Button
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PAID/COMPLETED (Payment received)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## **Role Permissions Matrix:**

| Status       | Waiter | Kitchen/Chef | POS/Admin |
|--------------|--------|--------------|-----------|
| Pending      | ✅ Confirm | ❌ | ❌ |
| Confirmed    | ❌ | ✅ Start Preparing | ❌ |
| Preparing    | ❌ | ✅ Mark Ready | ❌ |
| Ready        | ✅ Mark Served | ❌ | ❌ |
| Served       | ❌ | ❌ | ✅ Process Payment |
| Paid         | ❌ | ❌ | ✅ View Only |

---

## **Code Changes:**

### **1. FRONTEND - Assist Modal Button Text**

**File:** `components/dashboard/assist-modal.tsx`

**Before:**
```typescript
<span className="ml-1.5 sm:ml-2 hidden sm:inline">
  Confirm & Send to Kitchen
</span>
<span className="ml-1.5 sm:hidden">Confirm</span>
```

**After:**
```typescript
<span className="ml-1.5 sm:ml-2">Confirm</span>
```

**Confirmation Prompt Changed:**
```typescript
// Before
if (!confirm("Send this order to the kitchen?")) return

// After
if (!confirm("Confirm this order?")) return
```

---

### **2. FRONTEND - NEXT_STATUS Map**

**File:** `components/dashboard/waiter-orders-client.tsx`

**Before:**
```typescript
const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
}
```

**After:**
```typescript
const NEXT_STATUS = {
  // Waiters can only mark "Ready" orders as "Served"
  ready: "served",
  // Kitchen handles: confirmed → preparing → ready
  // POS/Admin handles: served → completed (paid)
}
```

---

### **3. BACKEND - Authorization Logic**

**File:** `app/actions/waiter.ts`

**Before:**
```typescript
export async function updateWaiterOrderStatus(orderId: string, status: OrderStatus) {
  // Simple check - blocks "completed" only
  if (status === "completed") {
    return { error: "Not authorized: Only POS and Admin can process payments" }
  }
  
  const patch: Record<string, unknown> = { status }
  // Allow any other status update
}
```

**After:**
```typescript
export async function updateWaiterOrderStatus(orderId: string, status: OrderStatus) {
  // Strict whitelist - only allow ready → served
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: [], // Use confirmWaiterOrder() instead
    confirmed: [], // Kitchen only
    preparing: [], // Kitchen only
    ready: ["served"], // ✅ Waiter can serve
    served: [], // POS/Admin only
    completed: [],
    cancelled: [],
  }

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single()

  if (!order) return { error: "Order not found" }

  const currentStatus = order.status as OrderStatus
  const allowed = allowedTransitions[currentStatus] || []

  if (!allowed.includes(status)) {
    return { 
      error: `Not authorized: Waiters can only mark "Ready" orders as "Served". Kitchen handles food preparation.` 
    }
  }
  
  // Proceed with allowed update
}
```

---

## **Security Layers:**

### **✅ Layer 1: Frontend UI (Waiter View)**
- No status buttons show for Confirmed/Preparing orders
- Only "Mark Served" button shows for Ready orders
- "Confirm" button only in Assist Modal for Pending orders

### **✅ Layer 2: Backend Authorization**
- `updateWaiterOrderStatus()` uses strict whitelist
- Only allows `ready → served` transition
- Rejects all other status changes with clear error message
- Pending orders use separate `confirmWaiterOrder()` function

### **✅ Layer 3: Separation of Duties**
- Waiter: Confirm order + Serve food
- Kitchen: Prepare food (Confirmed → Preparing → Ready)
- POS/Admin: Process payment (Served → Paid)

---

## **User Experience:**

### **👨‍🍳 Waiter Workflow:**

**Step 1: Take Order**
1. See "Pending" order in Orders page
2. Click "Take This Order"
3. Assist Modal opens with order details

**Step 2: Confirm Order**
1. Review/edit items in modal
2. Click **"Confirm"** button
3. Confirmation prompt: "Confirm this order?"
4. Order sent to kitchen → Status becomes "Confirmed"
5. ✅ **Waiter's job done for now**

**Step 3: Wait for Kitchen**
1. Waiter CANNOT update Confirmed/Preparing orders
2. No buttons show for these statuses
3. Kitchen staff handles all food preparation
4. Waiter monitors order progress

**Step 4: Deliver Food**
1. Order status becomes "Ready" (Kitchen marked it)
2. **"Mark Served"** button appears
3. Waiter delivers food to table
4. Click "Mark Served"
5. ✅ **Waiter's job done**

**Step 5: Payment**
1. Customer ready to pay
2. Waiter brings bill to POS/Cashier
3. POS processes payment
4. Order marked as "Paid"

---

### **👨‍🍳 Kitchen/Chef Workflow:**

**Kitchen receives Confirmed orders:**
1. See "Confirmed" orders in Kitchen dashboard
2. Click **"Start Preparing"** → Status: Preparing
3. Cook the food
4. Click **"Mark Ready"** → Status: Ready
5. Waiter picks up and serves

---

### **💰 POS/Cashier Workflow:**

**POS receives Served orders:**
1. See "Served" orders in POS dashboard
2. Customer pays at counter
3. Select payment method (Cash/Card/GCash/Maya)
4. Click **"Process Payment"**
5. Status: Paid/Completed
6. Print receipt

---

## **Benefits:**

### **1. Clear Accountability** ✅
- Each role has specific, limited responsibilities
- Can't blame waiter for kitchen delays
- Can't blame kitchen for service delays
- Payment processing isolated to authorized cashiers

### **2. Kitchen Autonomy** ✅
- Kitchen controls their own workflow
- Waiter can't rush or skip preparation stages
- Kitchen sets realistic timing
- Better food quality control

### **3. Financial Security** ✅
- Only POS/Admin can process payments
- Prevents unauthorized order completion
- Clear audit trail of who handled money
- Reduces fraud opportunities

### **4. Better SLA Tracking** ✅
- Can measure kitchen performance separately
- Can measure waiter service speed separately
- Identify bottlenecks accurately
- Optimize each stage independently

### **5. Realistic Operations** ✅
- Matches real restaurant workflow
- Waiter doesn't control kitchen
- Kitchen doesn't handle payments
- Each role focuses on their expertise

---

## **Error Messages:**

### **Waiter tries to update Confirmed order:**
```
❌ Not authorized: Waiters can only mark "Ready" orders as "Served". 
Kitchen handles food preparation.
```

### **Waiter tries to update Preparing order:**
```
❌ Not authorized: Waiters can only mark "Ready" orders as "Served". 
Kitchen handles food preparation.
```

### **Waiter tries to mark Served order as Paid:**
```
❌ Not authorized: Waiters can only mark "Ready" orders as "Served". 
Kitchen handles food preparation.
```

---

## **Testing Checklist:**

### **✅ Waiter Account:**
- [ ] Can click "Take This Order" for Pending orders
- [ ] Assist Modal opens with "Confirm" button (not "Confirm & Send to Kitchen")
- [ ] Confirmation prompt shows "Confirm this order?"
- [ ] After confirm, status becomes "Confirmed"
- [ ] No status button shows for Confirmed orders
- [ ] No status button shows for Preparing orders
- [ ] "Mark Served" button shows for Ready orders
- [ ] Can successfully mark Ready → Served
- [ ] No button shows for Served orders
- [ ] Cannot manually update to Preparing/Completed via API

### **✅ Kitchen Account (if implemented):**
- [ ] Can see Confirmed orders
- [ ] Can mark Confirmed → Preparing
- [ ] Can mark Preparing → Ready
- [ ] Cannot mark orders as Served or Paid

### **✅ POS Account:**
- [ ] Can see all orders including Served
- [ ] Can process payment for Served orders
- [ ] Can mark Served → Paid/Completed
- [ ] Payment methods work (Cash/Card/GCash/Maya)

---

## **Related Documentation:**
- `WAITER_PAYMENT_AUTHORIZATION.md` - Payment security (Served → Paid restriction)
- `WAITER_UX_IMPROVEMENTS.md` - UI/UX enhancements
- `WAITER_ORDERS_REDESIGN.md` - Enterprise-grade card design

---

**Status:** ✅ Fully Implemented  
**Version:** 2.0 - Complete Workflow Separation  
**Security:** Enterprise Grade ⭐⭐⭐⭐⭐

