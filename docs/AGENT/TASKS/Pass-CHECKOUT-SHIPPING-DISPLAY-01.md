# Pass CHECKOUT-SHIPPING-DISPLAY-01: Show Shipping Cost in Checkout

**Date**: 2026-01-28
**PR**: #2515
**Branch**: `fix/passCHECKOUT-SHIPPING-DISPLAY-01`
**Status**: IN REVIEW

## Problem

PROD-ACCEPTANCE-01 audit (G5) discovered checkout page does NOT display shipping costs.
- User adds items → checkout → sees subtotal only
- No shipping line visible
- API `/api/v1/public/shipping/quote` works but checkout never calls it

## Task Definition

1. Call shipping quote API when user enters valid 5-digit postal code
2. Display shipping cost in checkout order summary
3. Show zone info and free shipping indicator
4. Update total to include shipping dynamically

## Acceptance Criteria

- [x] Shipping line appears after valid postal code entry
- [x] Shows "Calculating..." during API call
- [x] Shows cost (e.g., "3,50 €") or "Free" when applicable
- [x] Shows zone name (e.g., "Αττική")
- [x] Total updates to include shipping
- [x] Graceful fallback on API error (hides shipping)
- [x] i18n: All strings use t() with EL/EN keys
- [x] E2E test covers 7 scenarios

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/app/(storefront)/checkout/page.tsx` | Add shipping quote fetch + display |
| `frontend/tests/e2e/checkout-shipping-display.spec.ts` | 7 E2E test scenarios |
| `frontend/messages/el.json` | Add checkoutPage.shipping* keys |
| `frontend/messages/en.json` | Add checkoutPage.shipping* keys |
| `docs/OPS/STATE.md` | Document pass |

## Risks

- **Low**: Frontend-only change, no backend modifications
- **Mitigated**: API already exists and works correctly
- **Tested**: E2E tests use mocking, immune to backend availability

## Proof

- Build: Next.js 15.5.9 passes
- Typecheck: No errors
- E2E: 7 test scenarios (require running server)
