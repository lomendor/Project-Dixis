# Pass CI-FLAKE-FILTERS-SEARCH-01: E2E Filters-Search Test Stabilization

**Date**: 2026-01-20
**PR**: #2344
**Commit**: d91bd969
**Status**: PASS

---

## TL;DR

Fixed flaky `filters-search.spec.ts` E2E test that was timing out in CI. The test used `page.waitForURL()` which expects navigation events, but Next.js `router.push()` with `startTransition` performs soft navigation that doesn't fire Playwright's navigation detection.

---

## Root Cause

The `ProductSearchInput` component uses:
```typescript
startTransition(() => {
  router.push(`/products?search=${value}`, { scroll: false });
});
```

This is **soft navigation** in Next.js — it updates the URL without triggering a full page load event. Playwright's `waitForURL()` listens for navigation events that never fire.

---

## Fix Applied

**Before** (flaky):
```typescript
await searchInput.fill('Πορτοκάλια');
await page.waitForTimeout(500);
await page.waitForLoadState('networkidle');
await page.waitForURL(/\/products.*search=/i, { timeout: 15000 }); // FAILS - no nav event
```

**After** (stable):
```typescript
await searchInput.fill('Πορτοκάλια');
await page.waitForTimeout(600); // Debounce (300ms) + buffer

// Wait for API response as deterministic signal
await page.waitForResponse(
  (response) =>
    response.url().includes('/api/') &&
    response.url().includes('products') &&
    response.status() === 200,
  { timeout: 30000 }
).catch(() => { /* API may have already completed */ });

// Use expect.poll for URL check (works without nav events)
await expect.poll(
  async () => page.url(),
  { timeout: 30000, intervals: [250, 500, 1000, 2000] }
).toMatch(/\/products.*search=/i);
```

---

## Evidence

| Check | Result |
|-------|--------|
| E2E (PostgreSQL) | PASS (4m13s) |
| build-and-test | PASS |
| quality-gates | PASS |
| All required checks | PASS |

PR #2344 merged at 2026-01-20T09:59:29Z.

---

## Files Changed

| File | Changes |
|------|---------|
| `frontend/tests/e2e/filters-search.spec.ts` | +31/-11 lines |

---

## Risk Assessment

- **Risk**: LOW
- **Scope**: Test-only change, no business logic affected
- **Rollback**: Revert commit d91bd969 if issues arise

---

_Pass: CI-FLAKE-FILTERS-SEARCH-01 | Generated: 2026-01-20 | Author: Claude_
