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
