# Pass EMAIL-AUTH-01: Password Reset via Resend

**Status**: IN PROGRESS (awaiting CI)
**Date**: 2026-01-17
**PR**: #2274

## What Changed

### API Endpoints

```
POST /api/v1/auth/password/forgot
Body: { "email": "user@example.com" }
Response: 200 (always, prevents enumeration)

POST /api/v1/auth/password/reset
Body: { "token": "...", "email": "...", "password": "...", "password_confirmation": "..." }
Response: 200 on success, 422 on error
```

### Frontend Pages

- `/auth/forgot-password` - Request reset link
- `/auth/reset-password?token=...&email=...` - Set new password
- Added "Forgot password" link on login page

### Email Template

Greek email template at `backend/resources/views/emails/auth/reset-password.blade.php`

### Security Features

- Token hashing (bcrypt)
- 1-hour expiry
- No user enumeration (always 200 on forgot)
- Revokes all tokens on reset (force re-login)
- Throttling: 5 req/min

### Tests

| Test File | Tests |
|-----------|-------|
| `PasswordResetTest.php` | 13 tests covering all scenarios |

## Evidence

- PR #2274 created
- Backend tests: 13/13 passing
- Frontend build: clean

## Files Changed

| File | Change |
|------|--------|
| `backend/app/Http/Controllers/Api/PasswordResetController.php` | New controller |
| `backend/app/Mail/ResetPasswordMail.php` | New mailable |
| `backend/resources/views/emails/auth/reset-password.blade.php` | Email template |
| `backend/routes/api.php` | Added routes |
| `backend/tests/Feature/Api/V1/PasswordResetTest.php` | 13 tests |
| `frontend/src/app/auth/forgot-password/page.tsx` | New page |
| `frontend/src/app/auth/reset-password/page.tsx` | New page |
| `frontend/src/app/auth/login/page.tsx` | Added forgot link |
| `frontend/messages/el.json` | Greek translations |
| `frontend/messages/en.json` | English translations |
