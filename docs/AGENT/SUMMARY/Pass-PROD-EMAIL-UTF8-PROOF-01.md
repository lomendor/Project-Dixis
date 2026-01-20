# Pass: PROD-EMAIL-UTF8-PROOF-01

**Date (UTC):** 2026-01-21 00:00
**Local Time:** 2026-01-21 02:00 (Europe/Athens)
**Deployed Commit:** b52072d4 (EMAIL-UTF8-01)
**Environment:** Production (https://dixis.gr)

---

## Objective

Verify in production that Greek text in transactional emails renders correctly after EMAIL-UTF8-01 fix (commit b52072d4).

---

## Pre-Flight Checks

### Production Email Configuration

```json
// GET https://dixis.gr/api/healthz → .email
{
  "flag": "enabled",
  "mailer": "resend",
  "configured": true,
  "from_configured": true,
  "keys_present": {
    "resend": true
  }
}
```

### Production Health

```
✅ Backend Health: 200
✅ Products API: 200
✅ Products List Page: 200
✅ Product Detail Page: 200
✅ Login Page: 200
```

---

## Email Trigger Action

**Method:** Password Reset Request
**Endpoint:** `POST https://dixis.gr/api/v1/auth/password/forgot`
**Payload:** `{"email": "kourkoutisp@gmail.com"}`

**API Response:**
```json
{
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

**Timestamp:** 2026-01-21 00:00 UTC

---

## Expected Email Content

The `ResetPasswordMail` mailable sends an email with:

| Element | Greek Text |
|---------|------------|
| Subject | Επαναφορά Κωδικού - Dixis |
| Header | Επαναφορά Κωδικού |
| Greeting | Γεια σας |
| Body | Λάβαμε αίτημα για επαναφορά του κωδικού πρόσβασης |
| Warning | Σημαντικό: Αυτός ο σύνδεσμος λήγει σε 1 ώρα |
| Footer | Dixis - Τοπικά Προϊόντα, Άμεσα στην Πόρτα σας |

**Template:** `backend/resources/views/emails/auth/reset-password.blade.php`

---

## Verification Steps (for Human)

1. **Check inbox** for email from `no-reply@dixis.gr` with subject "Επαναφορά Κωδικού - Dixis"
2. **Verify Greek text** displays correctly (no mojibake/garbled characters)

### Optional: MIME Header Verification

In Gmail: Open email → Three dots → "Show original" → Search for:
- `Content-Type: text/html; charset=UTF-8` or `charset="UTF-8"`
- `X-Dixis-Charset: UTF-8` (custom header added by EMAIL-UTF8-01)

---

## Result

| Check | Status |
|-------|--------|
| Email configuration | ✅ PASS |
| Password reset API | ✅ PASS |
| Email received | ⏳ PENDING (human verification) |
| Greek text correct | ⏳ PENDING (human verification) |

**Overall:** ⏳ AWAITING HUMAN VERIFICATION

---

## Evidence (to be provided by Panagiotis)

- [ ] Screenshot of received email showing Greek text
- [ ] Confirmation that subject "Επαναφορά Κωδικού - Dixis" displays correctly
- [ ] (Optional) Screenshot of email headers showing `charset=UTF-8`

---

## Fix Reference

**Pass:** EMAIL-UTF8-01
**Commit:** b52072d4
**PR:** #2357
**Files:**
- `backend/app/Providers/MailEncodingServiceProvider.php` - UTF-8 charset enforcement
- `backend/tests/Feature/MailEncodingTest.php` - Automated verification

**Fix mechanism:** The `MailEncodingServiceProvider` hooks into Laravel's `MessageSending` event to:
1. Set `charset=UTF-8` on HTML body via `$message->html($body, 'utf-8')`
2. Set `charset=UTF-8` on text body via `$message->text($body, 'utf-8')`
3. Add `X-Dixis-Charset: UTF-8` header for verification

---

_Pass: PROD-EMAIL-UTF8-PROOF-01 | Generated: 2026-01-21 | Author: Claude_
