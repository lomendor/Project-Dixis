# Pass 60: Email Infrastructure Enable

**Status**: READY FOR CREDENTIALS
**Created**: 2026-01-17

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

## Operator Steps (VPS Enablement)

### Prerequisites

1. Resend account with API key OR SMTP credentials
2. SSH access to VPS: `ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235`

### Option A: Resend (Recommended)

```bash
# 1. SSH to VPS
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# 2. Add Resend configuration
cat >> /var/www/dixis/current/backend/.env << 'EOF'
MAIL_MAILER=resend
RESEND_KEY=re_YOUR_API_KEY
EMAIL_NOTIFICATIONS_ENABLED=true
MAIL_FROM_ADDRESS=no-reply@dixis.gr
MAIL_FROM_NAME=Dixis
EOF

# 3. Restart backend
sudo systemctl restart dixis-backend.service

# 4. Validate presence (no secrets printed)
grep -q "^EMAIL_NOTIFICATIONS_ENABLED=true" /var/www/dixis/current/backend/.env && echo "Email enabled: OK" || echo "Email: DISABLED"
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
MAIL_FROM_ADDRESS=no-reply@dixis.gr
MAIL_FROM_NAME=Dixis
EOF

# 3. Restart backend
sudo systemctl restart dixis-backend.service
```

### Validation

```bash
# 1. Check health endpoint shows email configured
curl -s https://dixis.gr/api/healthz | jq '.email'

# Expected output (when enabled with Resend):
# {
#   "flag": "enabled",
#   "mailer": "resend",
#   "configured": true,
#   "keys_present": {
#     "resend": true,
#     "smtp_host": false,
#     "smtp_user": false
#   }
# }

# 2. Test email via Tinker
cd /var/www/dixis/current/backend
php artisan tinker
>>> Mail::raw('Test from Dixis', fn($m) => $m->to('test@example.com')->subject('Test'));

# 3. Check Laravel logs
tail -50 /var/www/dixis/current/backend/storage/logs/laravel.log | grep -i mail
```

### Rollback (if needed)

```bash
# Disable email notifications
sed -i 's/EMAIL_NOTIFICATIONS_ENABLED=true/EMAIL_NOTIFICATIONS_ENABLED=false/' /var/www/dixis/current/backend/.env

# Restart backend
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
| `MAIL_FROM_ADDRESS` | Sender email | `no-reply@dixis.gr` |
| `MAIL_FROM_NAME` | Sender name | `Dixis` |

See `docs/OPS/CREDENTIALS.md` for complete reference.

---

## Notes

- Emails are feature-flagged: `EMAIL_NOTIFICATIONS_ENABLED` defaults to `false`
- Queue is optional: `EMAIL_QUEUE_ENABLED` defaults to `false` (sync send)
- Resend is recommended over SMTP for reliability
- Existing mailables: order confirmations, producer notifications, status updates, weekly digest
