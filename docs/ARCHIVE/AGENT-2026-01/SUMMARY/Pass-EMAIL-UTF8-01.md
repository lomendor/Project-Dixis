# Pass: EMAIL-UTF8-01

**Date (UTC):** 2026-01-21 00:00
**Commit:** (pending PR merge)
**Environment:** Production (https://dixis.gr)

---

## Problem

Greek text in transactional emails (password reset, order confirmations) appeared as mojibake in some email clients. The issue was that while HTML templates included `<meta charset="UTF-8">`, the MIME headers sent by the mail transport did not explicitly specify UTF-8 charset.

### Symptom Evidence

- Password reset email subject "Επαναφορά Κωδικού - Dixis" displayed garbled in some clients
- Email body Greek text showed encoding issues
- HTML meta tag alone is insufficient - MIME headers must specify charset

---

## Root Cause

1. Laravel's mail system sends emails via Resend transport
2. The HTML body was rendered correctly but the Content-Type header didn't explicitly include `charset=UTF-8`
3. Some email clients defaulted to ISO-8859-1 when charset wasn't specified
4. This caused Greek characters to display as mojibake

---

## Fix

Created `MailEncodingServiceProvider` that hooks into Laravel's `MessageSending` event to:

1. Set explicit UTF-8 charset on HTML body: `$message->html($htmlBody, 'utf-8')`
2. Set explicit UTF-8 charset on text body: `$message->text($textBody, 'utf-8')`
3. Add custom header `X-Dixis-Charset: UTF-8` for debugging/verification

### Files Changed

| File | Change |
|------|--------|
| `backend/app/Providers/MailEncodingServiceProvider.php` | NEW (+45 lines) |
| `backend/bootstrap/providers.php` | +1 line (register provider) |
| `backend/tests/Feature/MailEncodingTest.php` | NEW (+120 lines) |

---

## Implementation Details

```php
// MailEncodingServiceProvider.php
Event::listen(MessageSending::class, function (MessageSending $event) {
    $message = $event->message;

    // Ensure HTML body has UTF-8 charset
    $htmlBody = $message->getHtmlBody();
    if ($htmlBody !== null) {
        $message->html($htmlBody, 'utf-8');
    }

    // Ensure text body has UTF-8 charset
    $textBody = $message->getTextBody();
    if ($textBody !== null) {
        $message->text($textBody, 'utf-8');
    }

    // Add custom header for verification
    $headers = $message->getHeaders();
    if (!$headers->has('X-Dixis-Charset')) {
        $headers->addTextHeader('X-Dixis-Charset', 'UTF-8');
    }
});
```

---

## Verification

### Automated Tests

```
PASS  Tests\Feature\MailEncodingTest
  ✓ reset password email has utf8 charset
  ✓ email templates use utf8 meta charset
  ✓ greek characters preserved in email body

Tests: 3 passed (15 assertions)
```

### Manual Verification Steps

After deploy, to verify in Gmail:

1. Trigger a password reset email to a test account
2. Open the received email in Gmail
3. Click the three dots menu → "Show original"
4. Search for `Content-Type:` header
5. Verify it includes `charset=UTF-8` or `charset="UTF-8"`
6. Verify the `X-Dixis-Charset: UTF-8` header is present
7. Verify Greek text displays correctly in the email body

Expected headers:
```
Content-Type: text/html; charset=UTF-8
X-Dixis-Charset: UTF-8
```

---

## Risk Assessment

- **Risk:** LOW — Uses Laravel's standard event system, no changes to mail sending logic
- **Rollback:** Remove `MailEncodingServiceProvider` from `bootstrap/providers.php`
- **Impact:** All transactional emails will now have explicit UTF-8 charset

---

## Affected Emails

All transactional emails benefit from this fix:
- `ResetPasswordMail` - Password reset
- `VerifyEmailMail` - Email verification
- `ConsumerOrderPlaced` - Order confirmation to consumers
- `ProducerNewOrder` - New order notification to producers
- `OrderShipped` - Shipping notification
- `OrderDelivered` - Delivery confirmation
- `ProducerWeeklyDigest` - Weekly summary for producers

---

_Pass: EMAIL-UTF8-01 | Generated: 2026-01-21 | Author: Claude_
