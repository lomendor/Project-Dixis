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
