# ✅ Frontend Changes Checklist

I-check mo ito para makita kung lahat ng changes ay gumagana sa actual na frontend.

---

## 🎯 QUICK CHECKLIST (5 Minutes)

### Step 2: Authentication
- [ ] **Login page** - May "Username or Email" label
- [ ] **Staff creation** - May "Username" field (required)
- [ ] **Staff creation** - Success message mentions "login with username"

### Step 3: Security  
- [ ] **Customer scan QR** - Form says "6-digit PIN" (hindi "4-digit")
- [ ] **Customer create session** - Input accepts 6 digits (hindi 4)
- [ ] **Customer join session** - Same, 6-digit format
- [ ] **Admin QR page** - Shows "------" (6 dashes) when no session
- [ ] **Admin QR page** - Shows 6-digit code (green) when active session

---

## 📋 DETAILED CHECKLIST

### 1️⃣ LOGIN PAGE (Desktop/Mobile)

**Location:** `/login` page

#### Visual Check:
```
┌────────────────────────────────────┐
│ Username or Email                  │  ← Check this text
│ [___________________]              │
│ Staff: use username                │  ← Check helper text
│ Customers: use email               │
└────────────────────────────────────┘
```

- [ ] Label says "**Username or Email**" (not just "Email")
- [ ] Helper text says "Staff: use username • Customers: use email"
- [ ] Can type username (e.g., "juandc") and login successfully
- [ ] Can still type email and login successfully
- [ ] No errors in browser console

**Test:**
1. Create staff account with username "testuser"
2. Go to login page
3. Type "testuser" + password
4. Should login successfully ✅

---

### 2️⃣ STAFF CREATION FORM (Admin)

**Location:** Admin → Staff page → "Create Staff Account" button

#### Visual Check:
```
┌────────────────────────────────────┐
│ Full Name *                        │
│ [Juan Dela Cruz_________]          │
│                                    │
│ Username *                         │  ← Check this field exists
│ [juandc_________________]          │
│ lowercase, numbers, underscores    │  ← Check helper text
└────────────────────────────────────┘
```

- [ ] "**Username**" field exists (with red asterisk)
- [ ] Helper text: "lowercase letters, numbers, underscores only"
- [ ] Input auto-converts to lowercase
- [ ] Can't type less than 3 characters
- [ ] Can't type more than 20 characters
- [ ] Success modal says "Staff member can now login with their **username**"
- [ ] Note at bottom: "Account will be created immediately"

**Test:**
1. Click "Create Staff Account"
2. Fill in all fields including username
3. Submit form
4. Should see success message mentioning username ✅

---

### 3️⃣ CUSTOMER CREATE SESSION (Mobile)

**Location:** Scan QR code → Welcome modal

#### Visual Check:
```
┌────────────────────────────────────┐
│ Set Access Code *                  │
│ 6-digit PIN                        │  ← Check placeholder
│ [______]                           │  ← Check 6 boxes/underscores
│                                    │
│ Confirm Access Code *              │  ← Check this exists
│ Re-enter PIN                       │
│ [______]                           │
└────────────────────────────────────┘
```

- [ ] Placeholder says "**6-digit PIN**" (not "4-digit")
- [ ] Input field shows 6 spaces/underscores (not 4)
- [ ] **Confirm PIN field exists** (new security feature)
- [ ] Numeric keyboard appears on mobile
- [ ] Can type exactly 6 digits (e.g., 123456)
- [ ] Can't type 7th digit (maxLength works)
- [ ] Can't type letters (only digits accepted)
- [ ] If type < 6 digits, button stays disabled
- [ ] If PINs don't match, shows error
- [ ] Helper text: "Share this code with friends..."

**Test:**
1. Scan QR on mobile
2. Enter name: "Maria"
3. Enter PIN: 123456
4. Confirm PIN: 123456
5. Click "Start Shared Session"
6. Should create successfully ✅

**Error Test:**
1. Try PIN: 12345 (only 5 digits)
2. Button should stay disabled ✅
3. Try PIN: 123456, Confirm: 654321
4. Should show "Access codes do not match" ✅

---

### 4️⃣ CUSTOMER JOIN SESSION (Mobile)

**Location:** Scan QR when session already active

#### Visual Check:
```
┌────────────────────────────────────┐
│ Enter Access Code *                │
│ 6-digit PIN from the host          │  ← Check placeholder
│ [______]                           │  ← Check 6 boxes
│ Ask the host for the 6-digit PIN   │  ← Check helper
└────────────────────────────────────┘
```

- [ ] Modal says "Table Session Active"
- [ ] Shows host name (e.g., "Host: Maria")
- [ ] Placeholder: "**6-digit PIN from the host**"
- [ ] Input accepts 6 digits (not 4)
- [ ] Helper text: "Ask the host for the **6-digit** PIN"
- [ ] Button disabled until 6 digits entered
- [ ] Wrong PIN shows error
- [ ] Correct PIN joins successfully

**Test:**
1. Create session with PIN 123456 (Device A)
2. Scan same QR on Device B
3. Enter wrong PIN: 999999
4. Should show error ✅
5. Enter correct PIN: 123456
6. Should join successfully ✅

---

### 5️⃣ RATE LIMITING (Mobile)

**Location:** Join session with wrong PINs

#### Test Rate Limiting:
```
Attempt 1: 111111 → ❌ "Incorrect access code"
Attempt 2: 222222 → ❌ "Incorrect access code"
Attempt 3: 333333 → ❌ "Incorrect access code"
Attempt 4: 444444 → 🛑 "Too many attempts. Try again in 4 minutes"
```

- [ ] Can try 3 wrong PINs
- [ ] 4th attempt shows rate limit error
- [ ] Error message shows time remaining
- [ ] After 5 minutes, can try again

**Test:**
1. Try wrong PIN 3 times
2. 4th attempt should be blocked ✅
3. Error should mention minutes ✅

---

### 6️⃣ ADMIN QR CODES PAGE (Desktop)

**Location:** Admin → QR Codes

#### Visual Check - No Session:
```
┌──────────────┐
│   Table 1    │
│   4 Seats    │
│  [QR CODE]   │
│              │
│ Table Code   │
│   ------     │  ← Check 6 dashes (gray color)
└──────────────┘
```

- [ ] Shows "**------**" (6 dashes, not 4)
- [ ] Dashes are gray color
- [ ] No "Session Active" text

#### Visual Check - Active Session:
```
┌──────────────┐
│   Table 1    │  
│   4 Seats    │
│  [QR CODE]   │
│              │
│ Table Code   │
│   123456     │  ← Check 6 digits (green color)
│ Session      │  ← Check green text
│  Active      │
└──────────────┘
```

- [ ] Shows 6-digit code (e.g., **123456**)
- [ ] Code is green color
- [ ] Green border around box
- [ ] "Session Active" text appears
- [ ] Updates automatically (try creating session, should appear in ~5 sec)

**Test:**
1. Open Admin → QR Codes
2. Find table with no session → Should show "------" ✅
3. Scan QR on mobile, create session with PIN 123456
4. Wait 5-10 seconds, refresh admin page
5. Should now show "123456" in green ✅

---

### 7️⃣ BROWSER CONSOLE CHECK

**Location:** Open Developer Tools (F12) → Console tab

#### In Each Page:
- [ ] Login page - No errors
- [ ] Staff creation - No errors
- [ ] Customer order page - No errors
- [ ] Admin QR page - No errors
- [ ] No red errors anywhere

**Common Errors to Ignore:**
- ⚠️ `[Violation] Added non-passive event listener` - harmless
- ⚠️ Font loading warnings - harmless

**Errors That Matter:**
- ❌ `TypeError` - BAD, something broken
- ❌ `ReferenceError` - BAD, something broken
- ❌ `401 Unauthorized` - BAD, auth problem
- ❌ `500 Internal Server Error` - BAD, backend problem

---

## 🎨 VISUAL CONSISTENCY CHECK

### Typography:
- [ ] All text uses same fonts (no new fonts added)
- [ ] Sizes look consistent (no weird huge/tiny text)
- [ ] Colors match design (primary, muted, destructive)

### Spacing:
- [ ] Padding looks normal (not too cramped/loose)
- [ ] Margins consistent between sections
- [ ] No overlapping elements

### Layout:
- [ ] Forms are centered properly
- [ ] Buttons aligned correctly
- [ ] No weird horizontal scrolling
- [ ] Responsive on mobile (test different screen sizes)

---

## 📱 MOBILE SPECIFIC CHECKS

### On Actual Mobile Phone:

#### Screen Sizes:
- [ ] iPhone SE (320px) - Everything fits
- [ ] iPhone 12/13 (390px) - Looks good
- [ ] Android phone (360px+) - No issues

#### Interactions:
- [ ] Numeric keyboard appears for PIN inputs
- [ ] Can tap buttons easily (not too small)
- [ ] Forms don't zoom weirdly when focused
- [ ] No horizontal scrolling
- [ ] Text readable without zooming

#### Performance:
- [ ] Page loads fast (< 3 seconds)
- [ ] No lag when typing
- [ ] Transitions smooth
- [ ] No flickering

---

## 🖨️ PRINT CHECK (Optional)

### QR Codes Page:

1. Go to Admin → QR Codes
2. Press Ctrl+P (or Cmd+P on Mac)
3. Print preview should show:
   - [ ] QR codes large and clear
   - [ ] Table codes showing (6 digits or 6 dashes)
   - [ ] No UI buttons visible
   - [ ] Optimized for A4 paper
   - [ ] 3 columns of cards

---

## ✅ FINAL VERIFICATION

### All Critical Changes Present:

**Step 2 (Authentication):**
- [x] Username field in staff creation ✅
- [x] Username login works ✅
- [x] Helper text guides users ✅

**Step 3 (Security):**
- [x] All PINs use 6 digits (not 4) ✅
- [x] QR display shows 6 dashes/digits ✅
- [x] Validation regex is `/^\d{6}$/` ✅
- [x] maxLength is 6 everywhere ✅
- [x] Error messages say "6-digit" ✅
- [x] Rate limiting works ✅

### No Regressions:

- [ ] Existing features still work
- [ ] No new bugs introduced
- [ ] Performance same or better
- [ ] No broken links/buttons
- [ ] All pages load properly

---

## 🐛 IF SOMETHING IS WRONG

### "Still shows 4-digit"
→ Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)  
→ Clear browser cache  
→ Check commit is latest (`git log --oneline -1`)

### "Username login doesn't work"
→ Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`  
→ Check staff account was created AFTER Step 2 changes  
→ Try email login instead (should still work)

### "6-digit PIN not accepted"
→ Check database migration ran successfully  
→ Verify `access_code` column is VARCHAR(6) in Supabase  
→ Check browser console for errors

### "QR shows 4 dashes"
→ Check component file has `"------"` (6 dashes)  
→ Hard refresh page  
→ Check commit `9366340` or later is deployed

---

## 📊 COMPLETION STATUS

Lahat ng checks mo:

```
Step 2 Checks: __ / 3
Step 3 Checks: __ / 7
Visual Checks: __ / 3
Mobile Checks: __ / 3
Console Check: __ / 1

TOTAL: __ / 17
```

**Target:** 17/17 ✅

**Minimum to Pass:** 15/17 (88%)

---

**Checklist Created:** September 13, 2026  
**For Testing:** Steps 1-3 Complete  
**Est. Time:** 15-20 minutes to check everything
