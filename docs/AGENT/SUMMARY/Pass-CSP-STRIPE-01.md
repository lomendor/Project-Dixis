# Pass CSP-STRIPE-01 Summary

## One-liner
Fixed CSP header blocking Stripe Elements iframe by adding Stripe domains to allowlist.

## Changes

| File | Change |
|------|--------|
| `frontend/next.config.ts` | Added Stripe domains to CSP: script-src, connect-src, frame-src |

## CSP Additions

- `script-src`: `https://js.stripe.com`
- `connect-src`: `https://api.stripe.com`, `https://r.stripe.com`
- `frame-src`: `https://js.stripe.com`, `https://hooks.stripe.com`

## Evidence

- PR #2304 merged
- Deploy run 21113924564 succeeded
- CSP header verified: `curl -sI "https://dixis.gr/checkout" | grep -i content-security-policy`
- E2E test passed: Stripe Elements card payment flow

## Artifacts

- Trace: `test-results/card-payment-real-auth-*/trace.zip`
