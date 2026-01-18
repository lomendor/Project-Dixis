# Pass ENV-FRONTEND-PAYMENTS-01: Frontend VPS Env for Card Payments

**Created**: 2026-01-18

## Objective

Configure VPS frontend environment with required Stripe variables to enable card payment option in checkout.

## Background

Pass CARD-PAYMENT-SMOKE-01 identified that the frontend VPS `.env` was missing:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_PAYMENTS_CARD_FLAG`

The deploy workflow already sets `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true` at build time, but the Stripe publishable key needs to be in the VPS `.env` for runtime access and for the deploy precheck to pass.

## Definition of Done

- [x] Frontend VPS `.env` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [x] Frontend VPS `.env` has `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true` set
- [x] Deploy workflow completes successfully
- [x] Production healthz reports `card.flag: enabled` and `stripe_configured: true`
- [x] Documentation created for audit trail

## Actions Taken

1. **Discovered frontend env location**: `/var/www/dixis/current/frontend/.env`
2. **Fixed permission blocker**: Removed `node_modules/.cache/jiti` (owned by root, blocking rsync)
3. **Recreated `.env` file**: Previous deploy's rsync `--delete` had removed it
4. **Added Stripe vars**:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (copied from backend's `STRIPE_PUBLIC_KEY`)
   - `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true`
5. **Triggered redeploy**: Manual workflow dispatch after env file restoration
6. **Verified**: Production healthz confirms card payments enabled

## Evidence

### Health Endpoint Verification (2026-01-18)

```json
{
  "payments": {
    "cod": "enabled",
    "card": {
      "flag": "enabled",
      "stripe_configured": true,
      "keys_present": {
        "secret": true,
        "public": true,
        "webhook": true
      }
    }
  }
}
```

### E2E Smoke Test Results

```
Running 3 tests using 1 worker
Stripe config status: {
  flag: 'enabled',
  configured: true,
  keys_present: { secret: 'yes', public: 'yes', webhook: 'yes' }
}
  2 skipped
  1 passed (34.2s)
```

### PM2 Status (post-deploy)

```
restarts: 0
uptime: 2m
created at: 2026-01-17T23:16:04.632Z
```

## Files Changed

- `docs/AGENT/TASKS/Pass-ENV-FRONTEND-PAYMENTS-01.md` (new)
- `docs/AGENT/SUMMARY/Pass-ENV-FRONTEND-PAYMENTS-01.md` (new)
- `docs/OPS/STATE.md` (updated)
- `docs/NEXT-7D.md` (updated)

## VPS Changes (not in git)

- `/var/www/dixis/current/frontend/.env` - added Stripe env vars

## References

- Prerequisite: Pass CARD-PAYMENT-SMOKE-01 (identified blocker)
- Deploy workflow: `.github/workflows/deploy-frontend.yml`
- PaymentMethodSelector: `frontend/src/components/checkout/PaymentMethodSelector.tsx`
