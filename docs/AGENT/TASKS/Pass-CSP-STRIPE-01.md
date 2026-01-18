# Pass CSP-STRIPE-01: Fix CSP for Stripe Elements

**Status**: CLOSED
**Created**: 2026-01-18
**Closed**: 2026-01-18

## Problem

Stripe Elements iframe was not rendering on the checkout page due to Content-Security-Policy (CSP) blocking Stripe's domains.

### Root Cause

The CSP header in `frontend/next.config.ts` was missing:
- `frame-src` directive (iframes fell back to `default-src 'self'`)
- Stripe domains in `script-src` and `connect-src`

### Diagnosis

```bash
curl -sI "https://dixis.gr/checkout" | grep -i content-security-policy
# Missing: frame-src, js.stripe.com, api.stripe.com
```

## Solution

Updated CSP in `frontend/next.config.ts` to add minimal Stripe allowlist:

```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
"connect-src 'self' ... https://api.stripe.com https://r.stripe.com",
"frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
```

## Verification

1. CSP header now includes Stripe domains:
   ```bash
   curl -sI "https://dixis.gr/checkout" | grep -i content-security-policy
   # frame-src 'self' https://js.stripe.com https://hooks.stripe.com
   ```

2. E2E test passes:
   - Order creation: 201 ✅
   - Payment init: 200, client_secret: true ✅
   - Stripe iframe visible: ✅
   - Test result: PASSED ✅

## PR

- #2304 - fix: add Stripe domains to CSP for Elements support

## Related

- Pass PAYMENTS-STRIPE-ELEMENTS-01 (Stripe Elements integration)
- Pass STRIPE-E2E-TIMEOUT-01 (E2E test improvements)
