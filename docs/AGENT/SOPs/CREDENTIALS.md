# Credentials Inventory

**Last Updated**: 2025-12-29
**Policy**: NO SECRET VALUES in this document. Names and purposes only.

---

## Architecture Note

**VPS-Only Credentials**: Stripe and Email credentials are configured directly on the VPS, NOT in GitHub secrets. Feature flags default to OFF — the system is safe without credentials.

**No CI Workflow Changes Needed**: Both features use feature flags that return graceful errors (503 for Stripe, no-op for Email) when disabled.

---

## Pass 52 — Card Payments (Stripe)

**Status**: BLOCKED (waiting for user to provide Stripe credentials)
**Feature Flag**: `PAYMENTS_CARD_FLAG` defaults to `false` (safe)

| Secret Name | Purpose | Where Configured |
|-------------|---------|------------------|
| `STRIPE_SECRET_KEY` | Server-side API key (sk_live_*) | VPS backend/.env |
| `STRIPE_PUBLIC_KEY` | Client publishable key (pk_live_*) | VPS backend/.env |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification (whsec_*) | VPS backend/.env |
| `PAYMENTS_CARD_FLAG` | Backend feature flag (set to `true` to enable) | VPS backend/.env |
| `NEXT_PUBLIC_PAYMENTS_CARD_FLAG` | Frontend feature flag | VPS frontend/.env |

**Enable Steps (VPS)**:
```bash
# 1. SSH to VPS
ssh dixis-vps

# 2. Add Stripe keys to backend/.env (replace with actual values)
echo "STRIPE_SECRET_KEY=sk_live_..." >> /var/www/dixis/current/backend/.env
echo "STRIPE_PUBLIC_KEY=pk_live_..." >> /var/www/dixis/current/backend/.env
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> /var/www/dixis/current/backend/.env
echo "PAYMENTS_CARD_FLAG=true" >> /var/www/dixis/current/backend/.env

# 3. Add frontend flag
echo "NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true" >> /var/www/dixis/current/frontend/.env

# 4. Restart services
sudo systemctl restart dixis-backend.service
pm2 restart dixis-frontend

# 5. Validate (presence check only)
grep -q "^STRIPE_SECRET_KEY=" /var/www/dixis/current/backend/.env && echo "present" || echo "missing"
```

---

## Pass 60 — Email Notifications (SMTP/Resend)

**Status**: BLOCKED (waiting for user to provide SMTP/Resend credentials)
**Feature Flag**: `EMAIL_NOTIFICATIONS_ENABLED` defaults to `false` (safe)

| Secret Name | Purpose | Where Configured |
|-------------|---------|------------------|
| `MAIL_MAILER` | Mail driver (`smtp`, `resend`, `log`) | VPS backend/.env |
| `MAIL_HOST` | SMTP server hostname | VPS backend/.env |
| `MAIL_PORT` | SMTP port (587, 465, etc.) | VPS backend/.env |
| `MAIL_USERNAME` | SMTP authentication username | VPS backend/.env |
| `MAIL_PASSWORD` | SMTP authentication password | VPS backend/.env |
| `RESEND_KEY` | Resend API key (alternative to SMTP) | VPS backend/.env |
| `EMAIL_NOTIFICATIONS_ENABLED` | Feature flag (set to `true` to enable) | VPS backend/.env |

**Enable Steps (Resend option)**:
```bash
# 1. SSH to VPS
ssh dixis-vps

# 2. Configure Resend in backend/.env
echo "MAIL_MAILER=resend" >> /var/www/dixis/current/backend/.env
echo "RESEND_KEY=re_..." >> /var/www/dixis/current/backend/.env
echo "EMAIL_NOTIFICATIONS_ENABLED=true" >> /var/www/dixis/current/backend/.env

# 3. Restart backend
sudo systemctl restart dixis-backend.service

# 4. Validate (presence check only)
grep -q "^EMAIL_NOTIFICATIONS_ENABLED=true" /var/www/dixis/current/backend/.env && echo "enabled" || echo "disabled"
```

**Enable Steps (SMTP option)**:
```bash
# Configure SMTP instead of Resend
echo "MAIL_MAILER=smtp" >> /var/www/dixis/current/backend/.env
echo "MAIL_HOST=smtp.example.com" >> /var/www/dixis/current/backend/.env
echo "MAIL_PORT=587" >> /var/www/dixis/current/backend/.env
echo "MAIL_USERNAME=your-username" >> /var/www/dixis/current/backend/.env
echo "MAIL_PASSWORD=your-password" >> /var/www/dixis/current/backend/.env
echo "EMAIL_NOTIFICATIONS_ENABLED=true" >> /var/www/dixis/current/backend/.env
```

---

## Production Deploy (deploy-frontend.yml)

| Secret Name | Purpose | Where Used |
|-------------|---------|------------|
| `VPS_HOST` | VPS hostname/IP | deploy-frontend.yml:80 |
| `VPS_USER` | SSH username | deploy-frontend.yml:81 |
| `VPS_SSH_KEY` | SSH private key | deploy-frontend.yml:82 |
| `DATABASE_URL_PROD` | Neon PostgreSQL connection | deploy-frontend.yml:233 |
| `RESEND_API_KEY` | Resend email service key | deploy-frontend.yml:234 |

**Status**: All required secrets present (deploy works).

---

## Staging Deploy (deploy-staging.yml)

| Secret Name | Purpose | Where Used |
|-------------|---------|------------|
| `STAGING_HOST` | Staging server hostname | deploy-staging.yml:38 |
| `STAGING_USER` | SSH username for staging | deploy-staging.yml:39 |
| `STAGING_PATH` | Deploy path on staging | deploy-staging.yml:40 |
| `SSH_PRIVATE_KEY` | SSH key for staging | deploy-staging.yml:72 |
| `KNOWN_HOSTS` | SSH host verification | deploy-staging.yml:73 |
| `DATABASE_URL_STAGING` | Staging database connection | staging-migration.yml |

**Status**: Not configured (staging is manual-only per Pass 45).

---

## CI Workflows (No External Secrets)

These workflows use only `GITHUB_TOKEN` (auto-provided):
- `uptime-monitor.yml` - Creates issues on failure
- `labeler.yml` - Auto-labels PRs
- `danger.yml` / `dangerjs.yml` - PR checks
- `policy-gate.yml` - Policy enforcement
- `os-state-capsule.yml` - State tracking

---

## How to Add Secrets (GitHub UI)

1. Go to: `https://github.com/lomendor/Project-Dixis/settings/secrets/actions`
2. Click "New repository secret"
3. Enter secret **name** (e.g., `STRIPE_SECRET_KEY`)
4. Paste secret **value** (from Stripe dashboard, etc.)
5. Click "Add secret"

For environment-scoped secrets:
1. Go to: `https://github.com/lomendor/Project-Dixis/settings/environments`
2. Select or create environment (e.g., `production`)
3. Add secrets under "Environment secrets"

---

## Security Notes

- NEVER print secret values in CI logs
- Use presence checks only (`-n "$SECRET"` or `grep -q`)
- Rotate secrets if exposed (see `docs/AGENT/SOPs/SOP-SEC-ROTATION.md`)
- All workflows should skip gracefully if optional secrets missing
