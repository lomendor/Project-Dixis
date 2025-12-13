# Backlog: Auth System Improvements

**Created**: 2025-12-10
**Owner**: Tech Team (Panagiotis + Claude Agents)
**Context**: Βασική auth λειτουργικότητα υπάρχει αλλά με gaps. Αυτό το backlog καταγράφει tasks για production-ready auth system.

---

## ✅ **AUTH-CORE-0: Fix current register/login bug** (COMPLETED - 2025-12-10)

**Root Cause**: API URL mismatch - το `.env.example` είχε λάθος production URL

**Πρόβλημα**:
- Production frontend προσπαθούσε να καλέσει `https://api.dixis.gr/api/v1`
- Το subdomain `api.dixis.gr` **ΔΕΝ ΥΠΑΡΧΕΙ** (NXDOMAIN error)
- Όλα τα register/login requests αποτύγχαναν με network error

**Διόρθωση**:
- ✅ Διόρθωση `.env.example`: `https://api.dixis.gr` → `https://dixis.gr`
- ✅ Δημιουργία `.env.production.example` με σωστά production values
- ✅ Προσθήκη validation tests: `tests/e2e/auth-api-validation.spec.ts`
- ✅ Tests για register/login happy path + duplicate email validation

**Αποτέλεσμα**:
- Backend API δουλεύει 100% (επιβεβαιώθηκε με curl tests)
- Register/Login flows λειτουργούν σταθερά στο production
- Tests ensure correct API URL configuration

**Files Changed**:
- `frontend/.env.example` (fixed production URL comment)
- `frontend/.env.production.example` (NEW - complete production env template)
- `frontend/tests/e2e/auth-api-validation.spec.ts` (NEW - API validation tests)

---

## 🎯 Στόχος

Να φτιάξουμε ένα **stable, secure, user-friendly** auth system που:
1. Επικυρώνει σωστά όλα τα inputs (frontend + backend)
2. Δίνει **ελληνικά** error messages σε όλα τα layers
3. Προστατεύει από brute-force attacks (rate limiting)
4. Έχει comprehensive E2E test coverage
5. Ακολουθεί security best practices (email verification, password reset)

---

## 📋 Tasks (Prioritized)

### 🔴 **HIGH PRIORITY** (Blockers για Production Stability)

#### **AUTH-1: Backend Rate Limiting για Login/Register**
**Σκοπός**: Προστασία από brute-force attacks και spam registrations.

**Scope**:
- Προσθήκη `->middleware('throttle:5,1')` στο `/api/v1/auth/login` (5 προσπάθειες/λεπτό)
- Προσθήκη `->middleware('throttle:10,1')` στο `/api/v1/auth/register` (10 εγγραφές/λεπτό)
- Testing: Verify 429 response μετά από exceeded limit

**Files to Modify**:
- `backend/routes/api.php` (lines 36-39)

**Εκτίμηση**: **S** (Small - 10-15 minutes)
**Dependencies**: Καμία
**AC** (Acceptance Criteria):
- ✅ Login endpoint επιστρέφει 429 μετά από 5 failed attempts σε 1 λεπτό
- ✅ Register endpoint επιστρέφει 429 μετά από 10 registrations σε 1 λεπτό
- ✅ Frontend AuthContext χειρίζεται 429 με ελληνικό μήνυμα (ήδη υλοποιημένο)

---

#### **AUTH-2: Backend Ελληνικά Error Messages**
**Σκοπός**: Consistent Greek messages σε όλα τα layers (όχι frontend-only translation).

**Scope**:
- Δημιουργία `backend/lang/el/auth.php` με translations
- Τροποποίηση `AuthController::register()` για Greek validation errors
- Τροποποίηση `AuthController::login()` για Greek "Invalid credentials" message
- Αφαίρεση frontend error mapping logic (simplify AuthContext)

**Files to Modify**:
- `backend/lang/el/auth.php` (NEW)
- `backend/config/app.php` (set locale => 'el')
- `backend/app/Http/Controllers/Api/AuthController.php` (lines 26-31, 74-76)
- `frontend/src/contexts/AuthContext.tsx` (simplify error handling logic)

**Εκτίμηση**: **M** (Medium - 45-60 minutes)
**Dependencies**: Καμία
**AC**:
- ✅ Backend επιστρέφει ελληνικά validation messages σε 422 responses
- ✅ Backend επιστρέφει ελληνικό "Λάθος email ή κωδικός" στο login
- ✅ Frontend AuthContext περνάει direct backend messages στο toast (no mapping)

---

#### **AUTH-3: E2E Tests για Auth Flows**
**Σκοπός**: Comprehensive test coverage για register/login/logout με validation scenarios.

**Scope**:
- Playwright test: `frontend/tests/e2e/auth.spec.ts` (NEW)
- Test cases:
  1. Register happy path (consumer + producer)
  2. Register validation errors (duplicate email, weak password, missing fields)
  3. Login happy path
  4. Login invalid credentials
  5. Logout + session cleanup
  6. Protected route access control (redirect to login)
- Use MSW mock για backend responses (fast tests, no DB)

**Files to Create**:
- `frontend/tests/e2e/auth.spec.ts` (NEW - ~150-200 LOC)

**Εκτίμηση**: **M** (Medium - 60-90 minutes)
**Dependencies**: **AUTH-2** (για να έχουμε consistent Greek messages στα tests)
**AC**:
- ✅ 6+ test scenarios pass στο CI
- ✅ Tests καλύπτουν happy paths + validation errors + auth guards
- ✅ Tests τρέχουν σε <30 seconds (MSW mock)

---

### 🟡 **MEDIUM PRIORITY** (Security & UX Improvements)

#### **AUTH-4: Password Reset Flow (Forgot Password)**
**Σκοπός**: User μπορεί να κάνει reset password αν το ξεχάσει.

**Scope**:
- Backend: `POST /api/v1/auth/forgot-password` (email → send reset link)
- Backend: `POST /api/v1/auth/reset-password` (token + new password)
- Frontend: `/auth/forgot-password` page
- Frontend: `/auth/reset-password?token=XXX` page
- Email template: "Password Reset Request" (Greek)
- Database: `password_resets` table (migration)

**Files to Create/Modify**:
- `backend/database/migrations/YYYY_MM_DD_create_password_resets_table.php` (NEW)
- `backend/app/Http/Controllers/Api/AuthController.php` (add forgotPassword, resetPassword methods)
- `backend/routes/api.php` (add routes)
- `frontend/src/app/auth/forgot-password/page.tsx` (NEW)
- `frontend/src/app/auth/reset-password/page.tsx` (NEW)
- `backend/resources/views/emails/password-reset.blade.php` (NEW)

**Εκτίμηση**: **L** (Large - 2-3 hours)
**Dependencies**: Email service setup (SMTP/SES configuration)
**AC**:
- ✅ User μπορεί να ζητήσει password reset με email
- ✅ Email περιέχει unique token link (expires σε 1 hour)
- ✅ User μπορεί να κάνει reset password με token
- ✅ Token μπορεί να χρησιμοποιηθεί μόνο μία φορά
- ✅ Ελληνικά messages σε όλα τα steps

---

#### **AUTH-5: Email Verification Flow**
**Σκοπός**: Επιβεβαίωση email ownership πριν επιτραπεί login/access.

**Scope**:
- Αφαίρεση `'email_verified_at' => now()` από register (line 38 AuthController.php)
- Backend: `POST /api/v1/auth/verify-email` (με token από email)
- Backend: `POST /api/v1/auth/resend-verification` (resend email)
- Frontend: `/auth/verify-email` page (πληροφοριακό "Check your email")
- Frontend: `/auth/verify?token=XXX` page (verification handler)
- Email template: "Email Verification Request" (Greek)
- Middleware: `EnsureEmailIsVerified` guard για protected routes

**Files to Create/Modify**:
- `backend/app/Http/Controllers/Api/AuthController.php` (add verifyEmail, resendVerification methods)
- `backend/routes/api.php` (add routes)
- `backend/app/Http/Middleware/EnsureEmailIsVerified.php` (NEW middleware)
- `frontend/src/app/auth/verify-email/page.tsx` (NEW)
- `frontend/src/app/auth/verify/page.tsx` (NEW)
- `backend/resources/views/emails/verify-email.blade.php` (NEW)

**Εκτίμηση**: **L** (Large - 2-3 hours)
**Dependencies**: Email service setup, **AUTH-4** (shared email infrastructure)
**AC**:
- ✅ Νέοι χρήστες παίρνουν verification email μετά από register
- ✅ Email περιέχει unique verification link
- ✅ User μπορεί να κάνει login ΜΟΝΟ αν verified
- ✅ Unverified users βλέπουν "Verify your email" screen
- ✅ User μπορεί να ζητήσει resend verification email

---

#### **AUTH-6: Token Expiration & Auto-Refresh**
**Σκοπός**: Security improvement - tokens δεν πρέπει να είναι valid forever.

**Scope**:
- Backend: Sanctum token expiration config (e.g., 7 days)
- Frontend: Auto-refresh logic στο AuthContext (πριν expire)
- Backend: `POST /api/v1/auth/refresh` endpoint (issue new token με το παλιό)
- Frontend: Graceful logout αν token expired + redirect to login

**Files to Modify**:
- `backend/config/sanctum.php` (add expiration => 7 * 24 * 60)
- `backend/app/Http/Controllers/Api/AuthController.php` (add refresh method)
- `backend/routes/api.php` (add refresh route)
- `frontend/src/contexts/AuthContext.tsx` (add auto-refresh logic)
- `frontend/src/lib/api.ts` (add token refresh interceptor)

**Εκτίμηση**: **M-L** (Medium-Large - 90-120 minutes)
**Dependencies**: Καμία
**AC**:
- ✅ Tokens expire μετά από 7 days
- ✅ Frontend auto-refreshes token 1 day πριν expire
- ✅ Expired tokens επιστρέφουν 401 + user logout + redirect
- ✅ Refresh endpoint δίνει νέο token ΜΟΝΟ αν το παλιό είναι valid (όχι expired)

---

### 🟢 **LOW PRIORITY** (Nice-to-Have / Future Enhancements)

#### **AUTH-7: Multi-Device Session Management UI**
**Σκοπός**: User μπορεί να δει active sessions + logout από συγκεκριμένη συσκευή.

**Scope**:
- Backend: Session tracking table (`user_sessions` με device info, last_active)
- Backend: `GET /api/v1/auth/sessions` (λίστα active sessions)
- Backend: `DELETE /api/v1/auth/sessions/{id}` (revoke specific session)
- Frontend: `/account/settings/sessions` page με λίστα + "Logout" button
- `/api/v1/auth/logout-all` endpoint ήδη υπάρχει (χρήση στο UI)

**Εκτίμηση**: **M** (Medium - 60-90 minutes)
**Dependencies**: **AUTH-6** (session tracking infrastructure)

---

#### **AUTH-8: Password Strength Meter (Frontend)**
**Σκοπός**: Visual feedback στο register form για password quality.

**Scope**:
- Frontend: Password strength indicator component (weak/medium/strong/very strong)
- Logic: Check length, uppercase, lowercase, numbers, symbols
- Display: Progress bar με color coding (red → green)
- No backend changes (frontend-only UX enhancement)

**Εκτίμηση**: **S** (Small - 30-45 minutes)
**Dependencies**: Καμία

---

#### **AUTH-9: 2FA (Two-Factor Authentication)**
**Σκοπός**: Extra security layer για producer/admin accounts.

**Scope**:
- Backend: TOTP secret generation + storage (`users.two_factor_secret`)
- Backend: `POST /api/v1/auth/2fa/enable`, `/disable`, `/verify` endpoints
- Frontend: `/account/settings/security` page με 2FA toggle + QR code
- Frontend: `/auth/2fa-verify` page (6-digit code input μετά από login)

**Εκτίμηση**: **L** (Large - 3-4 hours)
**Dependencies**: TOTP library (e.g., `pragmarx/google2fa`)

---

## 📊 Suggested Execution Order

### 🚀 **Sprint 1: Critical Fixes** (Total: ~2-3 hours)
1. **AUTH-1**: Rate limiting (S)
2. **AUTH-2**: Greek backend messages (M)
3. **AUTH-3**: E2E tests (M)

**Outcome**: Stable, secure, well-tested auth system.

---

### 🚀 **Sprint 2: UX & Security Enhancements** (Total: ~5-7 hours)
4. **AUTH-4**: Password reset (L)
5. **AUTH-5**: Email verification (L)
6. **AUTH-6**: Token expiration (M-L)

**Outcome**: Production-ready auth με complete security features.

---

### 🚀 **Sprint 3: Polish & Advanced Features** (Total: ~3-5 hours)
7. **AUTH-7**: Session management UI (M)
8. **AUTH-8**: Password strength meter (S)
9. **AUTH-9**: 2FA (L) - OPTIONAL

**Outcome**: Enterprise-grade auth με advanced features.

---

## 🔗 Related Docs

- **PRD**: `docs/PRODUCT/AUTH-PRD.md`
- **Implementation**: `backend/app/Http/Controllers/Api/AuthController.php`
- **Frontend Context**: `frontend/src/contexts/AuthContext.tsx`
- **Current State**: `docs/OPS/STATE.md` (Dec 7, 2025 - Auth UX improvements)

---

## 📝 Notes

- **ASSUMPTION**: Email service (SMTP/SES) θα είναι configured πριν από AUTH-4/AUTH-5
- **ASSUMPTION**: Token expiration (AUTH-6) είναι μέσης προτεραιότητας - δεν είναι blocker για production launch αλλά καλό να υπάρχει
- **QUESTION**: Θέλουμε mandatory email verification (AUTH-5) ή optional; (Trade-off: security vs onboarding friction)
