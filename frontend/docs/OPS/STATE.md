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
