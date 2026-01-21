# Pass: PROD-EMAIL-UTF8-PROOF-01

**Date (UTC):** 2026-01-21 00:00
**Local Time:** 2026-01-21 02:00 (Europe/Athens)
**Deployed Commit:** b52072d4 (EMAIL-UTF8-01)
**Environment:** Production (https://dixis.gr)

---

## Objective

Verify in production that Greek text in transactional emails renders correctly after EMAIL-UTF8-01 fix (commit b52072d4).

---

## Result

| Check | Status |
|-------|--------|
| Email configuration | ✅ PASS |
| Password reset API | ✅ PASS |
| Email received | ✅ PASS |
| Subject Greek text | ✅ PASS — "Επαναφορά Κωδικού - Dixis" displays correctly |
| HTML body Greek text | ✅ PASS — UTF-8 verified via Gmail "Show original" |

**Overall:** ✅ PASS

---

## Verification Evidence (Gmail "Show original")

Raw email headers confirm proper UTF-8 encoding:

```
Content-Transfer-Encoding: quoted-printable
Content-Type: text/html; charset=utf-8
```

### Notes

1. **Prior "mojibake" was a false positive**: Raw quoted-printable content requires decoding before display. The extraction artifact showed encoded bytes, not actual mojibake.

2. **Email structure**: Single-part `text/html` (no `text/plain` alternative). This is valid and renders correctly in all modern email clients.

3. **Optional future improvement**: Add explicit `text/plain` alternative for accessibility (screen readers, text-only clients). Not required for MVP.

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

## Fix Reference (EMAIL-UTF8-01)

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

_Pass: PROD-EMAIL-UTF8-PROOF-01 | Generated: 2026-01-21 | Verified: 2026-01-21 | Author: Claude_
