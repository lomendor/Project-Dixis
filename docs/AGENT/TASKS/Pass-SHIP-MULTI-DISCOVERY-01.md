# Task: Pass-SHIP-MULTI-DISCOVERY-01

## What
Discovery/audit pass for shipping calculation and multi-producer checkout capability.

## Status
**COMPLETE** — PR Pending

## Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| SHIPPING-FACTS.md | ✅ Done | `docs/PRODUCT/SHIPPING/SHIPPING-FACTS.md` |
| MULTI-PRODUCER-FACTS.md | ✅ Done | `docs/PRODUCT/ORDERS/MULTI-PRODUCER-FACTS.md` |
| MULTI-PRODUCER-MVP-SPEC.md | ✅ Done | `docs/PRODUCT/ORDERS/MULTI-PRODUCER-MVP-SPEC.md` |
| SHIPPING-ENGINE-MVP-SPEC.md | ✅ Done | `docs/PRODUCT/SHIPPING/SHIPPING-ENGINE-MVP-SPEC.md` |

## Audit Summary

### Shipping Calculation

| Component | Finding |
|-----------|---------|
| Endpoint | `POST /api/v1/shipping/quote` |
| Zone lookup | 2-digit postal prefix → zone_id |
| Rate lookup | zone_id + method + weight → price |
| Free shipping | €35 backend, €25 frontend default |
| Fallbacks | HOME €3.50, COURIER €4.50, PICKUP €0 |

### Multi-Producer

| Component | Status |
|-----------|--------|
| Database schema | ✅ Supports multi-producer |
| Client cart (cart.ts) | ❌ Blocks at add() |
| Server (OrderController) | ❌ Blocks with 422 |
| Effort to enable | ~20 LOC removal |

## Key Files Audited

| File | Purpose |
|------|---------|
| `ShippingQuoteController.php` | Shipping calculation |
| `OrderController.php:131-144` | Multi-producer server block |
| `cart.ts:46-56` | Multi-producer client block |
| `shipping.ts` | Frontend shipping types |
| `CheckoutClient.tsx` | Free shipping UI |

---

_Pass-SHIP-MULTI-DISCOVERY-01 | 2026-01-24_
