# Pass STRIPE-E2E-TIMEOUT-01 Summary

## One-liner
Made Stripe Elements E2E test deterministic by replacing blind waits with network interception.

## Changes

| File | Change |
|------|--------|
| `frontend/tests/e2e/card-payment-real-auth.spec.ts` | Replaced `waitForTimeout` with `waitForResponse` for order creation and payment init |

## Test Flow

1. Submit checkout form
2. Wait for order creation response (201)
3. Wait for payment init response (200)
4. Validate `client_secret` present
5. Wait for Stripe iframe (90s timeout)
6. Fill card details and submit

## Evidence

- Test passed: `1 passed (2.2m)`
- Order creation: 201 ✅
- Payment init: 200, client_secret: true ✅
- Stripe Elements loaded: ✅
