# Pass-PAYMENT-INIT-ORDER-ID-01: Fix 404 on Payment Init (Multi-Producer)

**Status**: ✅ COMPLETE
**PR**: #2490
**Date**: 2026-01-26

---

## Problem Statement

Users reported 404 errors when attempting card payment for multi-producer checkout:
```
POST /api/v1/payments/orders/5/init -> 404 Not Found ("Order not found")
```

## Reproduction Steps

1. Add products from 2 different producers to cart
2. Proceed to checkout
3. Select CARD payment method
4. Submit order
5. **Expected**: Payment form appears
6. **Actual**: 404 error, payment fails

## Root Cause Analysis

### API Response Structure

Multi-producer checkout returns `CheckoutSession`, not `Order`:

```json
{
  "data": {
    "id": 6,                    // <-- CheckoutSession ID
    "type": "checkout_session",
    "is_multi_producer": true,
    "orders": [
      { "id": 115, ... },       // <-- Child Order 1
      { "id": 116, ... }        // <-- Child Order 2
    ]
  }
}
```

### Bug Location

**Frontend** (`checkout/page.tsx:153`):
```typescript
const paymentInit = await paymentApi.initPayment(order.id, {...})
//                                               ^^^^^^^
// order.id = 6 (CheckoutSession ID, NOT Order ID!)
```

**Backend** (`PaymentController.php:18`):
```php
public function initPayment(Request $request, Order $order): JsonResponse
//                                            ^^^^^^^^^^^^
// Order::findOrFail(6) fails - no Order with ID 6 exists
```

### Root Cause

1. `apiClient.createOrder()` returns `{ data: CheckoutSession }` for multi-producer
2. Frontend uses `order.id` (CheckoutSession ID) for `initPayment`
3. Backend expects Order ID, not CheckoutSession ID
4. `Order::findOrFail(6)` throws 404

## Solution

### Files Changed (3 files, +40/-7 LOC)

1. **`backend/app/Http/Resources/CheckoutSessionResource.php`** (+6 LOC)
   - Add `payment_order_id` field (first child order ID)

2. **`frontend/src/lib/api.ts`** (+4 LOC)
   - Add `type`, `payment_order_id`, `orders` to Order interface

3. **`frontend/src/app/(storefront)/checkout/page.tsx`** (+30/-7 LOC)
   - Use `payment_order_id` for initPayment
   - Use CheckoutSession ID for thank-you redirect
   - Handle 409 (stock conflict) with Greek message
   - Clear stale payment state on failure

### Code Changes

**Backend** (CheckoutSessionResource.php):
```php
// Pass PAYMENT-INIT-ORDER-ID-01: Canonical order ID for payment initialization
'payment_order_id' => $this->when($this->relationLoaded('orders') && $this->orders->isNotEmpty(), function () {
    return $this->orders->first()->id;
}),
```

**Frontend** (checkout/page.tsx):
```typescript
// Pass PAYMENT-INIT-ORDER-ID-01: Get correct order ID for payment init
const paymentOrderId = order.payment_order_id ?? order.id;
const thankYouId = order.id;

// Initialize payment with correct order ID
const paymentInit = await paymentApi.initPayment(paymentOrderId, {...})
```

## Acceptance Criteria

- [x] Multi-producer CARD payment: `initPayment` called with child Order ID
- [x] Single-producer CARD payment: Still uses `order.id` (unchanged)
- [x] 409 stock conflict: Shows Greek error, no initPayment called
- [x] CI required checks pass
- [x] Production deployment successful

## Production Evidence

**API Response** (2026-01-26):
```json
{
  "id": 6,
  "type": "checkout_session",
  "is_multi_producer": true,
  "payment_order_id": 115,
  "first_child_order_id": 115
}
```

**Deployment**:
- PR: https://github.com/lomendor/Project-Dixis/pull/2490
- Workflow: "Deploy Backend (VPS)" - success
- Commit: `ef3fb29fc78051aadaf6130a4d35a5d0c6b714b9`

## Related Issues

- Pass-PROD-CHECKOUT-SAFETY-01: Fixed shipping_lines aggregation
- React #418: Addressed by proper hydration handling (existing fix)
- 409 stock conflict: Now shows clear Greek error message
