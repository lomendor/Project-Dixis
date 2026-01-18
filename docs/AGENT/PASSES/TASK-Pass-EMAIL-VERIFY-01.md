# TASK: Pass EMAIL-VERIFY-01 — Email Verification Flow

**Created**: 2026-01-18
**Status**: ✅ DONE

---

## Objective

Implement end-to-end email verification flow allowing users to verify their email addresses after registration.

## Requirements

### Backend (Laravel)

1. **Routes**:
   - `POST /api/v1/auth/email/verify` — Verify email with token
   - `POST /api/v1/auth/email/resend` — Resend verification email

2. **Controller**: `EmailVerificationController`
   - `verify(token, email)` — Validates token, marks `email_verified_at`
   - `resend(email)` — Sends new verification email (rate-limited)

3. **Token Design**:
   - 24-hour expiry
   - Hashed storage (never raw)
   - Single-use (deleted on success)

4. **Security**:
   - No user enumeration (resend always returns 200)
   - Rate limiting on both endpoints
   - Token hash comparison

5. **Mail**: `VerifyEmailMail` with Greek template

### Frontend (Next.js)

1. `/auth/verify-email` page:
   - Reads `?token=...&email=...` from URL
   - Shows loading → success/error/expired states
   - Resend button for expired tokens

2. i18n: Greek + English translations

### Configuration

- `EMAIL_VERIFICATION_REQUIRED=true` — Enables verification requirement
- `EMAIL_NOTIFICATIONS_ENABLED=true` — Enables email sending

## Files Changed

### Backend
- `app/Http/Controllers/Api/EmailVerificationController.php` (new)
- `app/Mail/VerifyEmailMail.php` (new)
- `resources/views/emails/auth/verify-email.blade.php` (new)
- `database/migrations/2026_01_18_000001_create_email_verification_tokens_table.php` (new)
- `routes/api.php` (add routes)
- `config/notifications.php` (add flag)
- `app/Http/Controllers/Api/AuthController.php` (send verification on register)
- `tests/Feature/EmailVerificationTest.php` (new, 11 tests)

### Frontend
- `src/app/auth/verify-email/page.tsx` (new)
- `messages/el.json` (add verifyEmail.*)
- `messages/en.json` (add verifyEmail.*)
- `tests/e2e/email-verification.spec.ts` (new, 2 tests)

## Test Coverage

### Backend (11 tests)
- verify_endpoint_validates_required_fields
- verify_returns_error_for_invalid_token
- verify_returns_error_for_expired_token
- verify_succeeds_with_valid_token
- verify_returns_success_for_already_verified_user
- verify_returns_error_for_nonexistent_email
- resend_validates_required_fields
- resend_always_returns_success_to_prevent_enumeration
- resend_creates_token_for_unverified_user
- resend_does_not_create_token_for_verified_user
- resend_replaces_existing_token

### E2E (2 tests)
- shows missing params state when no token/email provided
- shows error state for invalid token

## Backwards Compatibility

- Default `EMAIL_VERIFICATION_REQUIRED=false` maintains auto-verify behavior
- Existing users unaffected (`email_verified_at` nullable)
- Registration continues to work without verification enabled

---

_Pass: EMAIL-VERIFY-01 | Author: Claude_
