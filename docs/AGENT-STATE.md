# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-06 (REORDER-01 + TRACKING-DISPLAY-01 merged)

> **This is THE entry point.** Read this first on every agent session. Single source of truth.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health** | `/api/healthz` (200 = OK) |
| **SSH** | `ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235` |
| **Ports** | 8001 (backend), 3001 (frontend) — LOCKED |
| **Feature health** | 97% (84 DONE + 20 PARTIAL / 111 total) |

---

## WIP (max 1)

_(empty — pick from NEXT)_

---

## NEXT (top 3 unblocked)

| Priority | Pass ID | Feature | Why |
|----------|---------|---------|-----|
| 1 | **OAUTH-GOOGLE-01** | Google OAuth frontend | Backend ready |
| 2 | **ADMIN-SHIPPING-UI-01** | Admin shipping labels UI | Service exists |
| 3 | **PRODUCER-NOTIFY-01** | Producer new order notifications | Email service ready |

See `docs/PRODUCT/PRD-COVERAGE.md` for full mapping.

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **Resend (Email)** | ✅ ENABLED |

---

## Recently Done (last 10)

- **REORDER-01** — Reorder button on order details (PR #2659, deployed 2026-02-06) ✅
- **TRACKING-DISPLAY-01** — Public order tracking via UUID token (PR #2657, deployed 2026-02-06) ✅
- **CART-SYNC-01** — Cart persistence discovered working (AuthContext sync on login) ✅
- **SSOT-AUDIT-01** — Discovered order confirmation emails already working (Laravel) ✅
- **EMAIL-VERIFY-ACTIVATE-01** — Email verification enabled in production ✅
- **CARD-SMOKE-02** — Card payment E2E smoke verified on production ✅
- **ORDER-NOTIFY-01** — Order status email notifications via Resend (#2651) ✅
- **PR-CLEAN-02** — Shared admin components: AdminLoading + AdminEmptyState (#2646) ✅
- **PR-CLEAN-01** — Dead code removal: update-status, validator, resend spec (#2644) ✅
- **PR-CRUD-02** — Product creation API + UI with Zod validation (#2642) ✅

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
