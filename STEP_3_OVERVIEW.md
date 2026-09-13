# 📖 Step 3 Overview: Security Fixes

**Priority:** P0 - HIGH  
**Time:** 1-2 hours  
**Difficulty:** Medium

---

## 🎯 Goal

Harden security to prevent common attacks and abuse.

---

## ❌ Current Security Issues

### 1. Weak Session PINs (CRITICAL)
**Problem:**
- Only 4 digits (0000-9999)
- 10,000 possible combinations
- No rate limiting
- Can be brute-forced in minutes

**Risk:** HIGH  
**Impact:** Attackers can join any table session

---

### 2. No Rate Limiting (CRITICAL)
**Problem:**
- Unlimited login attempts
- Unlimited PIN attempts
- Unlimited QR scans
- No protection against brute force

**Risk:** HIGH  
**Impact:** 
- Account takeover via brute force
- Session hijacking
- DDoS via repeated requests

---

### 3. No Session Timeout (MEDIUM)
**Problem:**
- Sessions stay active forever
- No automatic cleanup
- Customers forget to close sessions
- Tables stuck as "occupied"

**Risk:** MEDIUM  
**Impact:**
- Tables permanently occupied
- Poor customer experience
- Manual cleanup required

---

### 4. Weak Input Validation (MEDIUM)
**Problem:**
- Basic regex only
- No length limits enforced in code
- Missing sanitization
- SQL injection risk (mitigated by Supabase)

**Risk:** MEDIUM  
**Impact:**
- Potential injection attacks
- Data corruption
- System errors

---

### 5. Missing Security Headers (LOW)
**Problem:**
- No Content Security Policy (CSP)
- No X-Frame-Options
- No X-Content-Type-Options
- Vulnerable to XSS/clickjacking

**Risk:** LOW  
**Impact:**
- XSS attacks possible
- Clickjacking possible
- MIME-type sniffing

---

## ✅ What Step 3 Fixes

### Fix 1: Strengthen Session PINs ✅
```
Before: 4 digits (0000-9999)
After:  6 digits (000000-999999)

Security increase: 100x harder to brute force
Combinations: 10,000 → 1,000,000
```

---

### Fix 2: Add Rate Limiting ✅
```
Login attempts:    5 per 15 minutes per IP
PIN attempts:      3 per 5 minutes per table
Staff creation:    10 per hour per admin
QR scans:          20 per minute per IP

Protection: Prevents brute force attacks
Storage: In-memory (dev) or Redis (production)
```

---

### Fix 3: Session Timeout ✅
```
Auto-close sessions after: 4 hours of inactivity
Cleanup frequency: Every hour
Benefits:
- Tables automatically freed
- No manual cleanup
- Better resource management
```

---

### Fix 4: Enhanced Input Validation ✅
```
Username: 3-20 chars, alphanumeric + underscore
Password: 8-72 chars, no injection patterns
PIN: Exactly 6 digits
Names: Max 100 chars, sanitized
Phone: 10-15 digits, optional formatting
```

---

### Fix 5: Security Headers ✅
```
Content-Security-Policy: Prevent XSS
X-Frame-Options: Prevent clickjacking
X-Content-Type-Options: Prevent MIME sniffing
Referrer-Policy: Control referrer info
Permissions-Policy: Limit browser features
```

---

## 🔧 Implementation Strategy

### Phase 1: Database Changes (5 min)
- Update `table_sessions.access_code` to VARCHAR(6)
- Add `last_activity_at` timestamp
- Add migration SQL

### Phase 2: Rate Limiting (30 min)
- Create rate limit utility
- Add to login action
- Add to PIN join action
- Add to staff creation
- Use in-memory store (simple)

### Phase 3: Session Timeout (15 min)
- Add session cleanup function
- Schedule with cron or API route
- Update last_activity on orders

### Phase 4: Input Validation (20 min)
- Create validation utilities
- Update all server actions
- Add sanitization functions

### Phase 5: Security Headers (10 min)
- Update `next.config.mjs`
- Add CSP and security headers
- Test deployment

---

## 📊 Security Before & After

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **PIN Strength** | 4 digits | 6 digits | 100x harder |
| **Brute Force Protection** | None | Rate limited | ✅ Protected |
| **Session Cleanup** | Manual | Auto (4hr) | ✅ Automated |
| **Input Validation** | Basic | Comprehensive | ✅ Hardened |
| **Security Headers** | None | Full set | ✅ Protected |
| **Login Attempts** | Unlimited | 5 per 15min | ✅ Limited |
| **PIN Attempts** | Unlimited | 3 per 5min | ✅ Limited |

---

## 🎓 Attack Scenarios - Before & After

### Scenario 1: Brute Force PIN Attack

**Before:**
```
Attacker scans QR code
Tries PIN: 0000, 0001, 0002, ...
10,000 attempts = success in ~5 minutes
❌ TABLE SESSION HIJACKED
```

**After:**
```
Attacker scans QR code
Tries PIN: 000000, 000001, 000002
After 3 attempts: RATE LIMITED for 5 minutes
1,000,000 combinations = 2,777 hours minimum
✅ ATTACK PREVENTED
```

---

### Scenario 2: Brute Force Login

**Before:**
```
Attacker tries common passwords:
password123, admin123, 12345678...
Unlimited attempts
Eventually finds password
❌ ACCOUNT COMPROMISED
```

**After:**
```
Attacker tries passwords:
After 5 attempts: RATE LIMITED for 15 minutes
24 attempts per hour maximum
✅ ATTACK PREVENTED (too slow)
```

---

### Scenario 3: Session Squatting

**Before:**
```
Customer creates session
Orders food
Leaves without paying
Session stays active forever
❌ TABLE STUCK AS "OCCUPIED"
```

**After:**
```
Customer creates session
Orders food
Leaves without paying
4 hours later: AUTO-CLOSED
✅ TABLE AUTOMATICALLY FREED
```

---

### Scenario 4: XSS Attack

**Before:**
```
Attacker injects: <script>steal_cookies()</script>
No CSP headers
Script executes
❌ COOKIES STOLEN
```

**After:**
```
Attacker injects: <script>steal_cookies()</script>
CSP blocks inline scripts
React sanitizes output
✅ ATTACK BLOCKED
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────────────┐
│        Layer 5: Security Headers            │
│  (CSP, X-Frame-Options, CSRF Protection)    │
├─────────────────────────────────────────────┤
│        Layer 4: Rate Limiting               │
│  (Login, PIN, Staff Creation, QR Scans)     │
├─────────────────────────────────────────────┤
│        Layer 3: Input Validation            │
│  (Sanitization, Length Limits, Type Check)  │
├─────────────────────────────────────────────┤
│        Layer 2: Session Security            │
│  (6-digit PIN, Auto Timeout, Activity Track)│
├─────────────────────────────────────────────┤
│        Layer 1: Database Security           │
│  (RLS Policies, Service Role, Encryption)   │
└─────────────────────────────────────────────┘

Defense in Depth: Multiple layers protect against attacks
```

---

## 📋 Files to Modify

### Database (1 file)
- `supabase/migrations/02_security_fixes.sql` (new)

### Utilities (2 files)
- `lib/rate-limit.ts` (new)
- `lib/validation.ts` (new)

### Server Actions (4 files)
- `app/actions/auth.ts` (add rate limiting)
- `app/actions/admin.ts` (add rate limiting + validation)
- `app/actions/table-sessions.ts` (6-digit PIN + rate limiting)
- `app/actions/cleanup.ts` (new - session timeout)

### Configuration (1 file)
- `next.config.mjs` (security headers)

### API Routes (1 file)
- `app/api/cron/cleanup/route.ts` (new - scheduled cleanup)

**Total:** 9 files (5 new, 4 modified)

---

## ⏱️ Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | Database migration | 5 min |
| 2 | Rate limiting utility | 15 min |
| 2 | Apply rate limiting | 15 min |
| 3 | Session timeout | 15 min |
| 4 | Input validation | 20 min |
| 5 | Security headers | 10 min |
| Test | Testing all fixes | 20 min |

**Total:** 100 minutes (~1.5-2 hours)

---

## 🧪 Testing Checklist

After implementation:

### Rate Limiting Tests
- [ ] Try 6 login attempts - 6th should fail
- [ ] Try 4 PIN attempts - 4th should fail
- [ ] Wait 15 minutes - login should work again
- [ ] Wait 5 minutes - PIN should work again

### PIN Strength Tests
- [ ] Try 4-digit PIN - should fail validation
- [ ] Try 6-digit PIN - should work
- [ ] Create session with 123456 - should work
- [ ] Join session with 123456 - should work

### Session Timeout Tests
- [ ] Create session, wait 4+ hours - auto-closed
- [ ] Check tables - should be "available"
- [ ] Check database - session status "closed"

### Input Validation Tests
- [ ] Try username "ab" - should fail (too short)
- [ ] Try password "1234567" - should fail (too short)
- [ ] Try valid inputs - should work
- [ ] Try SQL injection - should be sanitized

### Security Headers Tests
- [ ] Check browser dev tools - Network tab
- [ ] Verify CSP header present
- [ ] Verify X-Frame-Options present
- [ ] Verify other security headers

---

## 🎯 Success Criteria

Step 3 is complete when:

- [ ] Database migration applied
- [ ] Rate limiting working on all endpoints
- [ ] Sessions auto-close after 4 hours
- [ ] 6-digit PINs enforced
- [ ] Input validation active
- [ ] Security headers deployed
- [ ] All tests passing
- [ ] No new errors in console

---

## 📊 Risk Reduction

```
Before Step 3:
Security Score: 65/100 ⚠️

After Step 3:
Security Score: 85/100 ✅

Key Improvements:
✅ Brute force attacks: PREVENTED
✅ Session hijacking: HARDENED
✅ XSS attacks: MITIGATED
✅ DDoS attempts: RATE LIMITED
✅ Resource leaks: AUTO-CLEANED
```

---

## 💡 Important Notes

### Development vs Production

**Rate Limiting Storage:**
- **Development:** In-memory (simple, resets on restart)
- **Production:** Redis (persistent, recommended)

**Session Cleanup:**
- **Development:** Manual trigger or API route
- **Production:** Vercel Cron or external service

**Security Headers:**
- **Development:** Mostly informational
- **Production:** Critical security layer

---

### Non-Breaking Changes

All changes are **backward compatible**:
- ✅ Existing 4-digit sessions still work (until timeout)
- ✅ New sessions require 6 digits
- ✅ Rate limits don't affect normal users
- ✅ Validation allows existing data patterns
- ✅ No UI changes required

---

## 🚀 Ready to Start?

**Next Steps:**
1. Read this overview ✅
2. Open `MIGRATION_GUIDE_STEP_3.md` for detailed instructions
3. Or use `QUICK_START_STEP_3.md` for fast track
4. Execute Phase 1-5
5. Test thoroughly
6. Mark complete in `MIGRATION_PROGRESS.md`

---

**Estimated Time:** 1.5-2 hours  
**Difficulty:** Medium  
**Impact:** High security improvement  
**Breaking Changes:** None

**Let's secure your system!** 🔒
