# 📱 Testing Guide: 6-Digit PIN Update

## ✅ What Was Fixed

All UI components and validation now use **6-digit PINs** instead of 4-digit:

### Changes Made:
1. ✅ Database: `access_code` column upgraded from VARCHAR(4) to VARCHAR(6)
2. ✅ Backend validation: All actions now require exactly 6 digits
3. ✅ UI inputs: All forms now accept 6-digit PINs
4. ✅ QR display: Shows "------" (6 dashes) when no session active
5. ✅ Client validation: Regex patterns updated from `/^\d{4}$/` to `/^\d{6}$/`
6. ✅ Error messages: Updated to say "6-digit PIN"
7. ✅ Rate limiting: 3 wrong PIN attempts = 5-minute lockout

### Files Changed:
- `app/order/page.tsx` - Customer-facing order form
- `components/admin/qr-codes-manager.tsx` - QR code display
- `app/actions/table-sessions.ts` - Backend validation
- `lib/validation.ts` - Validation utilities
- Database migration applied successfully

---

## 🧪 Test Plan

### Test 1: QR Code Scan (Mobile)
**Goal:** Verify QR code shows 6-digit PIN requirement

1. Open your phone camera or QR scanner app
2. Scan the QR code for any table
3. ✅ **VERIFY:** Form should say "6-digit PIN" (not "4-digit PIN")
4. ✅ **VERIFY:** Placeholder shows "6-digit PIN"
5. ✅ **VERIFY:** Input accepts up to 6 digits (not limited to 4)

---

### Test 2: Create Session with 6-Digit PIN (Mobile)
**Goal:** Create a new table session with a 6-digit access code

1. On the customer order page, fill in:
   - **Your Name:** Maria
   - **Set Access Code:** `123456` (6 digits)
   - **Confirm Access Code:** `123456`
2. Click **"Start Shared Session"**
3. ✅ **VERIFY:** Session created successfully
4. ✅ **VERIFY:** No errors in console
5. ✅ **VERIFY:** You can browse the menu

---

### Test 3: QR Display Shows 6-Digit Code (Desktop - Superadmin)
**Goal:** Verify admin QR codes page shows the 6-digit PIN

1. Login as **superadmin** on desktop
2. Go to **Admin → QR Codes** page
3. Find the table where you created a session (from Test 2)
4. ✅ **VERIFY:** "Table Code" section shows `123456` (6 digits)
5. ✅ **VERIFY:** Text says "Session Active" in green
6. ✅ **VERIFY:** Before session was created, it showed "------" (6 dashes)

---

### Test 4: Join Session with Correct PIN (Mobile - Second Device)
**Goal:** Another customer joins the same table session

1. On a second mobile device (or incognito mode)
2. Scan the same QR code
3. You should see "Table Session Active" modal
4. ✅ **VERIFY:** Says "Enter Access Code" with "6-digit PIN from the host"
5. ✅ **VERIFY:** Input field accepts 6 digits
6. Enter the correct PIN: `123456`
7. Click **"Join Session"**
8. ✅ **VERIFY:** Successfully joined the session
9. ✅ **VERIFY:** Can see the same menu and cart

---

### Test 5: Join Session with Wrong PIN (Rate Limiting Test)
**Goal:** Verify rate limiting blocks after 3 wrong attempts

1. On a new mobile device (or clear cache)
2. Scan the QR code again
3. **Attempt 1:** Enter wrong PIN: `111111` → Click Join
   - ✅ **VERIFY:** Shows error "Incorrect access code"
4. **Attempt 2:** Enter wrong PIN: `222222` → Click Join
   - ✅ **VERIFY:** Shows error "Incorrect access code"
5. **Attempt 3:** Enter wrong PIN: `333333` → Click Join
   - ✅ **VERIFY:** Shows error "Incorrect access code"
6. **Attempt 4:** Try any PIN
   - ✅ **VERIFY:** Shows error "Too many attempts. Try again in X minutes"
   - ✅ **VERIFY:** Button is disabled or request is blocked
7. Wait 5 minutes, then try again with correct PIN: `123456`
   - ✅ **VERIFY:** Rate limit cleared, join successful

---

### Test 6: Browser Cache Check
**Goal:** Ensure old cached code isn't being used

1. On mobile browser, do a **hard refresh:**
   - **Chrome Android:** Menu → Settings → Site Settings → Clear data
   - **Safari iOS:** Settings → Safari → Clear History and Website Data
2. Scan QR code again
3. ✅ **VERIFY:** Form still shows "6-digit PIN"
4. ✅ **VERIFY:** No browser console errors

---

### Test 7: Validation Edge Cases
**Goal:** Test input validation

1. Try to create session with 5-digit PIN: `12345`
   - ✅ **VERIFY:** Button is disabled (not 6 digits)
2. Try to create session with 7-digit PIN: `1234567`
   - ✅ **VERIFY:** Input stops at 6 digits (maxLength=6)
3. Try to create session with letters: `abc123`
   - ✅ **VERIFY:** Only numbers are accepted
4. Try to create session with mismatched PINs:
   - Set: `123456`
   - Confirm: `654321`
   - ✅ **VERIFY:** Shows error "Access codes do not match"

---

## 🐛 Troubleshooting

### Issue: Form still shows "4-digit PIN"
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if dev server is running the latest code
4. Verify commit `d73e7e7` is deployed

### Issue: Can't create session with 6-digit PIN
**Solution:**
1. Check browser console for JavaScript errors
2. Verify database migration was successful
3. Check backend validation in `app/actions/table-sessions.ts`
4. Ensure `access_code` column is VARCHAR(6) in database

### Issue: Rate limiting not working
**Solution:**
1. Rate limiting uses in-memory store (resets on server restart)
2. Check `lib/rate-limit.ts` is imported correctly
3. Verify `checkRateLimit` is called in `joinTableSession` action
4. Try from different IP or clear rate limit by restarting server

### Issue: QR display shows 4 dashes instead of 6
**Solution:**
1. Verify `components/admin/qr-codes-manager.tsx` has `"------"` (6 dashes)
2. Check commit `9366340` or later is deployed
3. Hard refresh admin page

---

## ✅ Success Criteria

Your system passes if:

- [x] All forms say "6-digit PIN" (not "4-digit")
- [x] Input fields accept exactly 6 digits
- [x] Can create session with 6-digit PIN
- [x] Can join session with correct 6-digit PIN
- [x] QR display shows 6 dashes or 6-digit code
- [x] Validation blocks 5-digit, 7-digit, or non-numeric input
- [x] Rate limiting blocks after 3 wrong attempts
- [x] No JavaScript errors in console

---

## 📊 Test Results

Record your test results here:

| Test | Status | Notes |
|------|--------|-------|
| Test 1: QR Scan | ⏳ Pending | |
| Test 2: Create Session | ⏳ Pending | |
| Test 3: QR Display | ⏳ Pending | |
| Test 4: Join Session | ⏳ Pending | |
| Test 5: Rate Limiting | ⏳ Pending | |
| Test 6: Cache Check | ⏳ Pending | |
| Test 7: Edge Cases | ⏳ Pending | |

**Status Key:**
- ⏳ Pending - Not tested yet
- ✅ Pass - Working as expected
- ⚠️ Partial - Works but has minor issues
- ❌ Fail - Not working, needs fix

---

## 🚀 Next Steps

After all tests pass:

1. **Deploy to production** (if using Vercel/hosting):
   ```bash
   git push origin fix/payment-modal-redesign-920x820
   # Wait for auto-deploy or manual deploy
   ```

2. **Update QR codes** at physical tables:
   - Go to Admin → QR Codes
   - Click "Print All"
   - Replace old QR codes at tables

3. **Notify staff:**
   - PINs are now 6 digits (not 4)
   - Customers set their own PIN when creating session
   - Staff can see PINs on Admin → QR Codes page

4. **Monitor for issues:**
   - Check error logs
   - Ask customers for feedback
   - Monitor rate limiting effectiveness

---

**Last Updated:** September 13, 2026  
**Tested By:** _______________  
**Test Date:** _______________
