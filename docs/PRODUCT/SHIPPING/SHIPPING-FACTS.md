# Shipping Facts

**Pass**: SHIP-MULTI-DISCOVERY-01
**Date**: 2026-01-24
**Status**: Audit Complete

---

## Inputs

| Input | Source | Example |
|-------|--------|---------|
| `postal_code` | User input | `"10552"` (5-digit Greek postal code) |
| `method` | User selection | `HOME`, `COURIER`, `PICKUP` |
| `weight_kg` | Optional | `1.0` (default) |
| `subtotal` | Cart total | `€19.99` |

---

## Calculation Rules

### 1. Zone-Based Pricing (Primary)

```
POST /api/v1/shipping/quote
```

- Extract 2-digit prefix from postal code (e.g., `10552` → `10`)
- Look up `shipping_zones` table by `postal_prefix`
- Look up `shipping_rates` table by `zone_id` + `method` + `weight_kg`
- Return `price_eur` from rate

### 2. Free Shipping

| Condition | Result |
|-----------|--------|
| `method === 'PICKUP'` | Always €0 |
| `subtotal >= €35` | €0 (backend threshold) |
| `subtotal >= €25` | €0 (frontend contracts default) |

**Note**: Backend uses €35, frontend contract uses €25. CheckoutClient.tsx explicitly uses €35.

### 3. Fallback Prices

If zone lookup fails, hardcoded defaults apply:

| Method | Fallback Price |
|--------|----------------|
| `HOME` | €3.50 |
| `COURIER` | €4.50 |
| `PICKUP` | €0.00 |

### 4. COD Fee

- `COURIER_COD` adds €1.50 COD handling fee
- Applied on top of base shipping cost

---

## Defaults

| Parameter | Default Value | Location |
|-----------|---------------|----------|
| `FREE_SHIPPING_THRESHOLD` | €35 | `ShippingQuoteController.php:25`, `CheckoutClient.tsx:47` |
| `DEFAULT_WEIGHT_KG` | 1.0 kg | `ShippingQuoteController.php:28` |
| `PICKUP base` | €0 | `shipping.ts:97` |
| `COURIER base` | €3.50 | `shipping.ts:98` |
| `COD fee` | €1.50 | `shipping.ts:99` |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Invalid postal code | Returns fallback price |
| Zone not found | Returns fallback price |
| Rate not found for zone | Returns fallback price |
| Weight > 100kg | Validation error (400) |
| Subtotal missing | Treated as €0 (no free shipping) |

---

## What Shipping Does NOT Cover

- **Multi-zone orders**: No logic to combine shipping from multiple zones
- **Multi-producer orders**: Blocked at application layer (separate issue)
- **Weight aggregation**: Each quote is independent, no cart-level weight sum
- **Insurance/tracking**: Not implemented
- **Time windows**: No delivery time slot selection
- **Dynamic pricing**: No surge pricing or demand-based rates
- **International shipping**: Greece-only (5-digit postal codes)

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/app/Http/Controllers/Api/V1/ShippingQuoteController.php` | Main calculation endpoint |
| `backend/app/Models/ShippingZone.php` | Zone lookup by postal prefix |
| `backend/app/Models/ShippingRate.php` | Rate lookup by zone + method |
| `backend/database/seeders/ShippingZoneSeeder.php` | Default zones/rates |
| `frontend/src/contracts/shipping.ts` | Client-side calculation/types |
| `frontend/src/app/(storefront)/checkout/CheckoutClient.tsx` | Free shipping display logic |

---

_SHIP-MULTI-DISCOVERY-01 | 2026-01-24_
