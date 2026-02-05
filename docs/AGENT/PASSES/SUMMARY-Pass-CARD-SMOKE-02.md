# Pass CARD-SMOKE-02: Card Payment E2E Smoke on Production

**Date**: 2026-02-06
**Status**: DONE
**Branch**: `pass/card-smoke-02`

---

## Goal

Unblock and verify the full Stripe card payment E2E flow on production (TEST mode, no real charges).

Previous pass (PAYMENTS-CARD-REAL-01) got 3/4 tests passing; the Stripe Elements test was SKIPPED because `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` was not baked into the production build.

---

## What Was Done

### Production Environment Fixes (VPS)

1. **Created `frontend/.env`** on VPS with all required vars:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_*`
   - `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true`
   - `INTERNAL_API_URL=https://dixis.gr/api/v1` (SSR server-to-server)
   - Plus DATABASE_URL, RESEND_API_KEY, etc.

2. **Rebuilt frontend** (`npm run build`) to bake `NEXT_PUBLIC_*` vars into client bundle

3. **Fixed PM2 crash loop** — old Next.js process held port 3000, causing EADDRINUSE. Fix: `fuser -k 3000/tcp` before restart.

4. **Fixed SSR demo fallback** — Products page was showing demo data (`demo-1`, `demo-2`) because SSR couldn't reach the backend API. Root cause: missing `INTERNAL_API_URL`. Node.js fetch with relative `/api/v1` URL fails server-side.

### E2E Test Fixes (102 LOC)

1. **URL regex**: Changed `/\/products\/\d+/` to `/\/products\/[^/]+/` (production uses slugs, not just numeric IDs)

2. **In-stock product selection**: Added `beforeAll` API call to find a product with `stock > 0` via `/api/v1/public/products`. Tests navigate directly to `/products/{id}` instead of clicking first card (which could be OOS).

3. **UI fallback**: If API unavailable, falls back to clicking product cards that don't show "Εξαντλήθηκε" (Out of Stock).

---

## Test Results

```
Running 4 tests using 1 worker

  4 passed (1.3m)

  1. UI login with real credentials          PASSED
  2. Add product to cart and reach checkout   PASSED
  3. Card payment option visible              PASSED (COD: true, Card: true)
  4. Stripe Elements card payment flow        PASSED
     - Order creation: 201
     - Payment init: 200 (client_secret present)
     - Stripe Elements iframe: loaded
     - Card 4242...4242 entered via PaymentElement
```

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/tests/e2e/card-payment-real-auth.spec.ts` | +62 -40 (102 LOC) |

---

## Production Config Added (VPS only, not in repo)

| File | What |
|------|------|
| `/var/www/dixis/current/frontend/.env` | Created with all NEXT_PUBLIC vars + INTERNAL_API_URL |

---

## Key Lessons

1. `NEXT_PUBLIC_*` vars must exist at **build time** for Next.js to inline them
2. `INTERNAL_API_URL` must be set for SSR to reach the backend (relative URLs fail in Node.js)
3. PM2 restart after rebuild: always `fuser -k PORT/tcp` first to avoid EADDRINUSE crash loops
4. Products page falls back to demo data silently when API fetch fails — monitor for this
