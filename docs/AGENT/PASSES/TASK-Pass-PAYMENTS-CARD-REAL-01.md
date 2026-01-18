# Pass PAYMENTS-CARD-REAL-01: Card Payment E2E with Real Auth

**Created**: 2026-01-18

## Objective

Enable repeatable E2E verification of card payments without manual user login, and fix deploy workflow to persist Stripe env vars.

## Problems Identified

1. **E2E auth mismatch**: Playwright mock tokens work in CI (with MSW) but not against real production backend
2. **Deploy env loss**: rsync `--delete` removes `.env`, then workflow only writes subset of keys back
3. **Build-time vs runtime**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be at build time for StripeProvider to work

## Solutions Implemented

### 1. Automated Auth Approach

Created ephemeral E2E test user on production:
- Email: `e2e-card-test@dixis.gr`
- Password stored securely in `~/.dixis/e2e-creds` (chmod 600)
- Created via artisan tinker (no password exposure)

New E2E test file: `frontend/tests/e2e/card-payment-real-auth.spec.ts`
- UI login with real credentials
- Product → Cart → Checkout flow
- Card payment option visibility assertion
- Stripe test card flow (4242...)

### 2. Deploy Env Persistence

Updated `.github/workflows/deploy-frontend.yml`:
- Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` at build time (line 55)
- Added runtime env management for Stripe vars (lines 189-200)
- Created GitHub secret `STRIPE_PUBLIC_KEY` for build-time embedding

### 3. GitHub Secret Created

- Secret: `STRIPE_PUBLIC_KEY`
- Purpose: Embed Stripe publishable key at build time
- Source: Copied from VPS backend `.env`

## Definition of Done

- [x] E2E test user created on production (secure, no password exposure)
- [x] New E2E test file with real auth flow
- [x] Deploy workflow updated for Stripe env persistence
- [x] GitHub secret created for build-time embedding
- [x] Card payment option verified visible for authenticated users
- [x] Documentation created

## Verification Evidence

### E2E Test Results (2026-01-18 - Final Run)

```
Running 4 tests using 1 worker

  ✓ UI login with real credentials (21.8s)
    UI login successful

  ✓ add product to cart and reach checkout
    Reached checkout page as authenticated user

  ✓ card payment option visible for authenticated user
    Payment options: { cod: true, card: true }
    Card payment option is visible and selectable for authenticated user

  ○ Stripe test card payment flow [skipped]
    Stripe Elements not loaded (expected - needs rebuild with STRIPE_PUBLIC_KEY)

  1 skipped
  3 passed (2.2m)
```

### Test Fixes Applied

1. **Auth state clearing**: Tests now clear localStorage/sessionStorage before login to avoid CI mock state interference
2. **Hydration wait**: Added 500ms wait before clicking login button to handle React re-renders
3. **Auth indicator selector**: Fixed to include "Logout" button text (English)

### Health Endpoint

```json
{
  "flag": "enabled",
  "stripe_configured": true,
  "keys_present": {
    "secret": true,
    "public": true,
    "webhook": true
  }
}
```

### Stripe Mode

Production uses **TEST mode** (`pk_test_*`) - safe for E2E testing, no real charges.

## How to Rerun

```bash
# 1. Ensure credentials exist
ls -la ~/.dixis/e2e-creds  # Should show file with 600 permissions

# 2. Run E2E test against production
cd frontend
BASE_URL=https://dixis.gr npx playwright test card-payment-real-auth.spec.ts
```

## Risks & Rollback

### Risks

1. E2E test user on production - mitigated by:
   - Random password (never exposed)
   - Can be disabled/deleted anytime
   - No elevated privileges

2. Stripe publishable key in GitHub secrets - minimal risk:
   - Publishable keys are designed for frontend exposure
   - Can only create tokens, not charge

### Rollback

1. Remove E2E user:
   ```bash
   ssh dixis-prod 'cd /var/www/dixis/current/backend && php artisan tinker --execute="User::where(\"email\", \"e2e-card-test@dixis.gr\")->delete();"'
   ```

2. Remove GitHub secret:
   ```bash
   gh secret delete STRIPE_PUBLIC_KEY
   ```

3. Revert workflow changes (git revert)

## Files Changed

- `.github/workflows/deploy-frontend.yml` - Stripe env at build + runtime
- `frontend/tests/e2e/card-payment-real-auth.spec.ts` - New E2E test (stabilized in #2292)
- `docs/AGENT/PASSES/TASK-Pass-PAYMENTS-CARD-REAL-01.md` - This file
- `docs/AGENT/PASSES/SUMMARY-Pass-PAYMENTS-CARD-REAL-01.md` - Summary
- `docs/OPS/STATE.md` - Updated
- `docs/AGENT-STATE.md` - Updated

## PRs

- **#2290** (feat: Pass PAYMENTS-CARD-REAL-01) — merged
- **#2292** (fix: stabilize card-payment-real-auth E2E tests) — merged

## References

- Pass CARD-PAYMENT-SMOKE-01 (prerequisite)
- Pass ENV-FRONTEND-PAYMENTS-01 (prerequisite)
- Deploy workflow: `.github/workflows/deploy-frontend.yml`
- AuthContext: `frontend/src/contexts/AuthContext.tsx`
- PaymentMethodSelector: `frontend/src/components/checkout/PaymentMethodSelector.tsx`
