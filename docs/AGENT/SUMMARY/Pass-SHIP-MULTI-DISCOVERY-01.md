# Summary: Pass-SHIP-MULTI-DISCOVERY-01

**Status**: PASS
**Date**: 2026-01-24
**PR**: Pending

---

## TL;DR

Discovery audit for shipping and multi-producer capabilities. Created 4 spec documents. Key finding: multi-producer is blocked by ~20 LOC guards but schema fully supports it.

---

## Deliverables

| Document | Purpose |
|----------|---------|
| `SHIPPING-FACTS.md` | Current shipping calculation rules |
| `MULTI-PRODUCER-FACTS.md` | What's allowed/blocked today |
| `MULTI-PRODUCER-MVP-SPEC.md` | How to enable multi-producer |
| `SHIPPING-ENGINE-MVP-SPEC.md` | Future shipping improvements |

---

## Key Findings

### Shipping Engine

- **Status**: Adequate for MVP, no changes needed
- Zone-based pricing via postal code prefix
- Free shipping threshold: €35 (backend)
- Fallback prices work correctly
- Minor issue: frontend contract defaults to €25 (inconsistency)

### Multi-Producer Checkout

- **Schema**: ✅ Ready (OrderItem has producer_id, Order does not)
- **Client block**: `cart.ts:46-56` returns conflict status
- **Server block**: `OrderController.php:131-144` aborts with 422
- **To enable**: Remove ~20 LOC guards
- **Dependencies**: None for basic enable; shipping strategy TBD

---

## Files Created

```
docs/PRODUCT/SHIPPING/SHIPPING-FACTS.md          (+95 lines)
docs/PRODUCT/SHIPPING/SHIPPING-ENGINE-MVP-SPEC.md (+130 lines)
docs/PRODUCT/ORDERS/MULTI-PRODUCER-FACTS.md      (+115 lines)
docs/PRODUCT/ORDERS/MULTI-PRODUCER-MVP-SPEC.md   (+150 lines)
```

---

## Recommendations

1. **Multi-Producer**: Safe to enable when ready (~20 LOC change)
2. **Shipping**: No MVP changes needed
3. **Threshold alignment**: Fix €25/€35 inconsistency in future pass

---

## Evidence

```bash
# Shipping endpoint verified
curl -X POST /api/v1/shipping/quote \
  -d '{"postal_code":"10552","method":"HOME","subtotal":20}' \
  # Returns: {"price_eur":3.50,"source":"fallback"}

# Multi-producer blocks verified
# cart.ts:46-56 - conflict detection
# OrderController.php:131-144 - server guard
```

---

_Pass-SHIP-MULTI-DISCOVERY-01 | 2026-01-24_
