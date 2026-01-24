# Summary: Pass-MP-ORDERS-SHIPPING-V1-02 (Backend)

**Date**: 2026-01-24
**Status**: COMPLETE
**PR**: #2458

---

## What Changed

Phase 2 of multi-producer checkout: Backend now creates per-producer shipping lines and calculates shipping per producer.

---

## Changes

| File | Change |
|------|--------|
| `OrderController.php` | Calculate per-producer shipping, create OrderShippingLine records |
| `OrderResource.php` | Add `shipping_lines[]`, `shipping_total`, `is_multi_producer` |
| `MultiProducerOrderTest.php` | 5 feature tests for shipping line scenarios |

---

## Shipping Calculation V1

| Condition | Shipping Cost |
|-----------|---------------|
| PICKUP method | €0.00 (free) |
| Producer subtotal >= €35 | €0.00 (free) |
| Otherwise | €3.50 per producer |

**Total shipping** = Sum of all producer shipping costs

---

## API Response Format

```json
{
  "data": {
    "id": 1,
    "subtotal": "58.00",
    "shipping_cost": "3.50",
    "total": "61.50",
    "shipping_lines": [
      {
        "producer_id": 1,
        "producer_name": "Farm A",
        "subtotal": "40.00",
        "shipping_cost": "0.00",
        "shipping_method": "HOME",
        "free_shipping_applied": true
      },
      {
        "producer_id": 2,
        "producer_name": "Farm B",
        "subtotal": "18.00",
        "shipping_cost": "3.50",
        "shipping_method": "HOME",
        "free_shipping_applied": false
      }
    ],
    "shipping_total": "3.50",
    "is_multi_producer": true
  }
}
```

---

## Tests

| Test | Description |
|------|-------------|
| `test_multi_producer_order_creates_shipping_lines` | 2 producers → 2 shipping lines |
| `test_shipping_total_equals_sum_of_line_costs` | shipping_total = Σ(line.shipping_cost) |
| `test_order_total_invariant_holds` | total = subtotal + shipping_total |
| `test_single_producer_order_creates_one_shipping_line` | Backward compatibility |
| `test_pickup_shipping_is_always_free` | PICKUP method always free |

All 5 tests pass (42 assertions).

---

## Next Phase

Phase 3 (Frontend): Update checkout UI to:
- Display per-producer shipping breakdown
- Show which producers qualify for free shipping
- Update cart totals to reflect per-producer shipping

---

_Pass-MP-ORDERS-SHIPPING-V1-02 | 2026-01-24_
