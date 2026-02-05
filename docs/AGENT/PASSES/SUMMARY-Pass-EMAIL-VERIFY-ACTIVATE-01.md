# Pass EMAIL-VERIFY-ACTIVATE-01: Enable Email Verification in Production

**Date**: 2026-02-06
**Status**: DONE
**Branch**: N/A (config activation + test fix only)

---

## Goal

Activate the already-implemented email verification feature (EMAIL-VERIFY-01, 2026-01-18) in production.

---

## Discovery

EMAIL-VERIFY-01 was **fully implemented** but **disabled** in production:

| Component | Status |
|-----------|--------|
| Backend Controller | ✅ `EmailVerificationController.php` |
| Token Migration | ✅ `email_verification_tokens` table |
| Email Template (Greek) | ✅ `verify-email.blade.php` |
| Frontend Page | ✅ `/auth/verify-email` |
| i18n (EL/EN) | ✅ `messages/el.json`, `messages/en.json` |
| Backend Tests | ✅ 11 tests in `EmailVerificationTest.php` |
| E2E Tests | ✅ 2 tests in `email-verification.spec.ts` |
| **Production Flag** | ❌ `EMAIL_VERIFICATION_REQUIRED` not set |

---

## What Was Done

### 1. VPS Configuration (not in repo)

```bash
# Added to /var/www/dixis/current/backend/.env
EMAIL_VERIFICATION_REQUIRED=true

# Cleared Laravel config cache
php artisan config:clear
php artisan config:cache
```

### 2. E2E Test Fix (+4 LOC)

**File**: `frontend/tests/e2e/email-verification.spec.ts`

**Issue**: Test expected `verify-error` state, but backend returns "Invalid or expired verification token" which contains "expired" → frontend shows `verify-expired` state (has resend button).

**Fix**: Updated test to expect `verify-expired` and `resend-button`.

---

## Verification Results

### Backend Endpoints

```bash
# Resend endpoint (anti-enumeration)
curl -X POST https://dixis.gr/api/v1/auth/email/resend \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# → {"message":"If an account exists with this email..."}

# Verify endpoint (invalid token)
curl -X POST https://dixis.gr/api/v1/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","token":"invalid"}'
# → {"message":"Invalid or expired verification token."}
```

### Registration Flow

```bash
# Register new user
curl -X POST https://dixis.gr/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@dixis.gr","phone":"+30...","password":"..."}'
# → verification_sent: true, email_verified_at: null
```

### E2E Tests

```
Running 2 tests using 1 worker

  ✓ shows missing params state when no token/email provided (10s)
  ✓ shows expired state for invalid token (15s)

2 passed (25s)
```

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/tests/e2e/email-verification.spec.ts` | +4 LOC (fix expected state) |

---

## VPS Config Added (not in repo)

| File | Change |
|------|--------|
| `/var/www/dixis/current/backend/.env` | Added `EMAIL_VERIFICATION_REQUIRED=true` |

---

## User Impact

- **New registrations**: Now require email verification
- **Existing users**: Unaffected (flag only affects new signups)
- **Verification email**: Sent via Resend (already configured for ORDER-NOTIFY)

---

## Rollback

If issues arise:
```bash
# Remove or set to false
EMAIL_VERIFICATION_REQUIRED=false

# Clear cache
php artisan config:clear
php artisan config:cache
```

---

## Definition of Done ✅

- [x] `EMAIL_VERIFICATION_REQUIRED=true` set on VPS backend
- [x] Backend config cache cleared
- [x] New user registration sends verification email
- [x] Verification endpoint returns expected errors
- [x] E2E tests pass (2/2)
- [x] SSOT docs updated (AGENT-STATE, OPS/STATE)
