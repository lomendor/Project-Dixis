# Pass EMAIL-AUTH-01 — Password Reset via Resend

## Goal

Implement password reset functionality using the existing Resend email infrastructure.

## Decisions

- Use Laravel's `password_reset_tokens` table (already exists)
- Hash tokens with bcrypt before storage
- 1-hour token expiry
- Always return 200 on forgot endpoint (prevents user enumeration)
- Revoke all auth tokens on successful reset (force re-login)
- Greek-first email template

## Implementation Steps

### Backend

1. Created `PasswordResetController` with `forgot` and `reset` methods
2. Created `ResetPasswordMail` Mailable class
3. Created email template at `resources/views/emails/auth/reset-password.blade.php`
4. Added routes with throttling (5 req/min)

### Frontend

1. Created `/auth/forgot-password` page
2. Created `/auth/reset-password` page with token/email URL params
3. Added "Forgot password" link to login page
4. Added i18n translations (EL + EN)

## Tests

- 13 backend feature tests in `tests/Feature/Api/V1/PasswordResetTest.php`
- Covers: validation, token creation, expiry, security, edge cases

## Risks/Pending

- Email sending blocked until operator provides Resend key and enables `EMAIL_NOTIFICATIONS_ENABLED=true`
- E2E tests not included (requires email interception)
