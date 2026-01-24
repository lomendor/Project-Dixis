# Pass CI-FLAKE-FILTERS-SEARCH-01: E2E Filters-Search Test Stabilization

**Date**: 2026-01-20
**PR**: #2344
**Commit**: d91bd969
**Status**: DONE

---

## Objective

Fix the flaky `filters-search.spec.ts` E2E test that was causing E2E (PostgreSQL) CI failures.

---

## Problem

The Greek text search test was failing intermittently in CI with:

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
waiting for navigation until "load"

> 36 |     await page.waitForURL(/\/products.*search=/i, { timeout: 15000 });
```

---

## Analysis

1. **ProductSearchInput component** (frontend/src/components/ProductSearchInput.tsx):
   - Uses 300ms debounce on input
   - Calls `router.push()` with `startTransition` and `{ scroll: false }`
   - This is Next.js **soft navigation** — URL changes without page load event

2. **Playwright behavior**:
   - `waitForURL()` listens for navigation events
   - Soft navigation doesn't fire these events
   - Test times out waiting for an event that never comes

---

## Solution

Replace navigation-dependent waits with deterministic signals:

1. **Remove `waitForURL()`** — expects events that don't fire
2. **Add `waitForResponse()`** — wait for products API as deterministic signal
3. **Use `expect.poll()`** — poll URL directly without needing navigation events
4. **Increase timeouts** — from 15s to 30s for CI buffer
5. **Increase debounce wait** — from 500ms to 600ms

---

## Changes

### frontend/tests/e2e/filters-search.spec.ts

**Greek search test** (lines 28-50):
- Added `waitForResponse()` for products API
- Replaced `waitForURL()` with `expect.poll()` for URL assertion
- Increased timeouts from 15s to 30s

**Nonsense search test** (lines 98-113):
- Applied same pattern for consistency

---

## Verification

```bash
# PR checks
gh pr checks 2344 --watch

# Results
E2E (PostgreSQL)    PASS    4m13s
build-and-test      PASS    2m12s
quality-gates       PASS    3m09s
```

---

## Lessons Learned

1. **Soft navigation** in Next.js (via `router.push` + `startTransition`) doesn't trigger Playwright's navigation detection
2. **Prefer API waits** over navigation waits for client-side routing
3. **Use `expect.poll()`** for URL assertions in SPA contexts

---

_Pass: CI-FLAKE-FILTERS-SEARCH-01 | Generated: 2026-01-20 | Author: Claude_
