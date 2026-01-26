# Proposal: Shipping Settings V1 (Per-Producer)

**Status**: PROPOSAL | **Date**: 2026-01-26

---

## Problem

Σήμερα τα μεταφορικά είναι hardcoded:
- `CheckoutService.php`: `FLAT_SHIPPING_RATE = 3.50`, `FREE_SHIPPING_THRESHOLD = 35.00`
- Ο παραγωγός δεν μπορεί να τα αλλάξει
- Δεν υπάρχει επιχειρησιακή απόφαση για αυτές τις τιμές

## Goal

Κάθε παραγωγός να ορίζει:
1. **Shipping rate** (τιμή μεταφορικών)
2. **Free shipping threshold** (ποσό πάνω από το οποίο δωρεάν - optional)

## Scope (V1 - Flat Rate Only)

- ✅ Per-producer flat rate
- ✅ Per-producer free threshold (optional)
- ❌ Address-based zones (later)
- ❌ Weight-based pricing (later)
- ❌ Courier integration (later)

---

## Implementation Plan

### Phase 1: Database Schema (~50 LOC)

**Migration**:
```sql
ALTER TABLE producers ADD COLUMN shipping_rate DECIMAL(10,2) DEFAULT 3.50;
ALTER TABLE producers ADD COLUMN free_shipping_threshold DECIMAL(10,2) DEFAULT NULL;
-- NULL = never free, 0 = always free, >0 = free above that amount
```

**Files**:
- `backend/database/migrations/YYYY_MM_DD_add_shipping_settings_to_producers.php`

### Phase 2: Producer API (~30 LOC)

**Endpoint**: `PATCH /api/v1/producer/settings/shipping`

**Payload**:
```json
{
  "shipping_rate": 4.50,
  "free_shipping_threshold": 50.00
}
```

**Validation**:
- `shipping_rate`: required, numeric, min 0
- `free_shipping_threshold`: nullable, numeric, min 0

**Files**:
- `backend/app/Http/Controllers/Api/Producer/ProducerSettingsController.php`
- `backend/routes/api.php` (route addition)

### Phase 3: Producer Dashboard UI (~100 LOC)

**Location**: Producer Settings page

**Form fields**:
- "Κόστος μεταφορικών (€)" - number input
- "Δωρεάν μεταφορικά για παραγγελίες άνω των (€)" - number input, optional

**Files**:
- `frontend/src/app/(producer)/producer/settings/ShippingSettingsForm.tsx`

### Phase 4: CheckoutService Refactor (~50 LOC)

**Before**:
```php
private const FLAT_SHIPPING_RATE = 3.50;
private const FREE_SHIPPING_THRESHOLD = 35.00;
```

**After**:
```php
$producer = Producer::find($producerId);
$shippingRate = $producer->shipping_rate ?? 3.50;  // fallback
$freeThreshold = $producer->free_shipping_threshold;

if ($freeThreshold !== null && $subtotal >= $freeThreshold) {
    return 0.0;
}
return $shippingRate;
```

**Files**:
- `backend/app/Services/CheckoutService.php`

### Phase 5: Tests (~80 LOC)

**Unit tests**:
- Producer with custom rate → uses custom rate
- Producer without rate → uses fallback
- Producer with threshold → free above threshold
- Producer without threshold → never free

**E2E test**:
- 2-producer checkout with different rates
- Verify each producer's shipping displays correctly

**Files**:
- `backend/tests/Feature/ShippingSettingsTest.php`
- `frontend/tests/e2e/producer-shipping-settings.spec.ts`

---

## Total Estimate

| Phase | LOC | Risk |
|-------|-----|------|
| Schema | ~50 | Low |
| API | ~30 | Low |
| UI | ~100 | Medium |
| Service | ~50 | Medium |
| Tests | ~80 | Low |
| **Total** | **~310** | |

## Open Questions

1. Τι default rate αν ο παραγωγός δεν έχει ορίσει; (€3.50?)
2. Επιτρέπουμε €0 shipping rate; (πάντα δωρεάν)
3. Θέλουμε min/max limits; (π.χ. max €20)
4. Θα βλέπει ο πελάτης τα shipping settings του παραγωγού στο PDP;

---

## Next Steps

1. Απόφαση σε open questions
2. PR-1: Schema migration
3. PR-2: API + Service
4. PR-3: UI
5. PR-4: Tests
