# Task: Pass PRODUCER-THRESHOLD-POSTALCODE-01

**Pass ID**: PRODUCER-THRESHOLD-POSTALCODE-01
**PR**: #2527
**Branch**: `feat/passPRODUCER-THRESHOLD-POSTALCODE-01`
**Status**: 🟡 OPEN

## Objective

Implement per-producer free shipping threshold and ensure checkout uses single postal code source of truth.

## Acceptance Criteria

- [x] Producers can set custom free shipping threshold
- [x] System falls back to €35 default when producer threshold is NULL
- [x] quote-cart API returns `threshold_eur` per producer
- [x] Logged-in users get address pre-filled from saved data
- [x] Checkout uses single postal code input for both shipping calc and order

## Definition of Done

- [x] Migration adds nullable `free_shipping_threshold_eur` to producers
- [x] Producer model has fillable + decimal cast
- [x] Config has `default_free_shipping_threshold_eur`
- [x] CheckoutService uses per-producer threshold
- [x] ShippingQuoteController returns threshold in response
- [x] Producer settings UI has threshold field
- [x] Checkout pre-fills address for logged-in users
- [x] 8 tests (5 unit + 3 feature)
- [x] CI passes (baseline failures documented)

## Files Changed

### Backend

1. `database/migrations/2026_01_28_120000_add_free_shipping_threshold_to_producers.php`
2. `app/Models/Producer.php`
3. `config/shipping.php`
4. `app/Services/CheckoutService.php`
5. `app/Http/Controllers/Api/V1/ShippingQuoteController.php`
6. `app/Http/Controllers/Api/AuthController.php`
7. `app/Http/Resources/Api/ProducerResource.php`
8. `app/Http/Requests/UpdateProducerRequest.php`
9. `routes/api.php`

### Frontend

1. `src/app/(storefront)/checkout/page.tsx`
2. `src/app/producer/settings/page.tsx`
3. `src/lib/api.ts`

### Tests

1. `tests/Unit/ProducerFreeShippingThresholdTest.php` (5 tests)
2. `tests/Feature/Api/ShippingQuoteCartThresholdTest.php` (3 tests)

## Technical Notes

### Threshold Resolution Priority

1. Producer's `free_shipping_threshold_eur` if not NULL
2. System default from `config('shipping.default_free_shipping_threshold_eur', 35.00)`

### Auth Endpoint Response

```json
{
  "address": {
    "name": "...",
    "line1": "...",
    "line2": "...",
    "city": "...",
    "postal_code": "...",
    "phone": "..."
  }
}
```

Returns `null` if no saved address and no previous orders.

## Evidence

- PR: https://github.com/lomendor/Project-Dixis/pull/2527
