# Plan: Pass-MP-SHIPPING-BREAKDOWN-TRUTH-01

**Date**: 2026-01-25
**Status**: COMPLETE
**PR**: Pending

---

## Goal

Enable multi-producer checkout with per-producer shipping breakdown. Remove HOTFIX blocking and wire frontend to backend CheckoutService.

---

## Non-Goals

- No backend changes (CheckoutService already ready)
- No new shipping calculation logic (already implemented in Pass MP-ORDERS-SHIPPING-V1-01/02)
- No email timing changes (already fixed in Pass MP-PAYMENT-EMAIL-TRUTH-01)

---

## Background

Multi-producer checkout was blocked by HOTFIX (PR #2448/#2449/#2465) due to incomplete order splitting. The backend CheckoutService was then implemented (PR #2476, #2477) which correctly:

1. Creates CheckoutSession + N child Orders (one per producer)
2. Calculates per-producer shipping (€3.50 flat, free >= €35)
3. Sends emails at correct times (COD at creation, CARD after payment)

The frontend still had the HOTFIX blocking multi-producer carts at checkout.

---

## Solution

1. **Remove frontend HOTFIX blocks** in `checkout/page.tsx`:
   - Remove render-time block (lines 219-254)
   - Remove submit-time block (lines 82-88)

2. **Update thank-you page** to show per-producer shipping breakdown:
   - Display `shipping_lines[]` from API response
   - Show each producer's name and shipping cost
   - Show total shipping at the end

3. **Update E2E tests**:
   - Replace `multi-producer-checkout-blocked.spec.ts` with `multi-producer-checkout.spec.ts`
   - Test that checkout form is accessible (not blocked)
   - Test that COD checkout completes successfully

---

## Evidence

### Backend Tests (pre-existing)

34 tests, 157 assertions - all pass:
- CheckoutSessionTest: 11 tests
- MultiProducerOrderSplitTest: 7 tests
- MultiProducerOrderTest: 5 tests
- MultiProducerPaymentEmailTest: 8 tests
- MultiProducerShippingTotalTest: 3 tests

### Frontend Changes

- `checkout/page.tsx`: Removed 2 HOTFIX blocks (~45 LOC removed)
- `thank-you/page.tsx`: Added per-producer shipping breakdown display

### E2E Tests

- New: `multi-producer-checkout.spec.ts` (3 tests)
- Removed: `multi-producer-checkout-blocked.spec.ts` (obsolete)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Multi-producer orders break email flow | Already tested in MultiProducerPaymentEmailTest |
| Shipping calculation incorrect | Already tested in MultiProducerShippingTotalTest |
| Payment fails for multi-producer | Backend handles single PaymentIntent for total amount |

---

## Acceptance Criteria

- [x] Multi-producer cart can proceed to checkout (not blocked)
- [x] Checkout form visible for multi-producer carts
- [x] Thank-you page shows per-producer shipping breakdown
- [x] Backend tests pass (34 tests, 157 assertions)
- [x] E2E tests updated and pass TypeScript
- [x] No regression in single-producer checkout

---

_Pass-MP-SHIPPING-BREAKDOWN-TRUTH-01 | 2026-01-25_
