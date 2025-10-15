# TL;DR — SHIP-V2

## Summary
Ported Marketplace shipping logic as config-based engine with comprehensive test coverage.

## Key Features
- **Config-based engine**: CSV→JSON conversion for rates and postal zones
- **Zones**: Postal prefix matching (longest-prefix-wins algorithm)
- **Weight tiers**: Binary search for rate selection
- **Volumetric weight**: ÷5000 calculation, chargeable = max(actual, volumetric)
- **Business rules**: COD fee (€2), free shipping ≥€60
- **API upgrade**: POST /api/checkout/quote with detailed breakdown

## Implementation
- `frontend/src/lib/shipping/engine.v2.ts`: Core engine logic
- `frontend/src/lib/shipping/config/`: JSON configs (rates, zones, types)
- `frontend/src/app/api/checkout/quote/route.ts`: API endpoint
- `scripts/ship/convert-from-csv.ts`: CSV converter tool
- `frontend/tests/shipping/`: Unit + E2E tests

## Test Coverage
- Unit tests: zones, volumetric weight, chargeable kg calculation
- E2E test: Quote API endpoint integration
- All tests validate rule trace and cost breakdown

## Non-breaking Changes
- Existing checkout flow unchanged
- Quote API enhanced with detailed breakdown
- Prisma schema updated with shipping fields (idempotent)
