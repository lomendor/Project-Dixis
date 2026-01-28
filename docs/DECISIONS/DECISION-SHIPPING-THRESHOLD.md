# Decision: Free Shipping Threshold

**Date**: 2026-01-28
**Status**: Active
**Decided by**: Engineering (Pass ORDER-SHIPPING-SPLIT-01)

## Summary

The free shipping threshold for Project Dixis is **€35.00 per producer**.

## Source of Truth

| Component | Value | File |
|-----------|-------|------|
| **Runtime** | €35.00 | `backend/app/Services/CheckoutService.php:25` |
| Config (unused) | €35.00 | `backend/config/shipping/profiles.json` |
| Docs | €35.00 | `docs/OPS/STATE.md`, `docs/PRODUCT/SHIPPING-AND-TAXES-MVP.md` |

## Current Implementation

```php
// CheckoutService.php
private const FREE_SHIPPING_THRESHOLD = 35.00; // €35 per producer
```

The threshold is applied **per producer subtotal**, not per cart total. This means:
- If Producer A subtotal >= €35 → Free shipping for Producer A
- If Producer B subtotal < €35 → Shipping charged for Producer B
- Each producer is evaluated independently

## Why Not Config-Driven?

The `profiles.json` config file is **not read by runtime code**. The `CheckoutService` uses a hardcoded constant for simplicity during MVP phase.

### Future: Config-Driven Shipping

To make threshold configurable:
1. Create `ShippingConfigService` that reads `profiles.json`
2. Replace `CheckoutService::FREE_SHIPPING_THRESHOLD` with service call
3. Add admin UI to edit threshold
4. Add cache layer for config

This is tracked as potential future enhancement, not MVP scope.

## Historical Note

Prior to 2026-01-28, `profiles.json` had `free_shipping_threshold: 50.00` which was never used. This was aligned to €35 in Pass SHIPPING-THRESHOLD-CONFIG-ALIGN-01 to prevent confusion.
