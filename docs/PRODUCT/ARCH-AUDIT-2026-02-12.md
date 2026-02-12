# Architecture Audit — 2026-02-12

> **3 parallel agents scanned**: 82 API routes, 14 Prisma models, ~200 frontend files.
> This document is the permanent record. Findings are ranked by severity.

---

## Status Legend

- `OPEN` — Not yet addressed
- `FIXED` — Resolved (include PR #)
- `WONTFIX` — Accepted risk, documented why

---

## CRITICAL — Security Holes

| # | Finding | File(s) | Status |
|---|---------|---------|--------|
| C1 | `/api/admin/orders/export` — ZERO auth, exposes all orders as CSV | `api/admin/orders/export/route.ts` | FIXED PR #2783 |
| C2 | `/api/admin/orders/facets` — ZERO auth, exposes order aggregation | `api/admin/orders/facets/route.ts` | FIXED PR #2783 |
| C3 | `/api/ops/status` — ZERO auth, exposes hostname, PID, memory, DB latency, git commit | `api/ops/status/route.ts` | FIXED PR #2783 |
| C4 | `/dev-check` page — ZERO auth, exposes env config and API base URL | `app/dev-check/page.tsx` | FIXED PR #2783 |
| C5 | `/api/admin/orders/summary` — weak auth (`adminEnabled()` checks env var only, no user identity) | `api/admin/orders/summary/route.ts` | FIXED PR #2783 |
| C6 | `/api/admin/orders/[id]` GET — same weak `adminEnabled()` guard | `api/admin/orders/[id]/route.ts` | FIXED PR #2783 |

**Fix**: Add `requireAdmin()` to C1/C2/C5/C6. Block C3/C4 in production (`DIXIS_ENV=production` → 404).

---

## HIGH — Architecture Risks

| # | Finding | Details | Status |
|---|---------|---------|--------|
| H1 | Triple order model confusion | `prisma.Order` (intents, status, tracking) ≠ `prisma.CheckoutOrder` (admin summary, lookup) ≠ Laravel orders (admin list, payment). Admin sees different data per endpoint. | OPEN |
| H2 | 5 duplicate order tracking APIs | `/api/track/[token]`, `/api/orders/track/[token]`, `/api/orders/track`, `/api/orders/public/[token]`, `/api/public/track/[token]` — three different response shapes | FIXED PRs #2786 + #2788 (all 5 deleted, canonical = Laravel `/public/orders/track/{token}`) |
| H3 | 2 duplicate tracking pages | `/track/[token]` (uses Laravel API, correct) vs `/orders/track/[token]` (uses Prisma directly, stale) | FIXED PR #2788 (stale page deleted, email + confirmation links fixed to canonical `/track/`) |
| H4 | Legacy checkout flow still live | `/checkout/flow`, `/checkout/payment`, `/checkout/payment/success`, `/checkout/payment/failure`, `/checkout/confirmation` — inline styles, localStorage state. Real checkout is `/(storefront)/checkout` | FIXED PR #2786 |
| H5 | CSP hardcodes localhost | `src/lib/csp.ts:7` — `http://localhost:3200` in production CSP connect-src | FIXED PR #2789 (dead file deleted, real CSP in next.config.ts was already clean) |
| H6 | `/api/order-intents` — ZERO auth | Creates draft orders in Prisma without any authentication | FIXED PR #2786 (deleted) |

---

## MEDIUM — Data Consistency

| # | Finding | Details | Status |
|---|---------|---------|--------|
| M1 | Deprecated product routes still accessible | `/api/products` and `/api/products/[id]` — marked @deprecated but serve Prisma fallback when Laravel is slow/down | OPEN |
| M2 | Producer DELETE via Prisma doesn't sync Laravel | `api/admin/producers/[id]/route.ts` DELETE removes from Prisma only — ghost data in Laravel | OPEN |
| M3 | Category CRUD in both systems | Prisma `api/categories/[id]` can update categories independently of Laravel Category model | OPEN |
| M4 | Inconsistent Laravel URL resolution | Some routes use `getLaravelInternalUrl()`, others use `process.env.NEXT_PUBLIC_API_BASE_URL` | OPEN |
| M5 | Dev/test pages accessible in production | `/dev/notifications`, `/dev/brand`, `/dev/quote-demo`, `/test-error`, `/products-demo` — no auth | FIXED PR #2786 (deleted) |

---

## LOW — Cleanup Backlog

| # | Finding | Count | Status |
|---|---------|-------|--------|
| L1 | Dead components (never imported) | 17+ files | FIXED PR #2786 (16 deleted) |
| L2 | Dead lib files (never imported) | 10+ files | FIXED PR #2786 (6 deleted, 5 alive) |
| L3 | Dead API routes (no frontend callers) | 11 routes | FIXED PR #2786 (5 deleted, 2 kept for E2E) |
| L4 | 3 Prisma import paths for same singleton | `@/lib/db/client` (canonical), `@/lib/prisma` (9 files), `@/server/db/prisma` (4 files) | FIXED PR #2789 (all 10 files → `@/lib/db/client`, 2 shims deleted) |
| L5 | 2 rate-limiting implementations | `rate-limit.ts` (class-based) vs `rateLimit.ts` (token-bucket) | OPEN |
| L6 | 2 i18n systems coexist | next-intl `getTranslations()` vs custom `LocaleContext` `useTranslations()` | OPEN |
| L7 | 50+ console.log in production code | Including `console.log('Starting login process...', { email })` in auth/login | OPEN |
| L8 | 8+ files still using inline styles | After Tailwind conversions: track/page, checkout/flow, checkout/payment, products-demo, dev/brand, admin/shipping-test, my/error, global-error | OPEN |
| L9 | Redirect stub pages | `/login`→`/auth/login`, `/register`→`/auth/register`, `/product/[id]`→`/products/[id]` | FIXED PR #2786 (deleted) |
| L10 | Duplicate consumer order pages | `/orders` and `/account/orders` serve same audience with different implementations | OPEN |
| L11 | `@/lib/prismaSafe` deprecated shim | 0 callers, can be deleted | FIXED PR #2786 (deleted) |

---

## Positive Findings (What Works Correctly)

- **Product SSOT enforced** — zero Prisma product writes in production app code
- **PrismaClient singleton clean** — no rogue `new PrismaClient()` in app code (only in standalone scripts)
- **CI schema in sync** — `schema.ci.prisma` correctly mirrors main schema with SQLite adaptations
- **Cart state clean** — single Zustand store with persist, no conflicts
- **Auth context clean** — single AuthContext, consistent usage across consumer pages

---

## Recommended Fix Order

| Priority | Pass ID | What | LOC est. |
|----------|---------|------|----------|
| 1 (TODAY) | **AUTH-FIX-CRITICAL** | Add `requireAdmin()` to export/facets/summary/detail; block dev-check + ops/status in prod | ~50 |
| 2 | **DEAD-CODE-CLEANUP** | Delete 17 unused components + 10 unused libs + 11 dead API routes | ~200 (deletions) |
| 3 | **ORDER-CONSOLIDATE** | Remove 4/5 duplicate tracking APIs + duplicate tracking page + legacy checkout flow | ~300 (deletions) |
| 4 | **CSP-FIX** | Remove localhost from CSP, fix hardcoded URLs | ~20 |
| 5 | **PRISMA-IMPORT-UNIFY** | Consolidate all imports to `@/lib/db/client` | ~30 |

---

## Dead Components Inventory (L1)

For deletion in DEAD-CODE-CLEANUP pass:

```
src/components/CartSummary.tsx
src/components/cart/CartSummary.tsx
src/components/SEOHead.tsx
src/components/ToastSuccess.tsx
src/components/PrintButton.tsx
src/components/ShippingSummary.tsx
src/components/ProductDetailSkeleton.tsx
src/components/ProductImageFallback.tsx
src/components/ErrorFallback.tsx
src/components/cart/CartMiniPanel.tsx
src/components/cart/CartTotalsClient.tsx
src/components/cart/ProducerConflictModal.tsx
src/components/checkout/CheckoutSummary.tsx
src/components/checkout/CheckoutFlow.tsx
src/components/products/ProductsDiagOverlay.tsx
src/components/catalogue/ProductGrid.tsx
src/components/catalogue/ProductCard.tsx
```

## Dead Libs Inventory (L2)

```
src/lib/shipping-estimator.ts
src/lib/errors.ts
src/lib/currency.ts
src/lib/orderNumber.ts
src/lib/orderStore.ts
src/lib/debounce.ts
src/lib/devMailboxStore.ts
src/lib/testids.ts
src/lib/sentry.ts
src/lib/auth/helpers.ts
src/lib/prismaSafe.ts
```

---

_Generated by 3-agent parallel scan. Agents: db-scanner, api-scanner, frontend-scanner._
