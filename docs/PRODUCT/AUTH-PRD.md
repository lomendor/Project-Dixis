# PRD: Σύστημα Εγγραφής & Σύνδεσης (Authentication & Authorization)

**Τελευταία ενημέρωση**: 2025-12-10
**Status**: 🟡 PARTIAL IMPLEMENTATION (βασική λειτουργικότητα ενεργή, gaps καταγεγραμμένα)

---

## 🎯 Σκοπός

Το σύστημα εγγραφής και σύνδεσης της Dixis επιτρέπει σε χρήστες (καταναλωτές, παραγωγοί, admins) να δημιουργούν λογαριασμούς και να πιστοποιούνται για πρόσβαση στις προστατευμένες λειτουργίες της πλατφόρμας.

---

## 👥 Τύποι Χρηστών

### 1. **Consumer (Καταναλωτής)**
- Περιήγηση προϊόντων
- Προσθήκη προϊόντων στο καλάθι
- Δημιουργία παραγγελιών
- Προβολή ιστορικού παραγγελιών

### 2. **Producer (Παραγωγός)**
- Όλες οι λειτουργίες του Consumer +
- Δημιουργία/επεξεργασία προϊόντων
- Διαχείριση inventory (stock)
- Producer dashboard & analytics
- Διαχείριση παραγγελιών προϊόντων τους

### 3. **Admin (Διαχειριστής)**
- Πλήρης πρόσβαση σε όλα τα modules
- Admin dashboard με analytics
- Διαχείριση παραγγελιών (orders)
- Διαχείριση παραγωγών (producers)
- Pricing controls

---

## 🔄 Ροές (Flows)

### 1️⃣ **Register (Εγγραφή)**

**Endpoint**: `POST /api/v1/auth/register`
**Frontend**: `/auth/register`

**Required Fields**:
- `name` (string, max 255 chars)
- `email` (string, email format, unique)
- `password` (string, min 8 chars)
- `password_confirmation` (string, must match password)
- `role` (enum: "consumer" | "producer" | "admin")

**Validation Κανόνες** (Backend - Laravel):
```php
'name' => 'required|string|max:255',
'email' => 'required|string|email|max:255|unique:users',
'password' => 'required|string|min:8|confirmed',
'role' => 'required|string|in:consumer,producer,admin',
```

**Success Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Γιάννης Παπαδόπουλος",
    "email": "giannis@example.com",
    "role": "producer",
    "email_verified_at": "2025-12-10T10:00:00.000000Z",
    "created_at": "2025-12-10T10:00:00.000000Z",
    "updated_at": "2025-12-10T10:00:00.000000Z"
  },
  "token": "1|abc123...",
  "token_type": "Bearer"
}
```

**Error Responses**:
- `422 Unprocessable Entity`: Validation errors (e.g., email already exists, password too short)

**Frontend Behavior** (Implemented - Dec 7, 2025):
- ✅ Ελληνικά labels/placeholders
- ✅ Loading spinner κατά την αποστολή
- ✅ Success toast: "Καλώς ήρθατε στο Dixis, [όνομα]! Ο λογαριασμός [Παραγωγού/Καταναλωτή] δημιουργήθηκε με επιτυχία."
- ✅ Error handling με ελληνικά μηνύματα (mapping από backend αγγλικά errors)

**Known Issues**:
- ⚠️ **Auto-verified email**: Το `email_verified_at` γίνεται auto-set χωρίς confirmation flow (demo mode)
- ⚠️ **Backend validation messages σε αγγλικά**: Frontend τα μεταφράζει μετά (inconsistent approach)

---

### 2️⃣ **Login (Σύνδεση)**

**Endpoint**: `POST /api/v1/auth/login`
**Frontend**: `/auth/login`

**Required Fields**:
- `email` (string, email format)
- `password` (string)

**Validation Κανόνες**:
```php
'email' => 'required|email',
'password' => 'required',
```

**Success Response (200 OK)**:
```json
{
  "message": "Login successful",
  "user": { /* same as register */ },
  "token": "2|xyz789...",
  "token_type": "Bearer"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials ("Invalid credentials", "The provided credentials are incorrect.")
- `429 Too Many Requests`: Rate limiting triggered (πάρα πολλές προσπάθειες)

**Frontend Behavior** (Implemented - Dec 7, 2025):
- ✅ Ελληνικά labels/placeholders
- ✅ Loading spinner κατά την αποστολή
- ✅ Success toast: "Καλώς ήρθατε πίσω, [όνομα]!"
- ✅ Error handling με status-specific Greek messages:
  - 401/422: "Λάθος email ή κωδικός πρόσβασης."
  - 429: "Πάρα πολλές προσπάθειες σύνδεσης. Περιμένετε λίγο."
  - 500: "Πρόβλημα με τον διακομιστή."
  - Network timeout: "Η σύνδεση διήρκεσε πολύ."

**Known Issues**:
- ⚠️ **No rate limiting enforcement**: Το backend δεν έχει throttle middleware στο login endpoint (security risk)
- ⚠️ **No multi-device session management**: Δεν υπάρχει UI για να δεις/ακυρώσεις active sessions

---

### 3️⃣ **Logout (Αποσύνδεση)**

**Endpoint**: `POST /api/v1/auth/logout` (authenticated)
**Frontend**: Triggered από user menu

**Behavior**:
- Revokes current access token (single device logout)
- Alternative: `POST /api/v1/auth/logout-all` για αποσύνδεση από όλες τις συσκευές

**Success Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

### 4️⃣ **Profile (Προφίλ Χρήστη)**

**Endpoint**: `GET /api/v1/auth/profile` (authenticated)

**Success Response (200 OK)**:
```json
{
  "user": { /* full user object */ }
}
```

**Usage**: Το frontend το καλεί στο init για να ελέγξει αν το token είναι valid και να φορτώσει user data.

---

## 🔐 Business Κανόνες

### Email Uniqueness
- ❌ **ΔΕΝ επιτρέπεται**: Δύο χρήστες με το ίδιο email
- **Validation**: `unique:users` στο register
- **Error message** (frontend): "Το email χρησιμοποιείται ήδη. Δοκιμάστε να συνδεθείτε ή χρησιμοποιήστε άλλο email."

### Password Requirements
- **Minimum**: 8 χαρακτήρες
- **Confirmation**: Το `password_confirmation` πρέπει να ταιριάζει με το `password`
- **Error message** (frontend): "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες."

### Token Management
- **Token Type**: Laravel Sanctum (Bearer tokens)
- **Storage**: Frontend αποθηκεύει το token σε `localStorage` με key `auth_token`
- **Expiration**: Δεν υπάρχει auto-expiration (TODO: implement token refresh/expiry logic)

### Role-Based Access Control (RBAC)
- **Frontend Guards**: `AuthGuard` component ελέγχει `requireAuth` και `requireRole`
- **Backend Guards**: `auth:sanctum` middleware προστατεύει authenticated routes
- **Admin Routes**: Επιπλέον `BASIC_AUTH=1` guard για `/admin/*` pages (πριν από auth check)

---

## 🔴 Ανοιχτά Ερωτήματα / TODOs

### 🚨 **HIGH PRIORITY**

1. **Email Verification Flow** (MISSING)
   - **Status**: Auto-verified για demo (line 38 AuthController.php: `'email_verified_at' => now()`)
   - **TODO**: Implement proper email verification με confirmation link
   - **Complexity**: M-L
   - **Dependencies**: Email service integration (SMTP/SES)

2. **Password Reset / Forgot Password** (MISSING)
   - **Status**: Δεν υπάρχει functionality
   - **TODO**: Implement "Forgot Password?" flow με reset link via email
   - **Complexity**: M
   - **Dependencies**: Email service integration

3. **Backend Validation Messages σε Ελληνικά** (INCONSISTENT)
   - **Status**: Backend επιστρέφει αγγλικά ("Validation failed", "Invalid credentials"), frontend τα μεταφράζει
   - **TODO**: Centralize Greek error messages στο backend (consistent i18n)
   - **Complexity**: S
   - **Dependencies**: None

4. **Rate Limiting στο Login Endpoint** (SECURITY RISK)
   - **Status**: Δεν υπάρχει throttle middleware στο `/api/v1/auth/login`
   - **TODO**: Προσθήκη `->middleware('throttle:5,1')` για brute-force protection
   - **Complexity**: S
   - **Dependencies**: None

### 🟡 **MEDIUM PRIORITY**

5. **Comprehensive E2E Auth Tests** (PARTIAL)
   - **Status**: Smoke tests μόνο (healthz + landing)
   - **TODO**: E2E tests για:
     - Register happy path + validation errors
     - Login happy path + invalid credentials
     - Logout + session cleanup
     - Protected routes access control
   - **Complexity**: M
   - **Dependencies**: Playwright test suite expansion

6. **Token Expiration & Refresh** (MISSING)
   - **Status**: Tokens δεν έχουν expiry (security risk για long-term)
   - **TODO**: Implement token expiration + refresh token flow
   - **Complexity**: M-L
   - **Dependencies**: Frontend token refresh logic + backend expiry policy

7. **Multi-Device Session Management UI** (MISSING)
   - **Status**: Το `/api/v1/auth/logout-all` υπάρχει αλλά δεν έχει UI
   - **TODO**: User settings page με λίστα active sessions + "Logout from all devices" button
   - **Complexity**: M
   - **Dependencies**: Session tracking στο backend

### 🟢 **LOW PRIORITY / FUTURE**

8. **2FA (Two-Factor Authentication)** (NOT PLANNED)
   - **Status**: Δεν υπάρχει
   - **TODO**: Future enhancement για producer/admin accounts
   - **Complexity**: L
   - **Dependencies**: TOTP library integration

9. **Social Login (Google/Facebook)** (NOT PLANNED)
   - **Status**: Δεν υπάρχει
   - **TODO**: Future enhancement για easier onboarding
   - **Complexity**: M-L
   - **Dependencies**: OAuth provider integration

10. **Password Strength Meter** (UX ENHANCEMENT)
    - **Status**: Δεν υπάρχει
    - **TODO**: Visual feedback στο register form για password strength
    - **Complexity**: S
    - **Dependencies**: None (frontend-only)

---

## 📊 Τρέχουσα Κατάσταση (2025-12-10)

### ✅ **COMPLETE**
- Register/Login/Logout basic flows (functional)
- Role-based access control (RBAC) με consumer/producer/admin
- Token-based authentication (Sanctum)
- Frontend auth context με persistent login
- Greek error messages + loading states (UX improvements)
- Protected routes guards (frontend + backend)

### ⏳ **IN PROGRESS**
- Form validation improvements (branch `feat/form-validation-a11y-quickwins`)
- Accessibility (a11y) enhancements

### ❌ **NOT IMPLEMENTED**
- Email verification
- Password reset/forgot password
- Rate limiting στο login endpoint
- Comprehensive E2E auth tests
- Token expiration/refresh logic
- Multi-device session management UI
- Backend Greek error messages

---

## 🔗 Related Docs

- **Implementation**: `backend/app/Http/Controllers/Api/AuthController.php`
- **Frontend Context**: `frontend/src/contexts/AuthContext.tsx`
- **Routes**: `backend/routes/api.php` (lines 36-46)
- **Database Schema**: `users` table (Laravel migration)
- **Recent Changes**: `docs/OPS/STATE.md` (Dec 7, 2025 - Auth UX improvements)

---

## 📝 Notes

- **ASSUMPTION**: Το email verification είναι στο Phase 2/3 roadmap (δεν αναφέρεται ρητά στο PRD-INDEX.md)
- **ASSUMPTION**: Password reset είναι nice-to-have, όχι blocker για Phase 1
- **QUESTION**: Θέλουμε rate limiting στο register επίσης; (πρόληψη spam accounts)
- **QUESTION**: Ποιο είναι το expiry policy για tokens; (e.g., 7 days, 30 days, never?)
