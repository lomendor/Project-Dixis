# Summary: Pass PRODUCER-THRESHOLD-POSTALCODE-01

**Date**: 2026-01-28
**PR**: #2527
**Result**: 🟡 OPEN (PR #2527)

## What

Per-producer free shipping threshold + checkout postal code single source of truth.

## Why

1. Different producers may have different free shipping thresholds based on their margins
2. Checkout had potential for postal code mismatches between shipping calc and order storage
3. Logged-in users should have smoother checkout with address pre-fill

## How

### (A) Per-Producer Threshold

**Database**: Added nullable `free_shipping_threshold_eur` column to `producers` table.
- NULL = use system default (€35 from config)
- Set value = use producer's custom threshold

**Backend Logic**:
```php
private function getProducerThreshold(?Producer $producer): float
{
    if ($producer && $producer->free_shipping_threshold_eur !== null) {
        return (float) $producer->free_shipping_threshold_eur;
    }
    return (float) config('shipping.default_free_shipping_threshold_eur', 35.00);
}
```

**API Response**: `quote-cart` now returns `threshold_eur` per producer in response.

### (B) Producer Settings UI

Added "Ρυθμίσεις Αποστολής" (Shipping Settings) section in producer settings:
- Input field for `free_shipping_threshold_eur`
- Placeholder shows system default

### (C) Checkout Address Pre-fill

For logged-in users:
1. On mount, fetch `/api/v1/auth/shipping-address`
2. If saved address exists, pre-fill form fields
3. Auto-trigger shipping quote if postal code is pre-filled

**New endpoint**: `GET /api/v1/auth/shipping-address` (auth required)
- Returns user's saved shipping address (type=shipping or type=default)
- Falls back to last order's shipping address if no saved address

## Changes

| File | Change |
|------|--------|
| `backend/database/migrations/2026_01_28_120000_*` | Add threshold column |
| `backend/app/Models/Producer.php` | fillable + casts |
| `backend/config/shipping.php` | default threshold config |
| `backend/app/Services/CheckoutService.php` | Per-producer threshold logic |
| `backend/app/Http/Controllers/Api/V1/ShippingQuoteController.php` | threshold in quote response |
| `backend/app/Http/Controllers/Api/AuthController.php` | shippingAddress endpoint |
| `frontend/src/app/(storefront)/checkout/page.tsx` | Address pre-fill |
| `frontend/src/app/producer/settings/page.tsx` | Threshold input |

## Tests

- `ProducerFreeShippingThresholdTest` (5 unit tests)
- `ShippingQuoteCartThresholdTest` (3 feature tests)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Auth endpoint PII exposure | Returns only address fields needed for checkout (name, line1, city, postal_code, phone) |
| Breaking existing checkout | Threshold defaults to system value (€35) if not set |

## Baseline Note

10 CommissionServiceTest failures exist on origin/main (missing `features` table). Not introduced by this pass - verified by running tests on clean main branch.
