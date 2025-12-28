# Pass 48 - Shipping Display in Checkout & Order Details

**Date**: 2025-12-28
**Status**: COMPLETE
**PRs**: #1921 (merged)

## Problem Statement

Checkout and Order Details pages needed to:
1. Allow users to select a shipping method (HOME/PICKUP/COURIER)
2. Display shipping cost with free shipping threshold
3. Show shipping address, method, and cost in order details

## Solution

### Frontend: Checkout UI
- Added shipping method selector with 3 options:
  - HOME (Παράδοση στο σπίτι) - €3.50
  - PICKUP (Παραλαβή από κατάστημα) - Free
  - COURIER (Μεταφορική εταιρεία) - €4.50
- Free shipping for orders ≥€35
- Shipping cost displayed in checkout summary

### Backend: Order Creation
- `StoreOrderRequest.php`: Added `shipping_cost` validation
- `OrderController.php`: Store `shipping_cost` and include in order total

### Order Details
Already displays shipping data via:
- `shipping_method` + `shipping_method_label` (Greek)
- `shipping_address` (structured object)
- `shipping_amount` / `shipping_cost`

## Files Changed

| File | Changes |
|------|---------|
| `frontend/src/app/(storefront)/checkout/CheckoutClient.tsx` | +120/-5 lines |
| `frontend/src/lib/cart/totals.ts` | +4/-2 lines |
| `frontend/src/lib/api.ts` | +2/-1 lines |
| `backend/app/Http/Requests/StoreOrderRequest.php` | +2 lines |
| `backend/app/Http/Controllers/Api/V1/OrderController.php` | +6/-3 lines |
| `frontend/tests/e2e/pass-48-shipping-display.spec.ts` | +203 lines (new) |

## Evidence

### CI Results (PR #1921)
- All checks PASS: build-and-test, e2e, E2E (PostgreSQL), typecheck, quality-gates
- Merged: 2025-12-28T05:37:59Z

### New Test Coverage
- `pass-48-shipping-display.spec.ts`: 5 tests covering:
  - Shipping method selector visibility
  - Shipping cost display
  - PICKUP shows free shipping
  - Order details shows shipping address + method
  - Graceful handling of missing shipping address

## DoD Checklist

- [x] Checkout UI shows shipping method selector
- [x] Checkout summary shows shipping cost (€ or "Δωρεάν")
- [x] Free shipping for orders ≥€35
- [x] Backend stores shipping_cost
- [x] Order details displays shipping address, method, cost
- [x] E2E tests added
- [x] Type-check passes
- [x] CI green
- [x] PR merged
- [x] Docs updated

## Next Passes

- **Pass 49**: Greek Market Readiness (localization, phone/postal validation)
- **Pass 50**: Shipping pricing model (zone-based, weight-based)

---
Generated-by: Claude (Pass 48)
