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
**Status**: [x] PR #2851 — also added ApiError class (fixed dead error handling code)

### 1B. Checkout Refactor: Split 766-line monolith
**Why**: Single largest risk file. Every change risks breaking checkout.
**Files**: `src/app/(storefront)/checkout/page.tsx` → split into:
- `types.ts` (shared type definitions, 32 LOC)
- `useCheckout.ts` (state + business logic hook, 282 LOC)
- `OrderSummary.tsx` (cart items + totals display, 95 LOC)
- `CustomerDetailsForm.tsx` (address form fields + postal code, 166 LOC)
- `checkout/page.tsx` (orchestrator, 200 LOC)
**Result**: page.tsx 777 → 200 lines (74% reduction)
**Status**: [x] PR #2852

---

## PHASE 2 — Security (NEXT WEEK)

### 2A. Auth Token: localStorage → HttpOnly Cookie
**Why**: XSS can steal tokens from localStorage. HttpOnly cookies are JS-inaccessible.
**Files**: `src/lib/api.ts` (token storage), backend Laravel CORS + Sanctum config
**Changes**:
- Backend: EnsureFrontendRequestsAreStateful middleware, Auth::login() in login/register, session invalidation on logout
- Frontend: fetchCsrfCookie() before auth, XSRF header on all requests, simplified initAuth
- Dual-mode: Both Bearer tokens and session cookies work simultaneously
**LOC estimate**: ~74 (18 backend + 56 frontend)
**Status**: [x] PR #2867 (backend) + PR #2868 (frontend) — dual-mode auth migration
**Note**: PR 3 (remove localStorage entirely) deferred until production validation

### 2B. Middleware Auth for Protected Routes
**Why**: Previously only `/ops/*` had middleware. Producer/admin pages relied on client-side AuthGuard.
**Files**: `middleware.ts` (root — merged with canonical redirect + API protection)
**Changes**:
- Check `dixis_session`/`mock_session` cookie for `/producer`, `/admin`, `/account`, `/ops`
- Redirect to `/auth/login?redirect=...` if no session cookie
- Login page reads `?redirect` param and redirects back after auth
**LOC estimate**: ~30
**Status**: [x] PRs #2873, #2874, #2876 — deployed 2026-02-15
**Note**: Root cause of initial deploy failure: Next.js ignores `src/middleware.ts` when `middleware.ts` exists at project root

---

## PHASE 3 — Reliability (WEEK 3)

### 3A. API Request Timeouts
**Why**: No API call has a timeout. If backend hangs, user sees spinner forever.
**Files**: `src/lib/api.ts` (request method)
**Changes**:
- Add `AbortController` with 15s timeout to `request()` method
- Catch AbortError → throw ApiError with code=REQUEST_TIMEOUT and Greek message
- Respects caller-provided signal (skip timeout if caller manages abort)
**LOC estimate**: ~25
**Status**: [x] PR #2855

### 3B. Console Cleanup
**Why**: 244 console statements leak debug info to users.
**Files**: All `src/**/*.ts` and `src/**/*.tsx`
**Changes**:
- Replace `console.error` in critical paths with Sentry.captureException
- Remove `console.log` and `console.warn` from production paths
- Keep ONLY in development-gated blocks: `if (process.env.NODE_ENV === 'development')`
**LOC estimate**: ~200 (deletions mostly)
**Status**: [x] PR #2863 — removed ~90 client-side console statements across 43 files (199 LOC)

### 3C. Sentry Business Events
**Why**: We have Sentry but only for crashes. We need business metrics.
**Files**: `src/lib/analytics.ts` (new), checkout, cart
**Changes**:
- Track: checkout_started, checkout_completed, checkout_failed
- Track: shipping_quote_failed, shipping_quote_null
- Track: cart_multi_producer_blocked
- Track: order_creation_failed (with error code)
**LOC estimate**: ~60
**Status**: [x] PR #2865 — sentry-events.ts (95 LOC) + useCheckout instrumentation (38 LOC)

---

## PHASE 4 — Technical Debt (BACKLOG)

### 4A. Zod Schema Validation for API Responses
- All `apiClient.request<T>()` calls trust backend blindly
- Add Zod schemas for Order, Product, Producer, ShippingQuote
- Validate response before returning
**Status**: [x] PR #2883 — 12 endpoints validated, non-blocking (Sentry-logged)

### 4B. Cart Sync Race Condition Fix
- Add debounce/lock to cart sync in AuthContext
- Prevent add-to-cart during sync-in-flight
**Status**: [x] PR #2890 — version-counter optimistic lock, mergeServerCart (zero UI disruption)

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
| 2026-02-14 | 1A: Checkout Hardening | PR #2851 | ApiError class, idempotency, shipping validation |
| 2026-02-14 | 1B: Checkout Refactor | PR #2854 | page.tsx 777→200 LOC, extracted hook+components |
| 2026-02-14 | 3A: API Timeouts | PR #2855 | 15s AbortController on all API requests |
| 2026-02-14 | CI: PWA Icons | PR #2858 | apple-touch-icon + PWA icons fix 404s |
| 2026-02-14 | CI: E2E Stabilization | PR #2860 | auth-nav mock APIs + smoke filter → ALL CI GREEN |
| 2026-02-14 | 3B: Console Cleanup | PR #2863 | removed ~90 client-side console.* across 43 files |
| 2026-02-14 | 3C: Sentry Business Events | PR #2865 | 6 business events in checkout (breadcrumbs + captureMessage) |
| 2026-02-14 | 2A: Auth Token Migration (BE) | PR #2867 | Sanctum SPA mode, Auth::login, session invalidation (18 LOC) |
| 2026-02-14 | 2A: Auth Token Migration (FE) | PR #2868 | CSRF cookie fetch, XSRF header, simplified initAuth (56 LOC) |
| 2026-02-15 | V1 Docs Reality Sync | PR #2872 | PRD-MUST-V1, PRD-AUDIT updated: all blockers resolved |
| 2026-02-15 | 2B: Middleware Auth | PRs #2873-#2876 | Cookie-based auth for /producer, /admin, /account, /ops |
| 2026-02-15 | Greek UI Polish | PRs #2879, #2881 | SkipLink + Email labels hellenized, /producers public fix |
| 2026-02-15 | 4A: Zod API Validation | PR #2883 | 12 endpoints validated, non-blocking Sentry logging |
| 2026-02-15 | UI: Favicon + Logo | PRs #2885-#2887 | Correct Dixis logo for favicon, header, all PWA icons |
| 2026-02-15 | UI: Minimal Header | PR #2885 | Remove Επικοινωνία from header nav (footer only) |
| 2026-02-15 | 4B: Cart Sync Race | PR #2890 | Version-counter merge prevents item loss during login sync |
| 2026-02-15 | OG/SEO Logo Fix | PR #2892 | logo.svg→logo.png in OG/JSON-LD, delete dead SVGs |
| 2026-02-15 | Product Detail Polish | PR #2893 | Brand colors, chevron breadcrumb, inline price+stock |
| 2026-02-15 | Brand Color Unify | PR #2896 | gray→neutral, emerald/blue→primary across 9 storefront files |
| 2026-02-15 | Brand Color Unify R2 | PR #2899 | Homepage, Add-to-Cart, loading skeletons → brand tokens |
| 2026-02-15 | Brand Color Unify R3 | PR #2901 | Navigation, CategoryStrip, ProductCard, PaymentSelector, ProducerCard |
| | | | |
