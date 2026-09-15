# 🚀 POS Cashflow System - Setup Instructions

## Quick Setup (3 Steps)

### Step 1: Run SQL Migration in Supabase

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy content from: `supabase/create_cash_remittances.sql`
3. Click **RUN**
4. Verify success message appears

### Step 2: Test the Pages

#### POS Staff View
- Navigate to: `/pos/cashflow`
- You should see:
  - Sales summary (cash, card, gcash, maya)
  - Recent transactions list
  - Remittance history
  - "Submit Remittance" button

#### Admin View
- Navigate to: `/admin/remittances`
- You should see:
  - Summary cards (total, verified, discrepancies)
  - All remittances table
  - Verify buttons for pending remittances

### Step 3: Test Workflow

1. **Login as POS user**
2. Process some orders with cash payments
3. Go to `/pos/cashflow`
4. Click "Submit Remittance"
5. Enter cash amount (can use quick buttons)
6. Add notes if needed
7. Submit

8. **Login as Admin**
9. Go to `/admin/remittances`
10. Find the submitted remittance
11. Click "Verify"
12. Review details
13. Mark as "Verified" or "Discrepancy"
14. Add admin notes
15. Submit verification

---

## Features Included

### ✅ POS Staff Features

**Dashboard (`/pos/cashflow`)**
- 📊 Real-time sales breakdown by payment method
- 💰 Current shift tracking (auto-calculated since last remittance)
- 📝 Transaction history with filters
- 📜 Remittance submission history
- ⚡ Quick amount calculator (+1000, +500, etc.)
- 📋 Variance detection (overage/shortage)
- 💬 Notes field for documentation

### ✅ Admin Features

**Remittances Page (`/admin/remittances`)**
- 📊 Summary statistics dashboard
- 🔍 Search and filter remittances
- 👁️ Detailed remittance viewer
- ✅ Verify/reject functionality
- 💬 Admin notes for feedback
- 📈 Variance tracking across all remittances
- 👤 Staff accountability tracking

---

## File Structure

```
app/
├── actions/
│   └── pos-cashflow.ts          # Server actions for cashflow operations
├── pos/
│   └── cashflow/
│       └── page.tsx              # POS cashflow page
└── admin/
    └── remittances/
        └── page.tsx              # Admin remittances page

components/
├── dashboard/
│   └── pos-cashflow-client.tsx  # POS cashflow UI component
└── admin/
    └── remittances-client.tsx   # Admin remittances UI component

supabase/
└── create_cash_remittances.sql  # Database schema

lib/
└── types.ts                     # CashRemittance type added

docs/
├── POS_CASHFLOW_GUIDE.md       # User guide
└── CASHFLOW_SETUP.md           # This file
```

---

## Database Schema

### `cash_remittances` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `remittance_number` | SERIAL | Auto-incrementing display number |
| `remitted_by` | UUID | POS staff user ID |
| `received_by` | UUID | Admin user ID (null until verified) |
| `cash_amount` | DECIMAL | Expected cash from system |
| `declared_amount` | DECIMAL | Actual cash counted by POS |
| `variance` | DECIMAL | Auto-calculated (declared - expected) |
| `total_transactions` | INTEGER | Total transaction count |
| `cash_transactions` | INTEGER | Cash-only transaction count |
| `card_amount` | DECIMAL | Card payment reference |
| `gcash_amount` | DECIMAL | GCash payment reference |
| `maya_amount` | DECIMAL | Maya payment reference |
| `shift_start_at` | TIMESTAMPTZ | Shift start time |
| `shift_end_at` | TIMESTAMPTZ | Shift end time |
| `status` | TEXT | pending \| verified \| discrepancy |
| `pos_notes` | TEXT | Notes from POS staff |
| `admin_notes` | TEXT | Notes from admin |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Indexes Created
- `remitted_by` - Fast lookup by staff
- `received_by` - Fast lookup by admin
- `status` - Filter by status
- `created_at` - Sort by date
- `shift_end_at` - Sort by shift end

### Security (RLS Policies)
- ✅ POS users can view their own remittances
- ✅ POS users can create remittances
- ✅ Admins can view all remittances
- ✅ Admins can verify/update remittances
- ✅ Auto-calculated variance prevents manipulation

---

## Server Actions

### `getPosCashflowSummary()`
**Permission**: POS, Admin  
**Returns**:
```typescript
{
  shiftStart: string
  cashSales: number
  cardSales: number
  gcashSales: number
  mayaSales: number
  totalSales: number
  transactionCount: number
  cashTransactionCount: number
  recentTransactions: Transaction[]
  remittances: Remittance[]
}
```

### `submitCashRemittance()`
**Permission**: POS, Admin  
**Parameters**:
```typescript
{
  declaredAmount: number
  shiftStartAt: string
  shiftEndAt: string
  posNotes?: string
}
```
**Auto-calculates**:
- Expected cash from system
- Variance
- Transaction counts
- Other payment method totals

### `verifyRemittance()`
**Permission**: Admin only  
**Parameters**:
```typescript
{
  remittanceId: string
  status: "verified" | "discrepancy"
  adminNotes?: string
}
```

---

## Navigation Updates

### POS Navigation
The cashflow page is already added to the POS navigation:
```typescript
{ href: "/pos/cashflow", label: "Cashflow", icon: "Wallet" }
```

### Admin Navigation
You may want to add to admin navigation in `components/admin-shell.tsx`:
```typescript
{ href: "/admin/remittances", label: "Remittances", icon: "Banknote" }
```

---

## Usage Tips

### For POS Staff
1. **Count cash twice** before submitting
2. **Use quick buttons** for faster input (+1000, +500, etc.)
3. **Document variances** in notes field
4. **Submit at shift end** or when handing over to another staff
5. **Check history** to track your remittances

### For Admins
1. **Verify cash in presence of staff** when possible
2. **Count independently** - don't rely on POS count
3. **Investigate patterns** - recurring discrepancies need attention
4. **Provide feedback** in admin notes
5. **Follow up** on significant variances

---

## Troubleshooting

### "Table cash_remittances does not exist"
**Solution**: Run `supabase/create_cash_remittances.sql` in Supabase SQL Editor

### "Unauthorized" error
**Solution**: 
- Check user is logged in
- Verify user role is "pos" or "admin"
- Check RLS policies are enabled

### Remittances not showing
**Solution**:
- Refresh the page
- Check browser console for errors
- Verify database connection
- Check if user has processed any payments

### Variance calculation seems wrong
**Solution**:
- Review transaction list for accuracy
- Check if any refunds were processed
- Verify payment methods are correct
- Look for duplicate entries

---

## Testing Checklist

- [ ] SQL migration runs successfully
- [ ] POS cashflow page loads without errors
- [ ] Admin remittances page loads without errors
- [ ] POS can see their own transactions
- [ ] POS can submit remittance
- [ ] Admin can see all remittances
- [ ] Admin can verify remittance
- [ ] Variance calculates correctly
- [ ] Status updates properly
- [ ] Notes save correctly
- [ ] Navigation links work
- [ ] Mobile responsive

---

## Security Considerations

✅ **Implemented**:
- Row Level Security (RLS) enabled
- Users can only see their own data (except admins)
- Variance auto-calculated (can't be manipulated)
- Audit trail with timestamps
- User tracking (who submitted, who verified)

⚠️ **Best Practices**:
- Always count cash with another person present
- Store remittance receipts/photos separately
- Regular audits of variance patterns
- Investigate repeated discrepancies
- Train staff on proper cash handling

---

## Future Enhancements

Potential additions:
- [ ] Print remittance slip
- [ ] Photo upload of counted cash
- [ ] Denomination breakdown entry
- [ ] SMS alerts to admin on submission
- [ ] Export to Excel/PDF
- [ ] Scheduled remittance reminders
- [ ] Multi-currency support
- [ ] Integration with accounting software
- [ ] Safe/vault tracking
- [ ] Petty cash management

---

## Support

For questions or issues:
1. Check `POS_CASHFLOW_GUIDE.md` for detailed user guide
2. Review browser console for errors
3. Check Supabase logs
4. Contact system administrator

---

## Summary

✅ **What You Get**:
- Complete POS cashflow tracking
- Cash remittance workflow
- Admin verification system
- Variance detection
- Transaction history
- Audit trail
- Real-time updates

🎉 **Ready to use** after running the SQL migration!
