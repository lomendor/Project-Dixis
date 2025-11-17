# COMM-ENGINE-04 — Wiring & Exposure (Draft Plan)

**Scope (flagged = OFF by default):**
- Wire CommissionService into order read model (response-only; no totals mutation).
- Expose commission breakdown in Order API when `commission_engine_v1` is ON.
- No impact to checkout/payment totals in this pass.

**Tasks**
- [ ] Add read-only `commission_preview` to Order transformer/resource
- [ ] Guard with `Feature::active('commission_engine_v1')`
- [ ] Add 2 tests: preview present when flag ON, absent when OFF
- [ ] Update docs/COMMISSIONS.md (API example)
- [ ] No migrations, no settlement yet

**Safety**
- Fully feature-flagged, zero production impact by default.
- CI tests cover ON/OFF toggling.

## API Endpoint (read-only, behind feature flag)

`GET /api/orders/{order}/commission-preview`

- Returns 404 when `commission_engine_v1` is OFF.
- Returns JSON:
```json
{
  "order_id": 123,
  "commission_preview": {
    "commission_cents": 1200,
    "rule_id": 5,
    "breakdown": {
      "percent": 12.00,
      "fixed_fee": 0,
      "vat_mode": "EXCLUDE",
      "rounding": "NEAREST"
    }
  }
}
```

## Implementation Details

- **Controller**: `OrderCommissionPreviewController`
- **Route**: `GET /api/orders/{order}/commission-preview`
- **Feature Flag**: `commission_engine_v1` (must be ON)
- **Tests**: `OrderCommissionPreviewTest`
  - `test_returns_404_when_flag_off()`
  - `test_returns_preview_when_flag_on()`

## Safety

- Read-only operation (no mutations)
- 404 response when feature flag is OFF
- Zero production impact by default
- Comprehensive test coverage
