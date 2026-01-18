# Pass 60: Email Infrastructure Enable

**Status**: ✅ CODE COMPLETE (awaiting credentials)
**Created**: 2026-01-17
**Updated**: 2026-01-17 (Pass 60.1 - Enhanced runbook)

## Goal

Enable email sending safely with health diagnostics and CI-safe tests.

## Scope

Minimal code change: Add email status to `/api/health` and `/api/healthz` endpoints. All email wiring already implemented in Pass 53-55.

## Definition of Done

- [x] Audit existing email code and config
- [x] Confirm Pass 53-55 implementation is complete
- [x] Add email configuration status to health endpoints
- [x] Add CI-safe tests for health endpoint changes
- [x] Create documentation (TASKS + SUMMARY)
- [x] PR merged
- [x] Pass 60.1: Enhanced operator runbook
- [x] Pass 60.1: Test email Artisan command

## Implementation Summary

### Finding: Pass 53-55 Already Complete

The email infrastructure was fully implemented:

| Component | Status | Location |
|-----------|--------|----------|
| Notifications config | Complete | `config/notifications.php` |
| Mail config | Complete | `config/mail.php` (resend, smtp, log) |
| OrderEmailService | Complete | `app/Services/OrderEmailService.php` |
| ConsumerOrderPlaced | Complete | `app/Mail/ConsumerOrderPlaced.php` |
| ProducerNewOrder | Complete | `app/Mail/ProducerNewOrder.php` |
| OrderShipped | Complete | `app/Mail/OrderShipped.php` |
| OrderDelivered | Complete | `app/Mail/OrderDelivered.php` |
| ProducerWeeklyDigest | Complete | `app/Mail/ProducerWeeklyDigest.php` |
| Feature tests | Complete | `tests/Feature/OrderEmailNotificationTest.php` |

### Code Changes

Added email configuration status to `/api/health` and `/api/healthz`:

```json
{
  "email": {
    "flag": "disabled",
    "mailer": "log",
    "configured": false,
    "from_configured": true,
    "keys_present": {
      "resend": false,
      "smtp_host": false,
      "smtp_user": false
    }
  }
}
```

### Tests Added

- `test_health_endpoint_includes_email_status()` - Verifies email structure in response
- `test_healthz_endpoint_includes_email_status()` - Verifies healthz also includes email

---

## Operator Runbook (Production)

### Prerequisites Checklist

Before enabling email on production, complete these steps:

#### 1. Resend Account Setup

- [ ] Create account at [resend.com](https://resend.com)
- [ ] Add and verify domain `dixis.gr`
- [ ] Configure DNS records (provided by Resend):
  - SPF record (TXT): Allows Resend to send on behalf of dixis.gr
  - DKIM record (TXT): Cryptographic signature for email authentication
  - Optional: DMARC record for reporting
- [ ] Wait for domain verification (usually 5-10 minutes)
- [ ] Generate API key (starts with `re_`)
- [ ] Note recommended FROM address: `info@dixis.gr` or `no-reply@dixis.gr`

#### 2. SSH Access

- [ ] Confirm SSH access works: `ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235`

---

### Option A: Resend (Recommended)

```bash
# 1. SSH to VPS
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# 2. Add Resend configuration (replace re_YOUR_API_KEY with actual key)
cat >> /var/www/dixis/current/backend/.env << 'EOF'
MAIL_MAILER=resend
RESEND_KEY=re_YOUR_API_KEY
EMAIL_NOTIFICATIONS_ENABLED=true
MAIL_FROM_ADDRESS=info@dixis.gr
MAIL_FROM_NAME=Dixis
EOF

# 3. Clear config cache and restart backend
cd /var/www/dixis/current/backend
php artisan config:clear
sudo systemctl restart dixis-backend.service
```

### Option B: SMTP

```bash
# 1. SSH to VPS
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# 2. Add SMTP configuration
cat >> /var/www/dixis/current/backend/.env << 'EOF'
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
EMAIL_NOTIFICATIONS_ENABLED=true
MAIL_FROM_ADDRESS=info@dixis.gr
MAIL_FROM_NAME=Dixis
EOF

# 3. Clear config cache and restart backend
cd /var/www/dixis/current/backend
php artisan config:clear
sudo systemctl restart dixis-backend.service
```

---

### Verification Steps

#### Step 1: Check Health Endpoint

```bash
# Run from local machine or VPS
curl -s https://dixis.gr/api/healthz | jq '.email'
```

**Expected output when correctly configured:**

```json
{
  "flag": "enabled",
  "mailer": "resend",
  "configured": true,
  "from_configured": true,
  "keys_present": {
    "resend": true,
    "smtp_host": false,
    "smtp_user": false
  }
}
```

**If you see `configured: false`**, check:
- Is `RESEND_KEY` set correctly? (starts with `re_`)
- Did you run `php artisan config:clear`?
- Did you restart the backend service?

#### Step 2: Send Test Email

```bash
# SSH to VPS first
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# Navigate to backend
cd /var/www/dixis/current/backend

# Dry run (validates config without sending)
php artisan dixis:email:test --to=your-email@example.com --dry-run

# Send actual test email
php artisan dixis:email:test --to=your-email@example.com
```

**Expected output (success):**

```
[OK] Test email sent successfully to your-email@example.com
```

**Expected output (dry run):**

```
[DRY RUN] Email configuration is valid.
[DRY RUN] Would send to: your-email@example.com
[DRY RUN] From: Dixis <i***@dixis.gr>
[DRY RUN] Subject: Test Email from Dixis
```

#### Step 3: Check Laravel Logs

```bash
tail -50 /var/www/dixis/current/backend/storage/logs/laravel.log | grep -i mail
```

---

### Rollback Steps

If email is causing issues, disable it immediately:

```bash
# 1. SSH to VPS
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# 2. Disable email notifications
sed -i 's/EMAIL_NOTIFICATIONS_ENABLED=true/EMAIL_NOTIFICATIONS_ENABLED=false/' /var/www/dixis/current/backend/.env

# 3. Clear cache and restart
cd /var/www/dixis/current/backend
php artisan config:clear
sudo systemctl restart dixis-backend.service

# 4. Verify disabled
curl -s https://dixis.gr/api/healthz | jq '.email.flag'
# Should output: "disabled"
```

To fully remove email configuration:

```bash
# Remove email-related lines from .env
sed -i '/^MAIL_MAILER=/d' /var/www/dixis/current/backend/.env
sed -i '/^RESEND_KEY=/d' /var/www/dixis/current/backend/.env
sed -i '/^EMAIL_NOTIFICATIONS_ENABLED=/d' /var/www/dixis/current/backend/.env

# Restart
cd /var/www/dixis/current/backend
php artisan config:clear
sudo systemctl restart dixis-backend.service
```

---

## Required Credentials

### Option A: Resend

| Env Var | Format | Location |
|---------|--------|----------|
| `MAIL_MAILER` | `resend` | VPS backend/.env |
| `RESEND_KEY` | `re_...` | VPS backend/.env |
| `EMAIL_NOTIFICATIONS_ENABLED` | `true` | VPS backend/.env |
| `MAIL_FROM_ADDRESS` | `info@dixis.gr` | VPS backend/.env |
| `MAIL_FROM_NAME` | `Dixis` | VPS backend/.env |

### Option B: SMTP

| Env Var | Example | Location |
|---------|---------|----------|
| `MAIL_MAILER` | `smtp` | VPS backend/.env |
| `MAIL_HOST` | `smtp.example.com` | VPS backend/.env |
| `MAIL_PORT` | `587` | VPS backend/.env |
| `MAIL_USERNAME` | (your username) | VPS backend/.env |
| `MAIL_PASSWORD` | (your password) | VPS backend/.env |
| `EMAIL_NOTIFICATIONS_ENABLED` | `true` | VPS backend/.env |

### Additional Flags

| Env Var | Purpose | Default |
|---------|---------|---------|
| `EMAIL_QUEUE_ENABLED` | Queue emails vs sync | `false` |
| `PRODUCER_DIGEST_ENABLED` | Weekly producer digest | `false` |
| `MAIL_FROM_ADDRESS` | Sender email | `info@dixis.gr` |
| `MAIL_FROM_NAME` | Sender name | `Dixis` |

See `docs/OPS/CREDENTIALS.md` for complete reference.

---

## Troubleshooting

### "configured: false" after adding keys

1. Check if `RESEND_KEY` starts with `re_`
2. Run `php artisan config:clear`
3. Restart service: `sudo systemctl restart dixis-backend.service`
4. Check `.env` file: `grep RESEND /var/www/dixis/current/backend/.env`

### Test email command refuses to send

The command requires `EMAIL_NOTIFICATIONS_ENABLED=true`. Check:
```bash
grep EMAIL_NOTIFICATIONS_ENABLED /var/www/dixis/current/backend/.env
```

### Emails not being received

1. Check Laravel logs for errors
2. Verify domain is verified in Resend dashboard
3. Check spam folder
4. Verify FROM address matches verified domain

---

## Notes

- Emails are feature-flagged: `EMAIL_NOTIFICATIONS_ENABLED` defaults to `false`
- Queue is optional: `EMAIL_QUEUE_ENABLED` defaults to `false` (sync send)
- Resend is recommended over SMTP for reliability
- Default FROM: `info@dixis.gr` (fallback if not set)
- Existing mailables: order confirmations, producer notifications, status updates, weekly digest
