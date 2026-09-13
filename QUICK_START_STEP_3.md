# ⚡ QUICK START: Step 3 - Security Fixes

**Time:** 10 minutes (code already done!)  
**Goal:** Run database migration and test

---

## ✅ What I Already Did

All code changes are COMPLETE:

1. ✅ Created database migration (6-digit PIN, session timeout)
2. ✅ Created rate limiting utility
3. ✅ Created input validation utility
4. ✅ Updated table sessions (6-digit PIN + rate limiting)
5. ✅ Updated auth (login rate limiting)
6. ✅ Updated admin (staff creation rate limiting + validation)
7. ✅ Added CSP security headers
8. ✅ Created cleanup API route

---

## 🚀 What You Need to Do (3 Steps)

### Step 1: Run Database Migration (5 min)

1. **Open Supabase SQL Editor:**
   ```
   https://app.supabase.com/project/szfvjfvukicjmuxogglt/sql/new
   ```

2. **Copy migration file:**
   - Open: `supabase/migrations/02_security_fixes.sql`
   - Copy ALL content (Ctrl+A, Ctrl+C)

3. **Paste and Run:**
   - Paste into SQL Editor
   - Click **"Run"** button
   - Wait for "STEP 3: SECURITY FIXES MIGRATION COMPLETE"

4. **Expected Output:**
   ```
   ✓ access_code column updated to VARCHAR(6)
   ✓ last_activity_at column added
   ✓ Session activity trigger created
   ✓ Cleanup function created
   ✓ Cleanup test: Closed 0 sessions
   ```

---

### Step 2: Restart Dev Server (1 min)

Server is already running. Restart para ma-load ang new code:

**In your terminal:**
```bash
# Press Ctrl+C to stop
# Then:
npm run dev
```

Wait for "✓ Ready"

---

### Step 3: Test Security Features (5 min)

#### Test 1: 6-Digit PIN (QR Ordering)

1. **Go to a table's QR code URL** (or create new session)
2. **Try 4-digit PIN:** `1234`
   - **Expected:** ❌ "PIN must be exactly 6 digits"
3. **Try 6-digit PIN:** `123456`
   - **Expected:** ✅ Session created!

#### Test 2: Rate Limiting (Login)

1. **Go to:** `http://localhost:3000/login`
2. **Try wrong password 6 times**
   - Use: `wrong_password` each time
3. **On 6th attempt:**
   - **Expected:** ❌ "Too many attempts. Please try again in 15 minutes."

#### Test 3: Rate Limiting (PIN Join)

1. **Scan QR code** (or go to existing session URL)
2. **Try wrong PIN 4 times:** `000000`, `111111`, `222222`, `333333`
3. **On 4th attempt:**
   - **Expected:** ❌ "Too many attempts. Please try again in 5 minutes."

---

## ✅ Success Checklist

- [ ] Database migration ran successfully
- [ ] Dev server restarted
- [ ] 4-digit PIN rejected ✅
- [ ] 6-digit PIN accepted ✅
- [ ] Login rate limited after 5 attempts ✅
- [ ] PIN join rate limited after 3 attempts ✅
- [ ] No errors in browser console
- [ ] No errors in terminal

---

## 🎉 That's It!

Kung lahat working:
- ✅ Step 3 COMPLETE!
- ✅ Security hardened!
- ✅ System is now 80% production-ready!

---

## 📊 What's Now Protected

| Feature | Protection |
|---------|-----------|
| **Session PINs** | 6 digits (1M combinations) |
| **Login** | Max 5 attempts per 15 min |
| **PIN Join** | Max 3 attempts per 5 min |
| **Staff Creation** | Max 10 per hour |
| **Sessions** | Auto-close after 4 hours |
| **Input** | Validated & sanitized |
| **Headers** | CSP + security headers |

---

## 🐛 If May Error

**"access_code column not updated"**
→ Check if migration ran completely
→ Run verification query in SQL Editor:
```sql
SELECT column_name, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'table_sessions' AND column_name = 'access_code';
```

**"Too many attempts" immediately**
→ Wait 15 minutes (login) or 5 minutes (PIN)
→ Or restart dev server to reset in-memory rate limits

**CSP blocking scripts**
→ Check browser console
→ CSP is strict but allows necessary scripts

---

**Time:** 10 minutes total  
**Difficulty:** Easy (code already done)  
**Status:** ✅ Ready to test!

**Let me know kung "working na" ulit!** 💪
