# Pass V1-QA-RUNBOOK-AND-E2E-PLAN-01: QA Runbook + E2E Plan

**Date**: 2026-01-22T14:50:00Z
**Commit**: TBD (pending merge)
**Pass ID**: V1-QA-RUNBOOK-AND-E2E-PLAN-01

---

## TL;DR

Created consolidated V1 QA runbook and E2E automation plan. Existing E2E coverage (355 test files) is **sufficient** - no new tests required.

---

## Deliverables

| Document | Path | Purpose |
|----------|------|---------|
| RUNBOOK-V1-QA.md | `docs/OPS/RUNBOOK-V1-QA.md` | Consolidated QA execution guide |
| E2E-V1-AUTOMATION-PLAN.md | `docs/OPS/E2E-V1-AUTOMATION-PLAN.md` | Test inventory + gap analysis |

---

## V1 Flow Coverage Summary

| Flow | Description | Manual Runbook | E2E Tests | Status |
|------|-------------|----------------|-----------|--------|
| A | Guest COD | Documented | `cart-checkout-m0.spec.ts`, etc. | COMPLETE |
| B | Auth Card | Documented | `auth-cart-flow.spec.ts` (mocked) | PARTIAL |
| C | Producer | Documented | `producer-product-crud.spec.ts` | COMPLETE |
| D | Admin | Documented | `admin-order-detail.spec.ts` | COMPLETE |

---

## E2E Inventory

- **Total test files**: 355
- **Key directories**: e2e (252), storefront (13), checkout (6), admin (14)
- **Gap identified**: Stripe integration mocked (by design)
- **Recommendation**: No new tests needed for V1

---

## Key Findings

1. **Runbook already exists** at `docs/PRODUCT/QA-V1-RUNBOOK.md`
2. **E2E coverage is extensive** - all 4 V1 flows covered
3. **Stripe mocking is intentional** - avoids real payment intents in CI
4. **Curl scripts complement E2E** - `prod-qa-v1.sh` for production smoke

---

## Artifacts

- `docs/OPS/RUNBOOK-V1-QA.md` (NEW)
- `docs/OPS/E2E-V1-AUTOMATION-PLAN.md` (NEW)

---

**V1 QA Execution Path: DEFINED**
