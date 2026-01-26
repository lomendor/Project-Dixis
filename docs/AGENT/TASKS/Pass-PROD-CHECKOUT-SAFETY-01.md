# Pass-PROD-CHECKOUT-SAFETY-01: Multi-Producer shipping_lines Aggregation

**Status**: ✅ COMPLETE
**PR**: #2488
**Commit**: `7b0eca26`
**Date**: 2026-01-26

---

## Problem Statement

Multi-producer checkout responses returned `shipping_lines: []` at the top level, even though:
- `shipping_total` was correctly calculated (e.g., "7.00")
- Child orders had their own `shipping_lines` populated correctly

Frontend/tests expected `data.shipping_lines` at the top level of `CheckoutSessionResource`.

## Root Cause Analysis

1. `CheckoutService.processCheckout()` correctly creates child orders with `OrderShippingLine` records
2. Each child order's `shippingLines` relation was loaded correctly
3. `CheckoutSessionResource` returned `orders: [OrderResource, ...]` with nested shipping_lines
4. **Bug**: `CheckoutSessionResource` did NOT aggregate shipping_lines at the top level
5. Frontend accessed `response.data.shipping_lines` → got `[]` or `undefined`

## Solution

### Files Changed (2 files, +24/-4 LOC)

1. **`backend/app/Http/Resources/CheckoutSessionResource.php`**
   - Added `shipping_lines` field that aggregates all shipping lines from child orders
   - Uses `flatMap()` to flatten N orders × M lines into single array

2. **`backend/app/Services/CheckoutService.php`**
   - Changed from `$checkoutSession->load('orders')` to `$checkoutSession->load(['orders.orderItems.producer', 'orders.shippingLines'])`
   - Nested eager loading ensures `shippingLines` relation is available on checkout session's orders

### Code Changes

```php
// CheckoutSessionResource.php - NEW
'shipping_lines' => $this->when($this->relationLoaded('orders'), function () {
    return $this->orders
        ->filter(fn ($order) => $order->relationLoaded('shippingLines'))
        ->flatMap(fn ($order) => $order->shippingLines->map(fn ($line) => [
            'producer_id' => $line->producer_id,
            'producer_name' => $line->producer_name,
            'subtotal' => number_format((float) $line->subtotal, 2),
            'shipping_cost' => number_format((float) $line->shipping_cost, 2),
            'shipping_method' => $line->shipping_method,
            'free_shipping_applied' => (bool) $line->free_shipping_applied,
        ]))
        ->values()
        ->all();
}, []),
```

```php
// CheckoutService.php - CHANGED
// Before:
$checkoutSession->load('orders');

// After:
$checkoutSession->load(['orders.orderItems.producer', 'orders.shippingLines']);
```

## Verification

### CI Checks (Required)
| Check | Status |
|-------|--------|
| `build-and-test` | ✅ PASS |
| `Analyze (javascript)` | ✅ PASS |
| `quality-gates` | ✅ PASS |
| `E2E (PostgreSQL)` | ✅ PASS (retry) |

### Production API Canary (2026-01-26T09:40 UTC)

```bash
curl -X POST 'https://dixis.gr/api/v1/public/orders' \
  -H 'Content-Type: application/json' \
  -d '{"items": [{"product_id": 11, "quantity": 1}, {"product_id": 6, "quantity": 1}], ...}'
```

**Response**:
```json
{
  "type": "checkout_session",
  "is_multi_producer": true,
  "order_count": 2,
  "shipping_lines_count": 2,
  "shipping_lines": [
    {
      "producer_id": 1,
      "producer_name": "Green Farm Co.",
      "subtotal": "15.99",
      "shipping_cost": "3.50",
      "shipping_method": "HOME",
      "free_shipping_applied": false
    },
    {
      "producer_id": 4,
      "producer_name": "Test Producer B",
      "subtotal": "5.00",
      "shipping_cost": "3.50",
      "shipping_method": "HOME",
      "free_shipping_applied": false
    }
  ],
  "shipping_total": "7.00"
}
```

### Assertions Verified
- ✅ `shipping_lines.length == 2` (one per producer)
- ✅ `shipping_total == "7.00"` (= sum of shipping_cost: 3.50 + 3.50)
- ✅ Each line has: producer_id, producer_name, subtotal, shipping_cost, shipping_method, free_shipping_applied

## Related Passes

- Pass-GUARDRAILS-CRITICAL-FLOWS-01 (added GP2 test that exposed this bug)
- Pass-MP-ORDERS-SPLIT-01 (original CheckoutService implementation)
- Pass-CI-SMOKE-STABILIZE-001 (CI test stabilization)

## Follow-up

- [ ] Pass-STRIPE-CARD-E2E-01: Verify CARD payment email timing
- [ ] UI verification: Confirm checkout page displays shipping breakdown
