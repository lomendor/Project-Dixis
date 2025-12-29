# TEST-UNSKIP-02 — Enable More Skipped E2E Tests

**Date**: 2025-12-29
**Status**: COMPLETE
**PR**: #1964

## TL;DR

Unskipped 6 E2E tests from PDP and products specs. All tests pass in CI (E2E PostgreSQL: 3m21s).

## What Changed

| File | Tests Unskipped |
|------|-----------------|
| `pdp-happy.spec.ts` | 5 |
| `products-ui.smoke.spec.ts` | 1 |

## Key Technical Insight

PDP (`/products/[id]`) is a Server Component (SSR). Playwright's `page.route()` only intercepts browser requests, NOT server-side fetch() calls. Therefore, route mocking doesn't work for SSR pages.

**Solution**: Tests now rely on production data instead of route mocking.

## DoD Verification

- [x] Enable ≥5 previously-skipped tests (6 enabled)
- [x] All unskipped tests PASS in CI
- [x] No new test failures introduced
- [x] E2E job under 5 minutes (3m21s)

## Unskipped Tests

### pdp-happy.spec.ts (5 tests)
1. `should display complete product information` - rewritten without route mocking
2. `should handle 404 product not found gracefully` - new implementation
3. `should format currency properly with EUR symbol` - new implementation
4. `should handle add to cart flow for authenticated users` - new implementation
5. `should be accessible with proper ARIA labels` - new implementation

### products-ui.smoke.spec.ts (1 test)
1. `products page renders grid` - removed "flaky" label

## Remaining Skipped Tests (for future passes)

| Category | Count | Reason | Action |
|----------|-------|--------|--------|
| `flow route not present` | ~30 | `/checkout/flow` doesn't exist | Create route or remove tests |
| `No products available` | ~15 | Data-dependent conditional | Keep as guard clauses |
| `admin list not available` | ~10 | Admin route guards | Keep as guard clauses |
| `pdp-happy.spec.ts` stubs | 4 | No implementation | Implement or remove |

## Risks

Low. Tests use production data which is stable. No external dependencies beyond production API.

---
Generated-by: Claude (TEST-UNSKIP-02)
