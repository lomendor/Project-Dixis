# EMAIL-PROOF-01: Email Delivery Verification Runbook

**Created**: 2026-01-19
**Pass**: OPS-EMAIL-PROOF-01
**Purpose**: Unblock EMAIL-PROOF-01 by documenting exact configuration and verification steps

---

## Overview

This runbook enables production email verification by documenting:
1. Required environment variables
2. Production setup checklist
3. Deterministic proof script for verification

---

## Required Environment Variables

### Backend (`backend/.env` on VPS)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MAIL_MAILER` | Mail driver to use | Yes | `resend` |
| `RESEND_KEY` | Resend API key | Yes | `re_xxxx...` |
| `MAIL_FROM_ADDRESS` | Sender email address | Yes | `no-reply@dixis.gr` |
| `MAIL_FROM_NAME` | Sender display name | Yes | `Dixis` |
| `EMAIL_NOTIFICATIONS_ENABLED` | Feature flag | Yes | `true` |

### Where Variables Are Used

```
backend/config/services.php:28      → 'key' => env('RESEND_KEY')
backend/config/mail.php:17          → 'default' => env('MAIL_MAILER', 'log')
backend/config/mail.php:64-66       → 'resend' => ['transport' => 'resend']
backend/config/mail.php:112-113     → 'address' => env('MAIL_FROM_ADDRESS')
backend/config/notifications.php:28 → 'address' => env('MAIL_FROM_ADDRESS')
```

### Code That Checks Configuration

```php
// backend/routes/api.php lines 40-66 (healthz endpoint)
$resendKeySet = !empty(config('services.resend.key'));
if ($mailer === 'resend') {
    $emailConfigured = $resendKeySet;
}

// backend/app/Console/Commands/TestEmail.php lines 129-130
if ($mailer === 'resend') {
    return !empty(config('services.resend.key'));
}
```

---

## Production Setup Checklist

### Prerequisites

- [ ] SSH access to production VPS (`ssh dixis-prod`)
- [ ] Resend account with verified domain (`dixis.gr`)
- [ ] Resend API key from dashboard

### Step 1: Get Resend API Key

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name: `dixis-production`
4. Permission: "Sending access"
5. Copy the key (starts with `re_`)

### Step 2: Set Environment Variable on VPS

```bash
# SSH into production
ssh dixis-prod

# Edit backend .env
nano /var/www/dixis.gr/backend/.env

# Add/update these lines:
MAIL_MAILER=resend
RESEND_KEY=re_xxxx_your_key_here
MAIL_FROM_ADDRESS=no-reply@dixis.gr
MAIL_FROM_NAME=Dixis
EMAIL_NOTIFICATIONS_ENABLED=true

# Clear config cache
cd /var/www/dixis.gr/backend
php artisan config:clear
php artisan config:cache
```

### Step 3: Verify Configuration

```bash
# Check health endpoint shows email configured
curl -sf https://dixis.gr/api/healthz | jq '.email'
# Expected: {"flag":"enabled","mailer":"resend","configured":true,...}

# Dry-run email test (validates config without sending)
ssh dixis-prod 'cd /var/www/dixis.gr/backend && php artisan dixis:email:test --to=test@example.com --dry-run'
# Expected: "[DRY RUN] Email configuration is valid."
```

### Step 4: Send Test Email

```bash
# Send actual test email
ssh dixis-prod 'cd /var/www/dixis.gr/backend && php artisan dixis:email:test --to=your@email.com'
# Expected: "[OK] Test email sent successfully to your@email.com"
```

### Step 5: Verify Receipt

1. Check inbox for "Test Email from Dixis"
2. Check spam folder if not in inbox
3. Verify sender is `no-reply@dixis.gr`

---

## Deterministic Proof Script

After setting up email, run the proof script:

```bash
./scripts/email-proof.sh
```

This script:
1. Verifies health endpoint shows email configured
2. Runs dry-run to validate configuration
3. Sends actual test email (if `--send` flag provided)
4. Outputs machine-readable proof

### Usage

```bash
# Dry-run only (default)
./scripts/email-proof.sh

# Actually send test email
./scripts/email-proof.sh --send --to=your@email.com
```

---

## Troubleshooting

### "configured": false

The Resend key is missing or invalid.

```bash
# Check if key is set
ssh dixis-prod 'grep RESEND_KEY /var/www/dixis.gr/backend/.env'

# Verify key format (should start with re_)
# If missing, add it and run config:cache
```

### "flag": "disabled"

EMAIL_NOTIFICATIONS_ENABLED is false.

```bash
# Check flag
ssh dixis-prod 'grep EMAIL_NOTIFICATIONS_ENABLED /var/www/dixis.gr/backend/.env'

# Set to true if missing
echo "EMAIL_NOTIFICATIONS_ENABLED=true" >> /var/www/dixis.gr/backend/.env
php artisan config:cache
```

### Test email not received

1. Check Resend dashboard for delivery status
2. Verify domain is verified in Resend
3. Check spam/junk folder
4. Verify MAIL_FROM_ADDRESS matches Resend verified domain

---

## Mailable Classes

These are the production mailables that require email to be configured:

| Mailable | Trigger | Template |
|----------|---------|----------|
| `ConsumerOrderPlaced` | Order created | `emails/orders/consumer-order-placed.blade.php` |
| `ProducerNewOrder` | Order created | `emails/orders/producer-new-order.blade.php` |
| `OrderShipped` | Status → shipped | `emails/orders/order-shipped.blade.php` |
| `OrderDelivered` | Status → delivered | `emails/orders/order-delivered.blade.php` |
| `VerifyEmailMail` | User registration | `emails/auth/verify-email.blade.php` |
| `ResetPasswordMail` | Password reset | `emails/auth/reset-password.blade.php` |
| `ProducerWeeklyDigest` | Scheduled job | `emails/producer/weekly-digest.blade.php` |

---

## Related Documentation

- `docs/AGENT/SUMMARY/Pass-V1-VERIFY-TRIO-01.md` - Original EMAIL-PROOF-01 blocker
- `docs/OPS/STATE.md` - Pass EMAIL-SMOKE-01 prior verification
- `backend/app/Console/Commands/TestEmail.php` - Test command source

---

_Pass: OPS-EMAIL-PROOF-01 | Generated: 2026-01-19 | Author: Claude_
