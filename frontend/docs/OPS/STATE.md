# Project State

$(head -1607 docs/OPS/STATE.md)

## Pass 174R.3 — Wire totals into API routes ✅
**Date**: 2025-10-13
- Created frontend/src/lib/cart/totals-wire.ts adapter for flexible input mapping
- Discovery: Checkout route already has totals (Pass 174Q), admin orders is summary-only
- No route patches needed - wire adapter + tests only
- Created frontend/tests/checkout/totals-wire.spec.ts with 4 E2E tests
- PR #540: MERGED successfully with 17/17 checks passing

## Pass 176 — Storefront /products (EL-first) + idempotent seed + e2e ✅
**Date**: 2025-10-14
- Created /products page with Greek-first UI (search, filters, grid layout)
- Made seed idempotent (deleteMany before create)
- Created E2E tests: products list load + search filter
- Fixed Next.js 15 async searchParams requirement

## Pass UX-EL01 — i18n baseline (EL/EN) + Home baseURL fix ✅
**Date**: 2025-10-14
- Nested i18n messages (EL/EN): nav, home, common
- Home.tsx dynamic baseURL με headers() + ENV fallback
- Dev server σταθερός στο :3000 (HOME/API 200)

## Pass UX-EL02 — i18n completeness + hydration guard + /products (minimal) + smoke tests ✅
**Date**: 2025-10-14
- Συμπληρώθηκαν EL/EN messages (nested)
- Προστέθηκε suppressHydrationWarning στο body
- Μίνι /products λίστα από /api/public/products
- Smoke tests: hydration/i18n + API JSON

## Pass UI-FIX-02s — i18n unify (safe) + api base + sanity tests ✅
**Date**: 2025-10-14
- Unified messages in nested JSON (frontend/messages/el.json)
- Created safe t() wrapper (frontend/src/lib/i18n/t.ts) - does NOT replace next-intl
- Added apiBase() helper for stable URLs (frontend/src/lib/http/apiBase.ts)
- Normalized .env.example to port 3000
- Created 2 sanity tests: Home + Products (console error detection)

## Pass STORE-01 — Minimal /products storefront (EL) + grid sanity test ✅
**Date**: 2025-10-14
- Simplified /products page: clean grid layout, no heavy filters
- Uses apiUrl() helper for stable API endpoints
- Added products.* i18n keys (title, empty, note)
- Created products.grid.spec.ts sanity test (console error detection)
- SSR-safe implementation with next-intl getTranslations

## Pass STORE-02 — Filters + URL state + Pagination (SSR-only) ✅
**Date**: 2025-10-14
- Added lightweight filters to /products: q, category, min, max, stock=in
- SSR-only implementation (no Client Components, state in URL only)
- Created frontend/src/lib/search/params.ts (ProductFilters type + parse/toQuery helpers)
- Updated /products page with filters form and pagination controls
- Pagination: ?page=1&per_page=20 (default 20 items per page)
- EL-first labels in nested JSON (products.filters.*, products.pagination.*)
- Created 2 E2E tests: products.filters.spec.ts + products.pagination.spec.ts
- No backend changes, graceful handling if API ignores params

## Pass STORE-03A — i18n completeness + SSR/Hydration stability ✅
**Date**: 2025-10-14
- Added missing i18n keys: common.submit, common.cancel, nav.producers
- Ensured all i18n messages use nested JSON structure (no flat keys with dots)
- Added suppressHydrationWarning to layout.tsx html and body elements for SSR stability
- Simplified Home.tsx API fetch to use apiUrl() helper instead of complex header logic
- Created frontend/tests/i18n/i18n-loader.spec.ts unit test verifying nested structure
- Verified no Date.now() or Math.random() in SSR branches for deterministic rendering

## Pass STORE-03B — Complete EL i18n + smoke tests ✅
**Date**: 2025-10-15
- Verified el.json has complete nested structure for Home & Products pages
- Confirmed all i18n bindings use next-intl t() throughout Home.tsx and products page
- Created smoke test: frontend/tests/storefront/home-products.spec.ts
  - Test 1: Home page verifies Greek hero title (home.title) and no hydration errors
  - Test 2: Products page verifies Greek filter labels and console clean
- Build passed successfully with Next.js 15.5.0
- No MISSING_MESSAGE or INVALID_KEY errors in i18n implementation

## Pass STORE-04 — Products polish + Product page + E2E ✅
**Date**: 2025-10-15
- Polished /products page: enhanced card layout with images, stock badges, hover effects
- Added product.* i18n keys (price, stock, inStock, outOfStock, producer, description, addToCart, backToProducts)
- Polished /products/[id] page: breadcrumb, image, price, stock status, description, back link
- All Greek labels (EL-first): Τιμή, Απόθεμα, Διαθέσιμο, Επιστροφή στα προϊόντα
- Created 2 E2E tests: products-grid.spec.ts, product-page.spec.ts
- Build passed successfully with Next.js 15.5.0
- No business logic changes, UI/i18n/tests only

## Pass STORE-05 — Minimal Cart & Checkout (EL-first) ✅
**Date**: 2025-10-15
- Enhanced cart/store.ts with shippingMethod state (PICKUP|COURIER|COURIER_COD) + localStorage persistence
- Polished /cart page: shipping selector, totals with calcTotals helper (subtotal, shipping, COD fee, tax, grand total)
- Updated /checkout page: uses cart shipping method, redirects to /order/[id], full i18n
- Created /order/[id] confirmation page with success message and order ID display
- Updated Add button: i18n, success feedback with role=status
- Added i18n keys: cart.*, checkout.*, shipping.*, common.back/continue
- No schema changes, no new dependencies (React Context + localStorage only)
- Build passed successfully with Next.js 15.5.0 (cart: dynamic route, checkout: Suspense wrapper)
- No backend/business logic changes, UI/state/i18n only

## Pass STORE-05.1 — PR Hygiene + Lightweight E2E ✅
**Date**: 2025-10-15
- PR #552: added Summary/AC/Test Plan/Reports (Danger compliance)
- Created 2 lightweight E2E tests (no DB dependency, localStorage preseed):
  - cart-persist.spec.ts: verifies cart state persistence and Greek totals display
  - checkout-validate.spec.ts: verifies EL-first labels and form structure
- Created docs/AGENT/SUMMARY/Pass-STORE-05.1.md for QA hygiene documentation
- No business logic changes, QA hygiene only

## Pass SMOKE-TRIAGE-552 — Fix Smoke Tests DATABASE_URL mismatch ✅
**Date**: 2025-10-15
- Root cause: Prisma migrations failed due to DATABASE_URL using `dixis:dixis_dev_pass@localhost:5432/dixis_dev` while PostgreSQL service only creates `postgres:postgres@127.0.0.1:5432/dixis`
- Fixed 3 DATABASE_URL references in .github/workflows/pr.yml to match service config
- No application code changes, CI infrastructure fix only
