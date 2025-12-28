# Pass 50 - Zone-Based Shipping Pricing

**Date**: 2025-12-28
**Status**: ✅ COMPLETE
**PRs**: #1927 (implementation), #1928 (migration workflow), #1929 (path fix)

## Problem Statement

Shipping costs were hardcoded in frontend (HOME=€3.50, COURIER=€4.50). Real Greek marketplace needs zone-based pricing where:
- Athens metro has cheaper shipping
- Islands have higher shipping costs
- Different methods (HOME/COURIER) have different prices per zone

## Solution

### Backend: Zone Pricing Model

**New Tables** (Laravel migrations):
- `shipping_zones`: id, name, postal_prefixes (JSON), is_active
- `shipping_rates`: zone_id, method, weight_min_kg, weight_max_kg, price_eur

**New Models**:
- `ShippingZone` - finds zone by postal code prefix match
- `ShippingRate` - finds rate by zone/method/weight

**API Endpoint**:
`POST /api/v1/public/shipping/quote`
```json
// Request
{
  "postal_code": "10564",
  "method": "HOME",
  "subtotal": 30.00,
  "weight_kg": 1.0
}

// Response
{
  "price_eur": 3.50,
  "zone_name": "Αττική",
  "zone_id": 1,
  "method": "HOME",
  "free_shipping": false,
  "source": "zone"
}
```

### Seeded Zones (Greek Market)

| Zone | Postal Prefixes | HOME | COURIER |
|------|-----------------|------|---------|
| Αττική | 10-19 | €3.50 | €4.50 |
| Θεσσαλονίκη | 54-57 | €4.00 | €5.00 |
| Ηπειρωτική Ελλάδα | 20-69 | €5.00 | €6.00 |
| Νησιά | 70-85 | €7.00 | €8.50 |

### Frontend: Dynamic Quote

- When user enters postal code (5 digits), fetch quote from API
- Display zone name under shipping selector ("Ζώνη: Αττική")
- Update shipping cost dynamically based on zone
- **Fallback**: If API fails, use hardcoded prices (backwards compatible)

### Rollout Safety

- API failure → fallback to hardcoded prices (€3.50 HOME, €4.50 COURIER)
- Free shipping threshold (€35) still works
- PICKUP always free
- No PII in logs (only zone_id, method, source)

## Files Changed

| File | Changes |
|------|---------|
| `backend/database/migrations/2025_12_28_120000_create_shipping_zones_table.php` | New |
| `backend/database/migrations/2025_12_28_120001_create_shipping_rates_table.php` | New |
| `backend/app/Models/ShippingZone.php` | New |
| `backend/app/Models/ShippingRate.php` | New |
| `backend/database/seeders/ShippingZoneSeeder.php` | New |
| `backend/app/Http/Controllers/Api/V1/ShippingQuoteController.php` | New |
| `backend/routes/api.php` | +4 lines |
| `frontend/src/lib/api.ts` | +20 lines |
| `frontend/src/app/(storefront)/checkout/CheckoutClient.tsx` | +45 lines |
| `backend/tests/Feature/ShippingZoneQuoteTest.php` | New (8 tests) |
| `frontend/tests/e2e/pass-50-shipping-zones.spec.ts` | New (5 tests) |
| `docs/NEXT-7D.md` | Updated |

## Evidence

### Tests
- Backend: 8 unit tests (zone resolution, price lookup, fallback, validation)
- E2E: 5 Playwright tests (Athens zone, islands zone, free shipping, PICKUP, fallback)

### CI Results
- ✅ All checks passed

### Production Verification (2025-12-28)
```bash
# Athens (10558) → €3.50 Αττική ✅
curl -X POST https://dixis.gr/api/v1/public/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{"postal_code":"10558","method":"HOME","weight_kg":1}'

# Mykonos (84600) → €7.00 Νησιά ✅
curl -X POST https://dixis.gr/api/v1/public/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{"postal_code":"84600","method":"HOME","weight_kg":1}'

# Free shipping (>€35) → €0.00 ✅
curl -X POST https://dixis.gr/api/v1/public/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{"postal_code":"10558","method":"HOME","weight_kg":1,"subtotal":40}'
```

## DoD Checklist

- [x] Backend: shipping_zones + shipping_rates tables
- [x] Backend: Zone lookup by postal prefix
- [x] Backend: Quote API with fallback
- [x] Frontend: Fetch quote on postal/method change
- [x] Frontend: Display zone name
- [x] Frontend: Fallback to hardcoded on API failure
- [x] Backend tests: 8 tests
- [x] E2E tests: 5 tests
- [x] TypeScript passes
- [x] CI green
- [x] PR merged (#1927)
- [x] Docs updated (ACCESS.md)

## Next Passes

- **Pass 51**: Payment provider integration
- **Pass 52**: Email notifications

---
Generated-by: Claude (Pass 50)
