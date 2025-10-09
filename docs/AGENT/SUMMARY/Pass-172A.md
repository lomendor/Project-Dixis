# TL;DR — Pass 172A (Shipping Engine — feature-flag API)

- **Engine**: ENV-driven shipping quote (base, COD fee, free threshold, remote surcharge).
- **API**: `/api/shipping/quote?method=...&subtotal=...` για μελλοντική ενσωμάτωση στο checkout.
- **i18n**: Greek/English translations for shipping terms (pickup, courier, courier_cod).
- **E2E Test**: Light API validation for COURIER and COURIER_COD methods.
- **Hotfix HF-171C.1**: Fixed CSV header assertion to include `email` column.
- **Χωρίς αλλαγές business totals** στο 172A (safety). Επόμενο: 172B ένταξη στο checkout UI/total.

## Files Created/Modified

### Core Engine
- `frontend/src/lib/shipping/engine.ts` - Shipping cost calculation logic
- `frontend/src/app/api/shipping/quote/route.ts` - API endpoint

### i18n
- `frontend/src/lib/i18n/el/shipping.json` - Greek translations
- `frontend/src/lib/i18n/en/shipping.json` - English translations

### Configuration
- `.env.example` - Added shipping ENV variables

### Testing
- `frontend/tests/shipping/quote.spec.ts` - E2E API validation
- `frontend/tests/admin/orders/list-and-export.spec.ts` - Fixed CSV header assertion (HF-171C.1)

## ENV Variables

```env
SHIPPING_ENABLED=true
SHIPPING_BASE_EUR=3.5
SHIPPING_COD_FEE_EUR=2.0
SHIPPING_FREE_THRESHOLD_EUR=0
SHIPPING_REMOTE_SURCHARGE_EUR=0
```

## Safety Pattern

Feature-flag driven implementation allows shipping cost calculation to be enabled/disabled without affecting existing checkout flow. No integration with checkout totals in this pass.
