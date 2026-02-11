# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-11 (PROD-IMAGE-FIX-01 complete)

> **This is THE entry point.** Read this first on every agent session. Single source of truth.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health** | `/api/healthz` (200 = OK) |
| **SSH** | `ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235` |
| **Ports** | 3000 (frontend via PM2), backend via PHP-FPM unix socket |
| **Feature health** | 97% (84 DONE + 20 PARTIAL / 111 total) |

---

## WIP (max 1)

_(empty — pick from NEXT)_

---

## NEXT (top 3 unblocked)

| Priority | Pass ID | Feature | Why |
|----------|---------|---------|-----|
| 1 | **REORDER-01** | "Order Again" button | Core marketplace loop, repeat customers |
| 2 | **OAUTH-GOOGLE-01** | Google OAuth login | Backend needs Socialite — verify first |
| 3 | **UX-POLISH-01** | Empty states + loading skeletons | Professional feel |

See `docs/PRODUCT/PRD-COVERAGE.md` for full mapping.

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **Resend (Email)** | ✅ ENABLED |

---

## Recently Done (last 10)

- **PROD-IMAGE-FIX-01** — Product image fallback to images[] array + cart i18n (PR #2757, deployed 2026-02-11) ✅
- **PROD-STABILITY-02** — Infra hardening: nginx .bak cleanup, Prisma singleton caching in production, Neon connection pooling params (PR #2755, deployed 2026-02-11) ✅
- **PROD-FIX-SPRINT-01** — 3 production fixes from E2E audit: cart toast feedback (PR #2749), legal pages content (PR #2751), producer dashboard redirect+auth (PR #2753). All deployed & verified (2026-02-11) ✅
- **P3-DOCS-CLEANUP** — 13 env vars documented in .env.example, OPS/STATE.md synced, audit backlog cleared (2026-02-11) ✅
- **ADMIN-BULK-STATUS-01** — Bulk order status update with checkboxes + toolbar (PR #2744, deployed 2026-02-11) ✅
- **CLEANUP-SPRINT-01** — Codebase health: PrismaClient singleton (#2738), SQLite compat (#2739), docs sync (#2740), XSS fix (#2741), mock cleanup (#2743) ✅
- **DUAL-DB-MIGRATION** — Phases 5.5a-d: Laravel SSOT for products (PRs #2734-#2737, deployed 2026-02-11) ✅
- **AUTH-UNIFY** — Fix producer dashboard auth (PRs #2721-#2722, deployed 2026-02-10) ✅
- **FEATURED-PRODUCTS-FIX-01** — Fix homepage featured products not rendering (PR #2708, deployed 2026-02-10) ✅
- **PRODUCER-FILTERS-01** — Region & category filters on producers page (PR #2706, deployed 2026-02-10) ✅
- **PRODUCER-PROFILE-01** — Producer profile page + fix product count (PR #2704, deployed 2026-02-10) ✅
- **PRODUCERS-LISTING-01** — Restore public producers listing page with SSR + Prisma (PR #2701, deployed 2026-02-10) ✅
- **PRODUCER-I18N-01** — Producer analytics dashboard translated to Greek (PR #2699, deployed 2026-02-10) ✅
- **ADMIN-CLEANUP-01** — Admin code cleanup + complete i18n (PRs #2694-#2698, deployed 2026-02-09) ✅

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
| `docs/AGENT/AUDIT-BACKLOG.md` | Remaining codebase health issues (from 2026-02-11 audit) |

---

## E2E Full (Manual Run)

1. GitHub Actions → "E2E Full (nightly & manual)"
2. Click "Run workflow"
3. Artifacts: `e2e-full-report-{run_number}`

---

_Lines: ~95 | Target: ≤150_
