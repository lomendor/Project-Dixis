# Shipping Engine: MVP Specification

**Pass**: SHIP-MULTI-DISCOVERY-01
**Date**: 2026-01-24
**Status**: Draft

---

## Goal

Document the shipping calculation engine and identify improvements for MVP+.

---

## Current State Summary

See: `SHIPPING-FACTS.md` for complete audit.

### What Works

- Zone-based pricing via postal code prefix
- Free shipping threshold (€35)
- PICKUP always free
- Fallback prices when zone not found
- COD fee calculation

### What's Missing

- Multi-zone aggregation
- Weight-based tiered pricing
- Dimensional weight (volumetric)
- Real-time carrier rates
- Producer location awareness

---

## MVP Scope (No Changes Required)

The current shipping engine is **adequate for MVP**:

| Feature | Status | Notes |
|---------|--------|-------|
| Zone lookup | ✅ Works | Postal prefix → zone |
| Fixed rates | ✅ Works | Per zone/method |
| Free shipping | ✅ Works | €35 threshold |
| Fallback | ✅ Works | Safe defaults |

**Recommendation**: No shipping engine changes for MVP. Focus on multi-producer enablement first.

---

## Post-MVP Enhancements

### Priority 1: Threshold Alignment

**Issue**: Backend uses €35, frontend contracts default €25.

**Fix**: Centralize threshold in shared config.

```typescript
// contracts/shipping.ts
export const FREE_SHIPPING_THRESHOLD = 35; // Single source of truth
```

### Priority 2: Weight Aggregation

**Current**: Each quote uses default 1kg.
**Proposed**: Sum product weights for accurate quote.

```php
// ShippingQuoteController.php
$totalWeight = collect($items)->sum(fn($i) => $i['weight_kg'] * $i['qty']);
```

### Priority 3: Multi-Producer Shipping

When multi-producer enabled, options:

| Strategy | Calculation |
|----------|-------------|
| Combined | One shipping quote for entire order |
| Per-producer | Sum of per-producer shipping |
| Highest-only | Max of per-producer (marketing) |

### Priority 4: Real-Time Carrier Rates

Integrate with carriers for live quotes:

| Carrier | Integration |
|---------|-------------|
| ACS | API available |
| Speedex | API available |
| ELTA | Manual rates |

---

## Technical Debt

| Issue | Impact | Fix Effort |
|-------|--------|------------|
| Hardcoded thresholds | Inconsistency | Small |
| No weight aggregation | Inaccurate quotes | Small |
| No producer location | Suboptimal routing | Medium |
| No carrier integration | Manual rate updates | Large |

---

## Proposed Architecture (Post-MVP)

```
┌─────────────────────────────────────────────────┐
│                  Shipping Engine                 │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐             │
│  │ Zone Service │  │ Rate Service │             │
│  └──────────────┘  └──────────────┘             │
│         │                 │                      │
│         v                 v                      │
│  ┌──────────────────────────────────────────┐   │
│  │           Quote Calculator                │   │
│  │  - Weight aggregation                     │   │
│  │  - Multi-producer handling                │   │
│  │  - Free shipping logic                    │   │
│  │  - COD fee calculation                    │   │
│  └──────────────────────────────────────────┘   │
│                      │                          │
│                      v                          │
│  ┌──────────────────────────────────────────┐   │
│  │           Carrier Adapter (Future)        │   │
│  │  - ACS API                                │   │
│  │  - Speedex API                            │   │
│  │  - Fallback to zone rates                 │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Acceptance Criteria (MVP)

No changes required. Current engine meets MVP needs.

## Acceptance Criteria (Post-MVP)

1. [ ] Unified free shipping threshold across FE/BE
2. [ ] Weight aggregation in shipping quotes
3. [ ] Multi-producer shipping calculation (when enabled)
4. [ ] E2E tests for edge cases

---

## Key Files

| File | Purpose |
|------|---------|
| `ShippingQuoteController.php` | Main endpoint |
| `ShippingZone.php` | Zone model |
| `ShippingRate.php` | Rate model |
| `shipping.ts` | Frontend contracts |
| `CheckoutClient.tsx` | UI integration |

---

## Open Questions

1. **Threshold**: Align on €25 or €35?
2. **Multi-producer**: Option A/B/C for combined shipping?
3. **Carrier integration**: Priority for post-MVP?

---

_SHIP-MULTI-DISCOVERY-01 | 2026-01-24_
