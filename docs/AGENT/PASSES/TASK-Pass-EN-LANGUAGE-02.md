# Pass EN-LANGUAGE-02: Extend i18n to Remaining Pages

**Status**: ✅ DONE
**Created**: 2026-01-17
**PR**: #2256

## Goal

Extend i18n compliance to checkout, order confirmation, and producer orders pages.

## Scope

Pages to update:
- `app/(storefront)/checkout/page.tsx`
- `app/order/confirmation/[orderId]/page.tsx`
- `app/producer/orders/page.tsx`

## Definition of Done

- [x] All hardcoded Greek strings replaced with `t()` calls
- [x] New i18n namespaces added: `orderStatus`, `checkoutPage`, `orderConfirmation`, `producerOrders`
- [x] EL translations added (~60 keys)
- [x] EN translations added (~60 keys)
- [x] E2E tests added (4 smoke tests)
- [x] Build passes
- [x] All CI checks green
- [x] PR merged

## Files Changed

| File | Change |
|------|--------|
| `frontend/messages/el.json` | +67 lines (4 namespaces) |
| `frontend/messages/en.json` | +67 lines (4 namespaces) |
| `frontend/src/app/(storefront)/checkout/page.tsx` | i18n for checkout form |
| `frontend/src/app/order/confirmation/[orderId]/page.tsx` | i18n for order confirmation |
| `frontend/src/app/producer/orders/page.tsx` | i18n for producer orders list |
| `frontend/tests/e2e/i18n-checkout-orders.spec.ts` | 4 E2E smoke tests |

## Namespaces Added

- `orderStatus.*` — shared order status labels (pending, paid, processing, shipped, delivered)
- `checkoutPage.*` — checkout form labels and messages
- `orderConfirmation.*` — order confirmation page strings
- `producerOrders.*` — producer orders list page strings

## E2E Tests

1. Checkout page renders in English with EN locale cookie
2. Checkout page renders in Greek with EL locale cookie
3. Producer orders page route is protected
4. Producer orders page uses i18n in English locale
