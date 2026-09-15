# ⚡ POS Cashflow - Quick Start Guide

## 🚀 Setup (5 Minutes)

### 1️⃣ Run SQL Migration
```
Supabase Dashboard → SQL Editor
Copy & paste: supabase/create_cash_remittances.sql
Click RUN
```

### 2️⃣ Test Routes
- **POS**: `/pos/cashflow` ✅
- **Admin**: `/admin/remittances` ✅

### 3️⃣ Done! 🎉

---

## 📱 Quick Access

### For POS Staff
```
Login → POS Dashboard → Cashflow
```
Or directly: `/pos/cashflow`

### For Admin
```
Login → Admin Dashboard → Remittances (if added to nav)
```
Or directly: `/admin/remittances`

---

## 💰 How to Submit Remittance (POS)

1. Click **"Submit Remittance"**
2. Count your cash drawer
3. Enter amount (or use +1000, +500 buttons)
4. Add notes if variance exists
5. Click **"Submit Remittance"**
6. Done! ✅

**Variance Explained:**
- **Green** (matches) = Perfect! ✅
- **Yellow** (overage) = You have more cash than expected
- **Red** (shortage) = You have less cash than expected

---

## ✅ How to Verify Remittance (Admin)

1. Go to `/admin/remittances`
2. Click **"Verify"** on pending remittance
3. Review details (expected vs declared)
4. Count the physical cash POS staff hands you
5. Select status:
   - **Verified** = Cash matches ✅
   - **Discrepancy** = Issue found 🔴
6. Add admin notes
7. Click **"Verify Remittance"**
8. Done! ✅

---

## 🎯 Key Features

### POS Cashflow Page
- 📊 Real-time sales dashboard
- 💰 Cash vs other payment methods
- 📝 Transaction history
- 💸 Submit remittance
- 📜 View past remittances

### Admin Remittances Page
- 📊 Summary statistics
- 🔍 Search & filter
- 👁️ Detailed viewer
- ✅ Verify/reject
- 💬 Add feedback notes

---

## 🔢 Quick Math

**Variance Formula:**
```
Variance = Declared Amount - Expected Amount

Examples:
Expected: ₱5,000, Declared: ₱5,020 = +₱20 Overage
Expected: ₱5,000, Declared: ₱4,980 = -₱20 Shortage
Expected: ₱5,000, Declared: ₱5,000 = ₱0 Perfect ✅
```

---

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| 🟡 Pending | Yellow | Awaiting verification |
| 🟢 Verified | Green | Approved by admin |
| 🔴 Discrepancy | Red | Issue documented |

---

## 🐛 Troubleshooting

**"Table does not exist"**
→ Run SQL migration

**"Unauthorized"**
→ Check user role (must be POS or Admin)

**"No transactions"**
→ Process some orders first

**Variance seems wrong**
→ Check transaction history for accuracy

---

## 📖 Full Documentation

- **Setup**: `CASHFLOW_SETUP.md`
- **User Guide**: `POS_CASHFLOW_GUIDE.md`
- **Implementation**: `CASHFLOW_IMPLEMENTATION_COMPLETE.md`

---

## 🎓 5-Minute Training

### POS Staff
1. "This page shows your shift sales"
2. "Count cash at end of shift"
3. "Click Submit Remittance"
4. "Enter exact amount"
5. "Add notes if different from expected"

### Admin
1. "All remittances appear here"
2. "Click Verify to review"
3. "Count the cash they give you"
4. "Mark as Verified or Discrepancy"
5. "Add notes for feedback"

---

## ✅ Checklist

Before going live:
- [ ] SQL migration run
- [ ] POS page loads
- [ ] Admin page loads
- [ ] Test remittance submission
- [ ] Test verification
- [ ] Staff trained

---

## 🎉 That's It!

**Time to deploy**: 5 minutes  
**Time to train**: 10 minutes  
**Total**: 15 minutes

**Questions?** Check the full documentation files.

---

**Built with ❤️ for smooth shift handovers and cash accountability**
