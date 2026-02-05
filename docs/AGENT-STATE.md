# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-05 (Pass ADMIN-LOGIN-UI-01)

> **This is THE entry point.** Read this first on every agent session. Single source of truth.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health** | `/api/healthz` (200 = OK) |
| **SSH** | `ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235` |
| **Ports** | 8001 (backend), 3001 (frontend) — LOCKED |
| **Feature health** | 91% (78 DONE + 23 PARTIAL / 111 total) |

---

## WIP (max 1)

_(empty — pick from NEXT)_

---

## NEXT (top 3 unblocked)

| Priority | Pass ID | Feature |
|----------|---------|---------|
| 1 | **ORDER-NOTIFY-01** | Order status email notifications |
| 2 | **CARD-SMOKE-02** | Card payment E2E smoke on production |
| 3 | **CART-SYNC-01** | Cart persistence to backend |

See `docs/PRODUCT/PRD-COVERAGE.md` for full mapping.

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **Resend (Email)** | ✅ ENABLED |

---

## Recently Done (last 10)

- **ADMIN-LOGIN-UI-01** — Admin login page with phone/OTP authentication (#2623) ✅
- **DEPLOY-HARDENING-01** — Deploy script hardening + env SSOT (#2618-#2622) ✅
- **PRODUCER-THRESHOLD-POSTALCODE-01** — Per-producer free shipping threshold + checkout address prefill ✅
- **EMAIL-VERIFY-01** — Email verification flow (backend + frontend + tests) ✅
- **PROC-01** — Consolidate entry points into AGENT-STATE.md ✅
- **PERF-IPV4-PREFER-01** — Fix 9.5s backend latency (9.3s → 70ms, ~100x faster) ✅
- **CSP-STRIPE-01** — Fix CSP for Stripe Elements iframe ✅
- **STRIPE-E2E-TIMEOUT-01** — Deterministic Stripe E2E test ✅
- **PAYMENTS-STRIPE-ELEMENTS-01** — Stripe Elements in checkout ✅
- **PAYMENTS-CARD-REAL-01** — Card payment E2E with real auth ✅
- **ENV-FRONTEND-PAYMENTS-01** — VPS frontend Stripe env ✅
- **CARD-PAYMENT-SMOKE-01** — Card payment E2E smoke tests ✅
- **PROD-UNBLOCK-01** — Production auth/products verified ✅

---

## Guardrails (non-negotiable)

- **WIP limit = 1** — One item in progress at any time
- **DoD required** — Measurable Definition of Done before starting
- **PR size ≤300 LOC** — Smaller = faster review
- **No workflow changes** — `.github/workflows/**` locked without explicit directive

---

## After Completing a Pass

1. Update this file (WIP → Recently Done)
2. Add entry to `docs/OPS/STATE.md` (top)
3. Create pass file in `docs/AGENT/PASSES/SUMMARY-Pass-{PASS-ID}.md`
4. Verify prod: `curl -sI https://dixis.gr/api/healthz`

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/OPS/STATE.md` | Detailed pass records |
| `docs/OPS/STATE-ARCHIVE/` | Older pass history |
| `docs/AGENT/PASSES/` | All pass documentation (TASK-*, SUMMARY-*) |
| `docs/AGENT/SOPs/` | Standard operating procedures |
| `docs/PRODUCT/PRD-AUDIT.md` | Feature gap analysis |
| `docs/PRODUCT/PRD-COVERAGE.md` | PRD→Pass mapping |

---

## E2E Full (Manual Run)

1. GitHub Actions → "E2E Full (nightly & manual)"
2. Click "Run workflow"
3. Artifacts: `e2e-full-report-{run_number}`

---

_Lines: ~95 | Target: ≤150_
