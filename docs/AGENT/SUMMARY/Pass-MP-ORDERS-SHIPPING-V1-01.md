# Summary: Pass-MP-ORDERS-SHIPPING-V1-01 (Schema)

**Date**: 2026-01-24
**Status**: COMPLETE
**PR**: Pending

---

## What Changed

Phase 1 of enabling multi-producer checkout: Created `order_shipping_lines` table to store per-producer shipping breakdown.

---

## Why

The hotfix (HOTFIX-MP-CHECKOUT-GUARD-01) blocks multi-producer checkout because shipping is calculated as a single flat rate. To enable real multi-producer checkout, we need to track shipping per producer.

---

## Schema

New table `order_shipping_lines`:

| Column | Type | Purpose |
|--------|------|---------|
| order_id | FK → orders | Parent order |
| producer_id | FK → producers | Producer for this shipping line |
| producer_name | VARCHAR | Denormalized for history |
| subtotal | DECIMAL | Sum of items from this producer |
| shipping_cost | DECIMAL | Calculated shipping for this producer |
| shipping_method | VARCHAR | HOME, COURIER, etc. |
| free_shipping_applied | BOOLEAN | True if subtotal >= €35 |

---

## Impact

| Before | After |
|--------|-------|
| Single shipping_cost on order | Per-producer shipping_lines |
| Can't track per-producer shipping | Each producer's shipping stored separately |
| Checkout blocked for multi-producer | Schema ready for Phase 2 (backend logic) |

---

## Files

| File | LOC |
|------|-----|
| Migration | ~60 |
| Model | ~55 |
| Order.php (relation) | +8 |
| Unit tests | ~110 |
| **Total** | ~233 |

---

## Next Phase

~~Phase 2 (Backend)~~ ✅ **COMPLETED** - See Pass-MP-ORDERS-SHIPPING-V1-02.md

---

_Pass-MP-ORDERS-SHIPPING-V1-01 | 2026-01-24_
