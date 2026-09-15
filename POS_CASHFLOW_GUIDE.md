# POS Cashflow & Remittance System

## Overview

The POS Cashflow page provides comprehensive transaction tracking and cash remittance functionality for POS staff. This ensures accountability and smooth shift handovers.

---

## Features

### 📊 Real-Time Sales Dashboard
- **Total Sales**: Combined revenue from all payment methods
- **Payment Method Breakdown**:
  - Cash (requires physical remittance)
  - Card (electronic)
  - GCash (electronic)
  - Maya (electronic)
- **Transaction Counts**: Track number of transactions per method
- **Shift Tracking**: Automatic tracking since last remittance or shift start

### 💰 Cash Remittance System
POS staff can submit cash to admin with:
- **Expected vs Actual**: System compares recorded sales with declared amount
- **Variance Detection**: Automatic calculation of overage/shortage
- **Quick Amount Buttons**: Fast counting with denomination helpers (+1000, +500, etc.)
- **Notes Field**: Document reasons for discrepancies or special circumstances
- **Status Tracking**: Monitor remittance verification status

### 📋 Transaction History
- Real-time list of all transactions in current shift
- Detailed breakdown showing:
  - Order number and time
  - Table/customer information
  - Payment method with visual icons
  - Transaction amount

### 📜 Remittance History
View all past remittances with:
- Remittance number for tracking
- Expected vs declared amounts
- Variance (overage/shortage)
- Verification status (pending/verified/discrepancy)
- Admin who received the cash
- Admin notes/feedback

---

## Usage Workflow

### For POS Staff

#### Daily Operations
1. **Monitor Sales**: View real-time dashboard throughout shift
2. **Track Transactions**: Review transaction list for accuracy
3. **Count Cash**: Before shift end, physically count cash in drawer

#### Submitting Remittance
1. Click **"Submit Remittance"** button
2. System shows:
   - Expected cash (from system records)
   - Current declared amount
3. Count your physical cash
4. Use quick buttons or type exact amount
5. System shows variance if any:
   - ✓ Green = Matches perfectly
   - ⚠️ Yellow = Discrepancy detected
6. Add notes explaining any variance
7. Click **"Submit Remittance"**

#### After Submission
- Remittance status shows "Pending Verification"
- Wait for admin to verify and receive cash
- Status updates to "Verified" or "Discrepancy"
- Check admin notes for feedback

### For Admins

Admins can:
- View all POS staff remittances
- Verify cash matches declared amount
- Add notes about discrepancies
- Mark as verified or document issues

---

## Status Indicators

| Status | Meaning | Color |
|--------|---------|-------|
| **Pending Verification** | Submitted, awaiting admin verification | 🟡 Yellow |
| **Verified** | Admin confirmed cash matches | 🟢 Green |
| **Discrepancy** | Variance detected or documented | 🔴 Red |

---

## Variance Handling

### What is Variance?
**Variance = Declared Amount - Expected Amount**

- **Positive Variance (Overage)**: You declared more cash than system recorded
  - Example: Expected ₱5,000, Declared ₱5,020 = +₱20 overage
  
- **Negative Variance (Shortage)**: You declared less cash than system recorded
  - Example: Expected ₱5,000, Declared ₱4,980 = -₱20 shortage

### Common Causes
1. **Customer gave wrong change** (you gave back too little/much)
2. **Personal cash mixed in** (your own money in drawer)
3. **Forgot to ring up a sale** (cash received but not recorded)
4. **Refund not recorded properly**
5. **Counting error** (miscount during remittance)

### Best Practices
- Always count cash twice before submitting
- Document any unusual transactions in notes
- Separate your personal money from cash drawer
- Ring up ALL sales immediately
- Report discrepancies honestly with explanation

---

## Database Schema

### `cash_remittances` Table

```sql
- id: UUID (primary key)
- remittance_number: Auto-incrementing number
- remitted_by: POS user ID
- received_by: Admin user ID (null until verified)
- cash_amount: Expected cash from system
- declared_amount: Actual cash counted by POS
- variance: Auto-calculated (declared - expected)
- total_transactions: Count of all transactions
- cash_transactions: Count of cash-only transactions
- card_amount, gcash_amount, maya_amount: Reference amounts
- shift_start_at: When shift/tracking started
- shift_end_at: When remittance submitted
- status: pending | verified | discrepancy
- pos_notes: Notes from POS staff
- admin_notes: Notes from admin
- created_at, updated_at: Timestamps
```

---

## Setup Instructions

### 1. Run SQL Migration

Execute in Supabase SQL Editor:

```bash
supabase/create_cash_remittances.sql
```

This creates:
- `cash_remittances` table
- Indexes for performance
- RLS policies for security
- Triggers for auto-update

### 2. Verify Permissions

Ensure RLS policies allow:
- POS users can create and view their own remittances
- Admins can view and update all remittances

### 3. Test Workflow

1. Login as POS user
2. Process some test orders with cash payments
3. Navigate to `/pos/cashflow`
4. Submit a test remittance
5. Login as Admin
6. Verify remittance appears in admin panel

---

## API Actions

### `getPosCashflowSummary()`
Fetches current shift summary for logged-in POS user
- Returns sales breakdown by payment method
- Lists recent transactions
- Shows remittance history

### `submitCashRemittance()`
Creates new remittance record
- Validates declared amount
- Calculates actual cash from system
- Auto-detects discrepancies
- Sends to admin for verification

### `verifyRemittance()` (Admin only)
Updates remittance status
- Marks as verified or documents discrepancy
- Adds admin notes
- Records who received the cash

---

## Navigation

Access via: **POS Dashboard → Cashflow**

Route: `/pos/cashflow`

---

## Security Features

- **Row Level Security**: Users only see their own data (admins see all)
- **Auto-calculation**: Variance calculated by database (can't be manipulated)
- **Audit Trail**: All remittances permanently logged
- **User Tracking**: System tracks who submitted and who received

---

## Tips for Accuracy

### For POS Staff
1. Keep cash drawer organized by denomination
2. Don't mix personal cash with drawer cash
3. Ring up sales immediately
4. Count cash at shift start and end
5. Double-check your count before submitting
6. Document any unusual situations in notes

### For Admins
1. Verify cash in presence of POS staff when possible
2. Count cash yourself, don't rely on POS count alone
3. Investigate recurring discrepancies with same staff
4. Provide constructive feedback in admin notes
5. Follow up on significant variances

---

## Troubleshooting

### "Cannot submit remittance"
- Ensure declared amount is entered and valid
- Check that you have processed transactions in this shift
- Verify network connection

### "Expected cash doesn't match my count"
- Review transaction list for missed/double entries
- Check if any refunds were processed
- Look for personal cash mixed in drawer
- Document discrepancy in notes field

### "Remittance history not loading"
- Refresh the page
- Check browser console for errors
- Verify database connection

---

## Future Enhancements

Potential additions:
- [ ] Print remittance receipt
- [ ] Denomination breakdown (how many of each bill)
- [ ] Photo upload (picture of cash counted)
- [ ] SMS notification to admin on submission
- [ ] Scheduled automatic remittance reminders
- [ ] Export remittance reports to Excel
- [ ] Multi-currency support
- [ ] Integration with safe/vault tracking

---

## Support

For issues or questions:
1. Check transaction history for accuracy
2. Review this guide
3. Contact system administrator
4. Report bugs to development team
