# TEST-UNSKIP-01 — Enable Skipped E2E Tests

**Date**: 2025-12-29
**Status**: COMPLETE
**PR**: #1962

## TL;DR

Unskipped 8 E2E tests from orders flow specs. All tests pass in CI (E2E PostgreSQL: 3m1s).

## What Changed

| File | Tests Unskipped |
|------|-----------------|
| `checkout-to-orders-list.spec.ts` | 4 |
| `orders-details-stable.spec.ts` | 4 |

## DoD Verification

- [x] Enable ≥6 previously-skipped tests (8 enabled)
- [x] All unskipped tests PASS in CI
- [x] No new test failures introduced
- [x] E2E job under 5 minutes (3m1s)

## Unskipped Tests

### checkout-to-orders-list.spec.ts
1. `order appears in orders list after successful checkout`
2. `order details page loads after checkout`
3. `handles empty orders list gracefully`
4. `handles order fetch error gracefully`

### orders-details-stable.spec.ts
1. `orders list renders without crash when status is undefined`
2. `order details page renders without crash when data is incomplete`
3. `order details shows 404 error gracefully when order not found`
4. `verifies orders list calls Laravel API and renders page`

## Remaining Skipped Tests (for future passes)

| Category | Count | Reason | Action |
|----------|-------|--------|--------|
| `flow route not present` | ~30 | `/checkout/flow` doesn't exist | Create route or remove tests |
| `No products available` | ~15 | Data-dependent conditional | Keep as guard clauses |
| `admin list not available` | ~10 | Admin route guards | Keep as guard clauses |
| `pdp-happy.spec.ts` | 10 | Static skips, no implementation | Implement or remove |
| `products-ui.smoke.spec.ts` | 1 | Marked flaky | Investigate flakiness |

## Risks

None. Tests use route mocking - no external dependencies.

---
Generated-by: Claude (TEST-UNSKIP-01)
