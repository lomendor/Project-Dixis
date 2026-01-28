# Summary: Pass ORDER-SHIPPING-SPLIT-01

**Date**: 2026-01-28
**PR**: #2524
**Result**: ✅ CI GREEN (awaiting merge)

## What

Per-producer shipping breakdown in checkout with quote-lock mismatch verification.

## Why

1. Multi-producer carts need transparent per-producer shipping costs
2. Shipping prices can change between quote and order placement (pricing updates, zone changes)
3. Users must explicitly accept any shipping cost changes (HARD_BLOCK pattern)

## How

### Backend

**New endpoint**: `POST /api/v1/public/shipping/quote-cart`
- Accepts: `postal_code`, `method`, `items[]` (product_id, quantity)
- Returns: per-producer breakdown with `shipping_cost`, `zone`, `weight_grams`, `is_free`

**Mismatch detection** in CheckoutService:
- Compares `quoted_shipping` (from frontend) vs calculated `locked_shipping`
- Throws `ShippingChangedException` if |diff| > 0.01€
- OrderController catches and returns 409 `SHIPPING_CHANGED` with amounts

**Lock fields** on OrderShippingLine:
- `zone`: shipping zone code
- `weight_grams`: total weight for producer's items
- `quoted_at`: when frontend received quote
- `locked_at`: when order was placed

### Frontend

**ShippingBreakdownDisplay component**:
- Single producer: single line (existing UX)
- Multi-producer: breakdown per producer + "Σύνολο μεταφορικών" total

**ShippingChangedModal component** (HARD_BLOCK):
- Shows when `SHIPPING_CHANGED` error received
- Displays old vs new shipping amounts
- Accept: re-fetches quote, user submits again
- Cancel: stays on checkout

**Checkout integration**:
- 300ms debounce on postal code input
- Passes `quoted_shipping`, `quoted_at` to order API
- Handles `SHIPPING_CHANGED` response to show modal

## Policy (Unchanged)

- Free shipping: €35 per producer
- HARD_BLOCK: user must accept changed shipping
- Storage: one OrderShippingLine per producer

## Proof

```
CI Status: 21 checks passing
- build-and-test: pass
- php-tests: pass
- e2e: pass
- E2E (PostgreSQL): pass
- typecheck: pass
```

## Evidence

- PR: https://github.com/lomendor/Project-Dixis/pull/2524
- CI Run: https://github.com/lomendor/Project-Dixis/actions/runs/21432871589

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Quote changes between Accept and re-submit | Timing window is minimal; user sees final price before submit |
| Zone unavailable blocks checkout | Error shown, submit button disabled |
| Old clients without quoted_shipping | Backend skips check if param is null |

## Files Changed

16 files, +1146/-49 lines

Backend:
- Migration for lock fields
- ShippingQuoteController.quoteCart()
- CheckoutService mismatch detection
- ShippingChangedException
- OrderController error handling

Frontend:
- ShippingBreakdownDisplay.tsx
- ShippingChangedModal.tsx
- checkout/page.tsx integration
- api.ts client methods
- i18n keys (el, en)

Tests:
- checkout-shipping-split.spec.ts (5 tests)
