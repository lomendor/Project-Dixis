# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-06 (EMAIL-VERIFY-ACTIVATE-01 ✅ — email verification enabled in production)

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
| 1 | **CART-SYNC-01** | Cart persistence to backend |
| 2 | **TRACKING-DISPLAY-01** | Order tracking URL display |
| 3 | **PRODUCER-DASH-01** | Producer dashboard improvements |

See `docs/PRODUCT/PRD-COVERAGE.md` for full mapping.

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **Resend (Email)** | ✅ ENABLED |

---

## Recently Done (last 10)

- **EMAIL-VERIFY-ACTIVATE-01** — Email verification enabled in production ✅
- **CARD-SMOKE-02** — Card payment E2E smoke verified on production ✅
- **ORDER-NOTIFY-01** — Order status email notifications via Resend (#2651) ✅
- **PR-CLEAN-02** — Shared admin components: AdminLoading + AdminEmptyState (#2646) ✅
- **PR-CLEAN-01** — Dead code removal: update-status, validator, resend spec (#2644) ✅
- **PR-CRUD-02** — Product creation API + UI with Zod validation (#2642) ✅
- **PR-BUILD-FIX** — Remove dead resend/route.ts blocking VPS build (#2640) ✅
- **PR-CRUD-01** — Producer creation UI (#2637) ✅
- **PR-FIX-03** — Analytics auth fix: cookie auth + Prisma endpoint (#2636) ✅
- **PR-FIX-02** — Moderation page rewrite: cookies, toast, Tailwind (#2635) ✅
- **PR-FIX-01** — Wire OrderStatusQuickActions into order detail (#2634) ✅
- **PR-SEC-01+02** — Rate limit + admin 24h session (#2633) ✅

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
