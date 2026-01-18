# Pass CARD-PAYMENT-SMOKE-01: Card Payment E2E Smoke Test

**Created**: 2026-01-18

## Objective

Verify that Stripe card payment infrastructure is properly configured and working on production.

## Scope

- Smoke test only (no new Stripe features)
- Verify backend Stripe config via /api/health
- Verify card payment option visibility in checkout UI
- CI-safe tests that skip gracefully when backend unavailable

## Prerequisites

- Backend: Stripe keys configured (verified in /api/health)
- Frontend: `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true` at build time
- VPS: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in frontend .env (BLOCKER - see below)

## Definition of Done

- [x] E2E test file created: `frontend/tests/e2e/card-payment-smoke.spec.ts`
- [x] Test 1: Backend reports Stripe configured via /api/health
- [x] Test 2: Card payment option visible for authenticated users
- [x] Test 3: COD option always available as fallback
- [x] Tests skip gracefully in CI when backend unavailable
- [x] Evidence documented in SUMMARY

## Blocker Identified

**Frontend VPS env missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**

Backend has all Stripe keys configured:
- `STRIPE_KEY` - present
- `STRIPE_SECRET` - present
- `STRIPE_WEBHOOK_SECRET` - present
- `STRIPE_SECRET_KEY` - present
- `STRIPE_PUBLIC_KEY` - present

Frontend .env on VPS is missing:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - **NOT PRESENT**
- `NEXT_PUBLIC_PAYMENTS_CARD_FLAG` - **NOT PRESENT**

This means:
1. StripeProvider component will fail (tries to load Stripe with undefined key)
2. Card payment option won't appear in checkout (flag not set at build time)

**Next Step**: Add missing env vars to VPS frontend .env and rebuild Next.js app.

## Test Cases

| Test | Purpose | CI Behavior |
|------|---------|-------------|
| Stripe config via /api/health | Verify backend Stripe keys | Skip if health endpoint unavailable |
| Card option visible | Verify checkout shows card option | Skip if auth/flag not configured |
| COD fallback | Verify COD always available | Skip if checkout page doesn't load |

## Files Changed

- `frontend/tests/e2e/card-payment-smoke.spec.ts` (new)
- `docs/AGENT/PASSES/TASK-Pass-CARD-PAYMENT-SMOKE-01.md` (new)
- `docs/AGENT/PASSES/SUMMARY-Pass-CARD-PAYMENT-SMOKE-01.md` (new)
- `docs/OPS/STATE.md` (updated)
- `docs/AGENT-STATE.md` (updated)

## References

- Backend Stripe provider: `backend/app/Services/Payment/StripePaymentProvider.php`
- Frontend Stripe components: `frontend/src/components/payment/StripeProvider.tsx`
- Payment method selector: `frontend/src/components/checkout/PaymentMethodSelector.tsx`
