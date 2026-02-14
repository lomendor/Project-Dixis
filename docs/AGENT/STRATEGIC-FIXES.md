# Strategic Fixes — Priority Queue

> Created: 2026-02-14 after full codebase audit
> Purpose: Track critical improvements in priority order
> Rule: One PR at a time, ≤300 LOC each

---

## PHASE 1 — Revenue Protection (THIS WEEK)

### 1A. Checkout Hardening: Idempotency + Shipping Validation
**Why**: Double orders possible if user clicks twice. Silent checkout if shipping API fails.
**Files**: `src/lib/api.ts` (createOrder), `src/app/(storefront)/checkout/page.tsx`
**Changes**:
- Add `X-Idempotency-Key` (uuid per checkout attempt) to `createOrder()`
- Add visible error toast when both shipping APIs fail (lines 169-196)
- Disable "Place Order" button when `shippingQuote === null && !shippingLoading`
**LOC estimate**: ~40
**Status**: [ ] Not started

### 1B. Checkout Refactor: Split 766-line monolith
**Why**: Single largest risk file. Every change risks breaking checkout.
**Files**: `src/app/(storefront)/checkout/page.tsx` → split into:
- `CheckoutForm.tsx` (customer details form)
- `ShippingSection.tsx` (postal code + shipping quote logic)
- `PaymentSection.tsx` (COD/Card selection + Stripe)
- `OrderSummary.tsx` (totals, items, shipping breakdown)
- `checkout/page.tsx` (orchestrator, ~100 LOC)
**LOC estimate**: ~0 net (refactor, not new code)
**Status**: [ ] Not started

---

## PHASE 2 — Security (NEXT WEEK)

### 2A. Auth Token: localStorage → HttpOnly Cookie
**Why**: XSS can steal tokens from localStorage. HttpOnly cookies are JS-inaccessible.
**Files**: `src/lib/api.ts` (token storage), backend Laravel CORS + Sanctum config
**Changes**:
- Frontend: Remove localStorage token, use `credentials: 'include'` on fetch
- Backend: Configure Sanctum SPA authentication with cookie-based sessions
- Update CORS to allow credentials from dixis.gr
**LOC estimate**: ~80 frontend + backend changes
**Status**: [ ] Not started
**Note**: Requires backend coordination — Laravel Sanctum SPA mode

### 2B. Middleware Auth for Protected Routes
**Why**: Currently only `/ops/*` has middleware. Producer/admin pages rely on client-side AuthGuard.
**Files**: `src/middleware.ts`
**Changes**:
- Add matcher for `/producer/:path*`, `/admin/:path*`, `/account/:path*`
- Check auth cookie (after 2A) and redirect to login if missing
**LOC estimate**: ~30
**Status**: [ ] Not started
**Depends on**: 2A (needs cookie-based auth first)

---

## PHASE 3 — Reliability (WEEK 3)

### 3A. API Request Timeouts
**Why**: No API call has a timeout. If backend hangs, user sees spinner forever.
**Files**: `src/lib/api.ts` (request method)
**Changes**:
- Add `AbortController` with 10s timeout to `request()` method
- Show "Request timed out" toast on timeout
- Add retry (1x) for idempotent GET requests
**LOC estimate**: ~25
**Status**: [ ] Not started

### 3B. Console Cleanup
**Why**: 244 console statements leak debug info to users.
**Files**: All `src/**/*.ts` and `src/**/*.tsx`
**Changes**:
- Replace `console.error` in critical paths with Sentry.captureException
- Remove `console.log` and `console.warn` from production paths
- Keep ONLY in development-gated blocks: `if (process.env.NODE_ENV === 'development')`
**LOC estimate**: ~200 (deletions mostly)
**Status**: [ ] Not started

### 3C. Sentry Business Events
**Why**: We have Sentry but only for crashes. We need business metrics.
**Files**: `src/lib/analytics.ts` (new), checkout, cart
**Changes**:
- Track: checkout_started, checkout_completed, checkout_failed
- Track: shipping_quote_failed, shipping_quote_null
- Track: cart_multi_producer_blocked
- Track: order_creation_failed (with error code)
**LOC estimate**: ~60
**Status**: [ ] Not started

---

## PHASE 4 — Technical Debt (BACKLOG)

### 4A. Zod Schema Validation for API Responses
- All `apiClient.request<T>()` calls trust backend blindly
- Add Zod schemas for Order, Product, Producer, ShippingQuote
- Validate response before returning

### 4B. Cart Sync Race Condition Fix
- Add debounce/lock to cart sync in AuthContext
- Prevent add-to-cart during sync-in-flight

### 4C. Prisma Schema Cleanup
- Remove duplicate fields (total vs total_amount on Order)
- Sync with Laravel schema

### 4D. E2E Tests for Checkout Edge Cases
- Multi-producer cart → error message displayed
- Shipping API failure → visible error
- Double-click submit → single order
- Network timeout → graceful error

---

## Completion Log

| Date | Fix | PR | Notes |
|------|-----|-----|-------|
| 2026-02-14 | Audit completed | — | Identified 4 critical, 3 structural issues |
| | | | |
