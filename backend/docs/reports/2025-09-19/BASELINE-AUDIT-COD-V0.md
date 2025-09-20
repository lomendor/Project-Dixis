# Baseline Audit — COD v0 (post-merge)

## Summary
- Feature flagged: `SHIPPING_ENABLE_COD=false` (default)
- Config: `SHIPPING_COD_FEE_EUR` (default 4.00)
- Quote supports `payment_method` = CARD|COD; adds `cod_fee_cents` when enabled+COD
- Controller validates `payment_method`
- FE: selector CARD/COD, totals show COD fee line; tests green

## CI Snapshot
- Backend unit/feature ✅
- Frontend type-check/build ✅
- E2E ✅
- Lighthouse ✅
- Danger ✅

## Notes
- No live integrations; safe to deploy with flags OFF
- To enable in staging: set `SHIPPING_ENABLE_COD=true` and verify UI totals show COD fee line