# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-06

> **This is THE entry point.** Read this first on every agent session. Single source of truth.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health** | `/api/healthz` (200 = OK) |
| **SSH** | `ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235` |
| **Ports** | 3000 (frontend via PM2), backend via PHP-FPM unix socket |

---

## WIP (max 1)

_(empty — pick from NEXT)_

---

## NEXT (top 3 unblocked)

| Priority | Pass ID | Feature |
|----------|---------|---------|
| 1 | **ADMIN-AUTHGUARD-01** | Fix AuthGuard admin role detection |
| 2 | **WISHLIST-01** | User wishlist feature |
| 3 | **PRODUCER-NOTIFICATIONS-01** | Producer order notifications |

> **Note**: See `docs/E2E-FLOW-AUDIT.md` for comprehensive flow analysis

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **Resend (Email)** | ✅ ENABLED |
| **Neon PostgreSQL** | ✅ WORKING |

---

## Recently Done (last 10)

- **PRODUCER-PRODUCTS-FIX-01** — Producer products CRUD via Prisma + nginx fix (2026-02-06) ✅
- **PRODUCER-ONBOARDING-FIX-01** — Replaced mock with Prisma (2026-02-06) ✅
- **ADMIN-CONSOLIDATION-01** — Security fixes, Orders migrated to Prisma, Laravel removed (2026-02-06) ✅
- **ADMIN-AUDIT-01** — Deep audit of admin dashboard, fixed Category table, seeded 9 categories (2026-02-06) ✅
- **INFRA-STABILITY-01** — Deploy script, nginx docs, stability fixes (2026-02-06) ✅
- **ADMIN-PAGES-FIX-01** — Fixed admin pages (credentials: include, nginx routing) (2026-02-06) ✅
- **NEON-DB-FIX-01** — Fixed Neon DB password mismatch (2026-02-06) ✅
- **ADMIN-EMAIL-OTP-01** — Admin login via email OTP (2026-02-06) ✅
- **ADMIN-SHIPPING-UI-01** — Shipping labels UI wired to admin ✅
- **PRODUCER-NOTIFY-01** — Producer emails working ✅
- **REORDER-01** — Reorder button on order details ✅
- **TRACKING-DISPLAY-01** — Public order tracking via UUID token ✅
- **ORDER-NOTIFY-01** — Order status email notifications ✅

---

## Guardrails (non-negotiable)

- **WIP limit = 1** — One item in progress at any time
- **DoD required** — Measurable Definition of Done before starting
- **PR size ≤300 LOC** — Smaller = faster review
- **No workflow changes** — `.github/workflows/**` locked

---

## After Completing a Pass

1. Update this file (WIP → Recently Done)
2. Add entry to `docs/OPS/STATE.md`
3. Create pass file in `docs/AGENT/PASSES/SUMMARY-Pass-{PASS-ID}.md`
4. Verify prod: `curl -sI https://dixis.gr/api/healthz`

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/OPS/WORKAROUNDS.md` | Active workarounds (check for cleanup) |
| `docs/OPS/NGINX-CONFIG.md` | Nginx configuration reference |
| `docs/OPS/STATE.md` | Detailed pass records |
| `docs/AGENT/SOPs/` | Standard operating procedures |
| `scripts/deploy.sh` | **USE THIS TO DEPLOY** |
| `docs/ADMIN-AUDIT.md` | Admin dashboard audit report |
| `docs/E2E-FLOW-AUDIT.md` | **E2E flow audit (2026-02-06)** |

---

_Lines: ~70 | Target: ≤100_
