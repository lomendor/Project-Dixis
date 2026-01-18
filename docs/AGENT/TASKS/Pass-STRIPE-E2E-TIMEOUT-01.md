# Pass STRIPE-E2E-TIMEOUT-01: Make Stripe E2E Test Deterministic

**Status**: CLOSED
**Created**: 2026-01-18
**Closed**: 2026-01-18

## Problem

The Stripe Elements E2E test was flaky due to blind waits (`waitForTimeout`) that didn't account for network latency variations.

## Solution

Replaced blind waits with network response interception:

1. **Order creation**: Wait for POST `/api/v1/public/orders` response (expect 201)
2. **Payment init**: Wait for POST `/payments/orders/{id}/init` response (expect 200)
3. **Validate client_secret**: Assert response contains `payment.client_secret`
4. **Stripe iframe**: Wait with extended timeout (90s) after payment init succeeds

## Key Changes

```typescript
// Before: blind wait
await page.waitForTimeout(5000);

// After: network interception
const orderResponsePromise = page.waitForResponse(
  resp => resp.url().includes('/api/v1/public/orders') && resp.request().method() === 'POST',
  { timeout: 30000 }
);
// ... click submit ...
const orderResponse = await orderResponsePromise;
const orderStatus = orderResponse.status();
```

## Benefits

- Deterministic: waits for actual network events, not arbitrary timeouts
- Better diagnostics: logs status codes and response shapes on failure
- No secrets leaked: only logs presence of client_secret, not the value

## PR

- Part of test/stripe-e2e-timeout-01 branch

## Related

- Pass CSP-STRIPE-01 (CSP fix that unblocked this test)
- Pass PAYMENTS-STRIPE-ELEMENTS-01 (Stripe Elements integration)
