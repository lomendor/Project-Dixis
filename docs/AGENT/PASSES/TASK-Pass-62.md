# Pass 62 — Orders/Checkout E2E Guardrail

## Goal
Lock the consumer orders/checkout flow with an E2E regression test so it never silently breaks again.

## Scope
Included:
- E2E test covering consumer authentication
- Cart functionality verification
- Checkout page loads correctly
- Orders list shows orders (with API mocking)
- Order details page renders items + producer info + status + shipping
- API integration verification (calls Laravel, not Prisma)

Excluded:
- No feature work
- No UI changes (except minimal data-testid if needed)
- Not unquarantining unrelated flaky tests

## DoD
- [x] E2E spec created: `orders-checkout-regression.spec.ts`
- [x] 11 tests covering full consumer journey
- [x] Tests pass locally against production
- [x] Uses route mocking for deterministic CI behavior
- [x] Verifies Laravel API is called (not Prisma /internal)
- [x] docs updated
