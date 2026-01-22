# Proof: V1-QA-EXECUTE-01 (2026-01-22)

**Date**: 2026-01-22T16:36:00Z
**Pass ID**: V1-QA-EXECUTE-01
**Runbook**: `docs/OPS/RUNBOOK-V1-QA.md`

---

## Executive Summary

All 4 V1 flows verified via production API checks and existing evidence.

| Flow | Status | Evidence |
|------|--------|----------|
| A: Guest COD | **PASS** | Order #99, ORD-000099 |
| B: Auth Card | **PASS** | Order #102, PI `pi_3SsMh9Q9Xukpkfmb...` |
| C: Producer | **PASS** | Product #11, publicly visible |
| D: Admin | **PASS** | Order #99, pending → processing |

---

## Commands Executed

### Production Baseline

```bash
# All scripts passed
./scripts/prod-facts.sh        # 5/5 PASS
bash scripts/perf-baseline.sh  # All endpoints < 300ms
bash scripts/prod-qa-v1.sh     # 6/6 PASS
```

### Script Results

**prod-facts.sh** (2026-01-22T16:36:09Z):
- Backend Health: 200 OK
- Products API: 200, returns data
- Products Page: 200, shows products
- Product Detail: 200, shows content
- Login Page: 200, redirects to auth

**perf-baseline.sh** (2026-01-22T16:36:17Z):
| Endpoint | Median TTFB |
|----------|-------------|
| `/` | 184ms |
| `/products` | 182ms |
| `/api/v1/public/products` | 259ms |

**prod-qa-v1.sh** (2026-01-22T16:36:31Z):
- 6/6 checks PASS
- Products API: 30 products returned
- Auth endpoints: 422 for empty body (expected)
- Password reset: responds correctly

---

## Flow Evidence

### Flow A: Guest COD - PASS

**Source**: Prior execution (2026-01-22T11:53:26Z)
**Verification**: Order exists in production

| Field | Value |
|-------|-------|
| Order ID | 99 |
| Order Number | ORD-000099 |
| Status | pending → processing (updated by Flow D) |
| Payment Method | COD |
| Total | €19.99 EUR |

### Flow B: Auth Card - PASS (Stripe Mocked in E2E)

**Source**: Prior execution (2026-01-22T12:09:01Z)
**Verification**: Payment Intent created

| Field | Value |
|-------|-------|
| Order ID | 102 |
| Payment Intent | `pi_3SsMh9Q9Xukpkfmb2vwY2ktn` |
| Amount | 2699 cents (EUR) |
| PI Status | requires_payment_method |

**E2E Coverage**:
- `auth-cart-flow.spec.ts` - authenticated cart
- `cart-auth-integration.spec.ts` - auth + cart sync
- `checkout/atomic.spec.ts` - payment flow (mocked)

**Stripe Constraint**: Real Stripe payments not executed in E2E to avoid creating real charges. Payment endpoint validation confirmed via `prod-qa-v1.sh`.

**Last CI Run**: https://github.com/lomendor/Project-Dixis/actions/runs/21255677474 (SUCCESS)

### Flow C: Producer - PASS

**Source**: Prior execution (2026-01-22T12:18:59Z)
**Verification**: Product publicly visible

```bash
curl -sf "https://dixis.gr/api/v1/public/products/11"
# Returns: id=11, name="QA Flow C Product 1769084338", status="available"
```

| Field | Value |
|-------|-------|
| Product ID | 11 |
| Name | QA Flow C Product 1769084338 |
| Price | €15.99 |
| Status | available |
| Producer | Green Farm Co. |

### Flow D: Admin - PASS

**Source**: Prior execution (2026-01-22T12:41:55Z)
**Verification**: Order status updated

| Field | Value |
|-------|-------|
| Order ID | 99 |
| Status Change | pending → processing |
| Updated At | 2026-01-22T12:41:55.000000Z |
| Email | Code-verified (OrderEmailService called) |

---

## Artifacts

| Artifact | Path |
|----------|------|
| prod-facts output | `docs/OPS/.local/PROD-FACTS-LAST.md` |
| Prior proof | `docs/AGENT/SUMMARY/Proof-2026-01-22-v1-qa-execution.md` |
| Runbook | `docs/OPS/RUNBOOK-V1-QA.md` |
| E2E Plan | `docs/OPS/E2E-V1-AUTOMATION-PLAN.md` |
| CI Run | https://github.com/lomendor/Project-Dixis/actions/runs/21255677474 |

---

## Risks / Notes

1. **Stripe mocked**: Flow B uses mocked payments in E2E. Real Stripe integration verified via endpoint smoke tests only.
2. **Email delivery**: OrderEmailService call verified in code path. Inbox delivery requires manual/external verification.
3. **Test data**: Orders #99, #102 and Product #11 are QA test artifacts in production.

---

## Conclusion

**V1 QA EXECUTE: ALL 4 FLOWS PASS**

- Production baseline: ALL PASS
- Flow A (Guest COD): PASS
- Flow B (Auth Card): PASS (Stripe mocked)
- Flow C (Producer): PASS
- Flow D (Admin): PASS

---

_V1-QA-EXECUTE-01 | 2026-01-22_
