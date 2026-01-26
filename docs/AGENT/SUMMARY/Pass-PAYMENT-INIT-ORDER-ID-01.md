# Pass-PAYMENT-INIT-ORDER-ID-01 Summary

**Status**: ✅ COMPLETE | **PR**: #2490 | **Date**: 2026-01-26

## What

Fixed 404 error when initializing card payment for multi-producer checkout. Backend `initPayment` endpoint was receiving CheckoutSession ID instead of Order ID.

## Why

- Multi-producer checkout returns `CheckoutSession` (id=6) with child `Orders` (id=115, 116)
- Frontend called `initPayment(6)` - treating CheckoutSession ID as Order ID
- Backend `Order::findOrFail(6)` failed with 404 (no Order with that ID exists)

## How

1. **Backend**: Added `payment_order_id` to `CheckoutSessionResource` (first child order ID)
2. **Frontend**: Uses `payment_order_id` for `initPayment`, CheckoutSession ID for thank-you redirect
3. **Frontend**: Handles 409 (stock conflict) with Greek error message
4. **Frontend**: Clears stale payment state on order creation failure

## Evidence

**Production API** (2026-01-26):
```json
{
  "id": 6,
  "type": "checkout_session",
  "is_multi_producer": true,
  "payment_order_id": 115,
  "first_child_order_id": 115
}
```

**CI**: All required checks PASS
**Deploy**: "Deploy Backend (VPS)" - success

## Files Changed

| File | Change |
|------|--------|
| `backend/app/Http/Resources/CheckoutSessionResource.php` | +6 LOC: add payment_order_id |
| `frontend/src/lib/api.ts` | +4 LOC: Order interface types |
| `frontend/src/app/(storefront)/checkout/page.tsx` | +30/-7 LOC: use correct IDs |
