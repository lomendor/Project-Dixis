# Credentials & Environment Variables

**Last Updated**: 2026-01-17 (Pass CREDENTIALS-01)
**Policy**: NO SECRET VALUES in this document. Names and purposes only.

---

## Quick Reference Table

| Provider | Env Vars | Where to Set | How to Validate |
|----------|----------|--------------|-----------------|
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENTS_CARD_FLAG`, `NEXT_PUBLIC_PAYMENTS_CARD_FLAG` | VPS backend/.env + frontend/.env | `/api/health` + test mode checkout |
| **Email (Resend)** | `MAIL_MAILER=resend`, `RESEND_KEY`, `EMAIL_NOTIFICATIONS_ENABLED` | VPS backend/.env | Test email via Tinker |
| **Email (SMTP)** | `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `EMAIL_NOTIFICATIONS_ENABLED` | VPS backend/.env | Test email via Tinker |

---

## Pass 52 — Card Payments (Stripe)

### Required Credentials

| Env Var | Format | Backend/Frontend | Code Reference |
|---------|--------|------------------|----------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Backend | `config/payments.php:32` |
| `STRIPE_PUBLIC_KEY` | `pk_live_...` or `pk_test_...` | Backend | `config/payments.php:33` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Backend | `config/payments.php:34` |
| `PAYMENTS_CARD_FLAG` | `true` | Backend | `config/payments.php:19` |
| `NEXT_PUBLIC_PAYMENTS_CARD_FLAG` | `true` | Frontend | `PaymentMethodSelector.tsx:27` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | Frontend | `StripeProvider.tsx` |

### Where Set

| Environment | Location |
|-------------|----------|
| **Production VPS** | `/var/www/dixis/current/backend/.env` + `/var/www/dixis/current/frontend/.env` |
| **Local Dev** | `backend/.env` + `frontend/.env.local` |
| **CI** | Not needed (feature flag defaults OFF) |

### Enable Steps (Production VPS)

```bash
# 1. SSH to VPS
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# 2. Backend: Add Stripe keys
cat >> /var/www/dixis/current/backend/.env << 'EOF'
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
PAYMENTS_CARD_FLAG=true
EOF

# 3. Frontend: Add flags
cat >> /var/www/dixis/current/frontend/.env << 'EOF'
NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
EOF

# 4. Restart services
sudo systemctl restart dixis-backend.service
pm2 restart dixis-frontend

# 5. Validate presence (no secrets printed)
grep -q "^PAYMENTS_CARD_FLAG=true" /var/www/dixis/current/backend/.env && echo "Backend flag: OK" || echo "Backend flag: MISSING"
grep -q "^NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true" /var/www/dixis/current/frontend/.env && echo "Frontend flag: OK" || echo "Frontend flag: MISSING"
```

### Validation Checklist

1. **Health check**: `curl -s https://dixis.gr/api/healthz | jq`
2. **Stripe test mode**: Use `sk_test_` / `pk_test_` keys first
3. **Card option visible**: Navigate to `/checkout` while logged in — "Κάρτα" option should appear
4. **Test checkout**: Complete a test order with card (Stripe test card: `4242 4242 4242 4242`)
5. **Webhook validation**: Check Stripe dashboard for successful webhook deliveries

### Test Mode vs Live Mode

| Mode | Key Prefix | Purpose |
|------|------------|---------|
| **Test** | `sk_test_`, `pk_test_` | Safe testing, no real charges |
| **Live** | `sk_live_`, `pk_live_` | Real payments |

**Recommendation**: Deploy with test keys first, validate end-to-end, then switch to live.

---

## Pass 60 — Email Notifications

### Option A: Resend (Recommended)

| Env Var | Format | Code Reference |
|---------|--------|----------------|
| `MAIL_MAILER` | `resend` | `config/mail.php:17` |
| `RESEND_KEY` | `re_...` | `config/services.php` |
| `EMAIL_NOTIFICATIONS_ENABLED` | `true` | `config/notifications.php:17` |

### Option B: SMTP

| Env Var | Example | Code Reference |
|---------|---------|----------------|
| `MAIL_MAILER` | `smtp` | `config/mail.php:17` |
| `MAIL_HOST` | `smtp.example.com` | `config/mail.php:44` |
| `MAIL_PORT` | `587` | `config/mail.php:45` |
| `MAIL_USERNAME` | (your username) | `config/mail.php:46` |
| `MAIL_PASSWORD` | (your password) | `config/mail.php:47` |
| `EMAIL_NOTIFICATIONS_ENABLED` | `true` | `config/notifications.php:17` |

### Additional Email Flags

| Env Var | Purpose | Default |
|---------|---------|---------|
| `EMAIL_QUEUE_ENABLED` | Queue emails vs sync send | `false` |
| `PRODUCER_DIGEST_ENABLED` | Weekly producer digest | `false` |
| `MAIL_FROM_ADDRESS` | Sender email | `no-reply@dixis.gr` |
| `MAIL_FROM_NAME` | Sender name | `Dixis` |

### Where Set

| Environment | Location |
|-------------|----------|
| **Production VPS** | `/var/www/dixis/current/backend/.env` |
| **Local Dev** | `backend/.env` (use `MAIL_MAILER=log` for dev) |
| **CI** | Not needed (feature flag defaults OFF) |

### Enable Steps (Production VPS — Resend)

```bash
# 1. SSH to VPS
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# 2. Configure Resend
cat >> /var/www/dixis/current/backend/.env << 'EOF'
MAIL_MAILER=resend
RESEND_KEY=re_YOUR_API_KEY
EMAIL_NOTIFICATIONS_ENABLED=true
EOF

# 3. Restart backend
sudo systemctl restart dixis-backend.service

# 4. Validate presence
grep -q "^EMAIL_NOTIFICATIONS_ENABLED=true" /var/www/dixis/current/backend/.env && echo "Email enabled: OK" || echo "Email: DISABLED"
```

### Validation Checklist

1. **Feature flag check**:
   ```bash
   ssh deploy@147.93.126.235 "grep EMAIL_NOTIFICATIONS /var/www/dixis/current/backend/.env"
   ```

2. **Test email via Tinker**:
   ```bash
   cd /var/www/dixis/current/backend
   php artisan tinker
   >>> Mail::raw('Test from Dixis', fn($m) => $m->to('test@example.com')->subject('Test'));
   ```

3. **Order confirmation flow**: Place a test order and verify email received

4. **Check Laravel logs**:
   ```bash
   tail -50 /var/www/dixis/current/backend/storage/logs/laravel.log | grep -i mail
   ```

---

## Feature Flag Behavior

Both features are gated by feature flags that default to OFF:

| Feature | Flag | Default | Behavior When OFF |
|---------|------|---------|-------------------|
| Card Payments | `PAYMENTS_CARD_FLAG` | `false` | Card option hidden, API returns 503 |
| Email Notifications | `EMAIL_NOTIFICATIONS_ENABLED` | `false` | No emails sent, no-op |

**This means**: Production is safe without credentials. Features only activate when explicitly enabled.

---

## GitHub Secrets (for reference)

These are separate from VPS env vars. GitHub secrets are used by workflows:

| Secret | Purpose | Used By |
|--------|---------|---------|
| `VPS_HOST` | VPS IP address | deploy-*.yml |
| `VPS_USER` | SSH username | deploy-*.yml |
| `VPS_SSH_KEY` | SSH private key | deploy-*.yml |
| `DATABASE_URL_PROD` | Neon PostgreSQL | deploy-frontend.yml |

**Note**: Stripe and Email credentials are NOT in GitHub Secrets — they're configured directly on VPS.

---

## Troubleshooting

### Stripe: Card option not showing

1. Check frontend env: `grep PAYMENTS /var/www/dixis/current/frontend/.env`
2. Rebuild frontend: `pm2 restart dixis-frontend`
3. Clear browser cache

### Email: Not sending

1. Check feature flag: `grep EMAIL_NOTIFICATIONS /var/www/dixis/current/backend/.env`
2. Check mailer driver: `grep MAIL_MAILER /var/www/dixis/current/backend/.env`
3. Check Laravel logs: `tail -100 /var/www/dixis/current/backend/storage/logs/laravel.log`
4. Test with Tinker (see validation checklist)

### General: Changes not taking effect

1. Restart services:
   ```bash
   sudo systemctl restart dixis-backend.service
   pm2 restart dixis-frontend
   ```
2. Clear Laravel cache:
   ```bash
   cd /var/www/dixis/current/backend
   php artisan config:clear
   php artisan cache:clear
   ```

---

## Related Documents

- `docs/AGENT/SOPs/CREDENTIALS.md` — Original credential inventory
- `docs/OPS/SECRETS-MAP.md` — GitHub Secrets reference
- `docs/NEXT-7D.md` → "Waiting on Credentials" section

---

_Lines: ~200 | Last Updated: 2026-01-17_
