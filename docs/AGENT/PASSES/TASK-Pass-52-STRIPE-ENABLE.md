# Pass 52: Stripe Enable

**Status**: READY FOR CREDENTIALS
**Created**: 2026-01-17

## Goal

Enable card payments via Stripe. Add health/diagnostic endpoint to confirm Stripe is configured.

## Scope

Minimal code change: Add payment status to `/api/health` and `/api/healthz` endpoints. All Stripe wiring was already implemented in Pass 51.

## Definition of Done

- [x] Audit existing Stripe code and env wiring
- [x] Confirm Pass 51 implementation is complete
- [x] Add payment configuration status to health endpoints
- [x] Add CI-safe tests for health endpoint changes
- [x] Create documentation (TASKS + SUMMARY)
- [x] PR merged

## Implementation Summary

### Finding: Pass 51 Already Complete

The Stripe integration was fully implemented in Pass 51:

| Component | Status | Location |
|-----------|--------|----------|
| Backend config | Complete | `config/payments.php` |
| PaymentCheckoutController | Complete | `app/Http/Controllers/Api/V1/PaymentCheckoutController.php` |
| StripeWebhookController | Complete | `app/Http/Controllers/Api/V1/StripeWebhookController.php` |
| Frontend PaymentMethodSelector | Complete | `src/components/checkout/PaymentMethodSelector.tsx` |
| Frontend StripeProvider | Complete | `src/components/payment/StripeProvider.tsx` |
| E2E Tests | Complete | `tests/e2e/pass-51-payments.spec.ts` |

### Code Changes

Added payment configuration status to `/api/health` and `/api/healthz` endpoints:

```json
{
  "status": "ok",
  "database": "connected",
  "payments": {
    "cod": "enabled",
    "card": {
      "flag": "disabled",
      "stripe_configured": false,
      "keys_present": {
        "secret": false,
        "public": false,
        "webhook": false
      }
    }
  },
  "timestamp": "2026-01-17T10:00:00.000Z",
  "version": "11.45.2"
}
```

### Tests Added

- `test_health_endpoint_includes_payments_status()` - Verifies payment structure in response
- `test_healthz_endpoint_includes_payments_status()` - Verifies healthz also includes payments

---

## Operator Steps (VPS Enablement)

### Prerequisites

1. Stripe account with API keys (test or live)
2. SSH access to VPS: `ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235`

### Step 1: Add Backend Credentials

```bash
# SSH to VPS
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# Add Stripe keys to backend .env
cat >> /var/www/dixis/current/backend/.env << 'EOF'
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
PAYMENTS_CARD_FLAG=true
EOF
```

### Step 2: Add Frontend Credentials

```bash
# Add frontend env vars
cat >> /var/www/dixis/current/frontend/.env << 'EOF'
NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
EOF
```

### Step 3: Restart Services

```bash
# Restart backend (clears config cache)
sudo systemctl restart dixis-backend.service

# Rebuild and restart frontend (Next.js needs rebuild for env vars)
cd /var/www/dixis/current/frontend
npm run build
pm2 restart dixis-frontend
```

### Step 4: Validate

```bash
# 1. Check health endpoint shows Stripe configured
curl -s https://dixis.gr/api/healthz | jq '.payments'

# Expected output (when enabled):
# {
#   "cod": "enabled",
#   "card": {
#     "flag": "enabled",
#     "stripe_configured": true,
#     "keys_present": {
#       "secret": true,
#       "public": true,
#       "webhook": true
#     }
#   }
# }

# 2. Check card option appears in checkout (requires login)
# Navigate to https://dixis.gr/checkout - "Κάρτα" option should appear

# 3. Test with Stripe test card: 4242 4242 4242 4242
```

### Rollback (if needed)

```bash
# Remove card flag to disable
sed -i '/PAYMENTS_CARD_FLAG/d' /var/www/dixis/current/backend/.env
sed -i '/NEXT_PUBLIC_PAYMENTS_CARD_FLAG/d' /var/www/dixis/current/frontend/.env

# Restart services
sudo systemctl restart dixis-backend.service
cd /var/www/dixis/current/frontend && npm run build && pm2 restart dixis-frontend
```

---

## Required Credentials

| Env Var | Format | Location |
|---------|--------|----------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | VPS backend/.env |
| `STRIPE_PUBLIC_KEY` | `pk_test_...` or `pk_live_...` | VPS backend/.env |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | VPS backend/.env |
| `PAYMENTS_CARD_FLAG` | `true` | VPS backend/.env |
| `NEXT_PUBLIC_PAYMENTS_CARD_FLAG` | `true` | VPS frontend/.env |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | VPS frontend/.env |

See `docs/OPS/CREDENTIALS.md` for complete reference.

---

## Notes

- Card payments are auth-gated: only authenticated users see the card option
- Use test keys (`sk_test_`, `pk_test_`) first to validate end-to-end
- Webhook endpoint: `POST /api/v1/webhooks/stripe`
