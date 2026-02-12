# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-12 (DEAD-CODE-CLEANUP deployed)

> **This is THE entry point.** Read this first on every agent session. Single source of truth.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health** | `/api/healthz` (200 = OK) |
| **SSH** | `ssh dixis-prod` (alias, key: `dixis_prod_ed25519_20260115`) |
| **Ports** | 3000 (frontend via PM2), backend via PHP-FPM unix socket |
| **Goal** | Real marketplace — real producers, real products, real customers |

---

## Full Functional Audit (2026-02-11)

### What WORKS end-to-end
- **Customer**: register → login → browse → cart → checkout → Stripe pay → email confirm → order history ✅
- **Producer** (if account exists): login → add product → edit product → see orders → email on sale ✅
- **Admin**: phone OTP login → dashboard stats → manage orders → bulk status update ✅
- **Shipping**: cost calc by postal code + weight, per-producer free threshold, **COD** (+€4 fee) ✅
- **Email**: Resend integration, Greek templates, idempotent (no double-sends) ✅

### What is BROKEN or MISSING
- **Producer Registration**: ✅ FIXED (PRODUCER-ONBOARD-01) — Self-service register → onboarding form → admin approval → email notifications
- **Producer Onboarding Flow**: ✅ FIXED — Form collects business_name, phone, city, region, description, tax_id
- **Admin Approve Producers**: ✅ FIXED — Laravel endpoints + frontend proxy + polished admin UI (ADMIN-PRODUCERS)
- **Viva Wallet**: ❌ Frontend UI exists, backend throws "not yet implemented"
- **Seed Data**: ✅ FIXED (SEED-DATA-FIX) — All producers, products, categories now in Greek with rich descriptions
- **20 stale PRs**: ✅ FIXED (STALE-PR-CLEANUP) — All 5 remaining PRs closed with explanations

---

## WIP (max 1)

_(empty — pick from NEXT)_

> **DEAD-CODE-CLEANUP DONE** — PR #2786 merged, deployed 2026-02-12
> Deleted 42 files (3,058 LOC): 16 components, 6 libs, 5 API routes, 8 legacy/dev pages, 3 redirect stubs

---

## NEXT (correct priority — marketplace-first)

| # | Pass ID | What | Why | Scope |
|---|---------|------|-----|-------|
| 1 | **ORDER-CONSOLIDATE** | Remove duplicate tracking APIs + duplicate tracking page | Architecture | ~200 LOC deletions |
| 2 | **CSP-FIX** | Remove localhost from CSP, fix hardcoded URLs | Security | ~20 LOC |
| 3 | **PRISMA-IMPORT-UNIFY** | Consolidate 3 import paths to single `@/lib/db/client` | Tech debt | ~30 LOC |
| 4 | **PROD-CDN-FIX** | Fix 400/MIME errors on production static assets | Reliability | Server/nginx |

**Note**: DEAD-CODE-CLEANUP done (PR #2786). Priorities from `docs/PRODUCT/ARCH-AUDIT-2026-02-12.md`.

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **COD (Cash on Delivery)** | ✅ ENABLED (+€4.00 fee) |
| **Resend (Email)** | ✅ ENABLED |
| **Viva Wallet** | ❌ NOT IMPLEMENTED (backend stub only) |

---

## Recently Done (last 10)

- **DEAD-CODE-CLEANUP** — Delete 42 dead files (3,058 LOC): 16 components, 6 libs, 5 API routes, 8 legacy/dev pages, 3 redirect stubs (PR #2786, deployed 2026-02-12) ✅
- **AUTH-FIX-CRITICAL** — Add requireAdmin() to 4 unprotected admin endpoints + production blocks on /api/ops/status and /dev-check (PR #2783, deployed 2026-02-12) ✅
- **ARCH-AUDIT** — Full architecture audit: 82 API routes, 14 Prisma models, ~200 frontend files. Found CRITICAL auth holes, dead code, duplicate systems. Report: `docs/PRODUCT/ARCH-AUDIT-2026-02-12.md` (2026-02-12) ✅
- **ADMIN-PRODUCTS-TAILWIND** — Convert admin products page from inline styles to Tailwind (PR #2780, deployed 2026-02-12) ✅
- **STALE-PR-CLEANUP** — Close 5 stale PRs (#2547, #2598, #2625, #2654, #2656) — 0 open PRs (2026-02-12) ✅
- **UX-POLISH-01** — Hellenize checkout/order-lookup, polish shared components (AdminEmptyState, AdminLoading, Skeleton), remove skeleton.css (PR #2776, deployed 2026-02-12) ✅
- **ADMIN-PRODUCERS** — Admin producers page: fix status mapping, add filters/detail row, Tailwind conversion (PR #2774, deployed 2026-02-12) ✅
- **COD-COMPLETE** — Cash on Delivery: shipping quote COD fee display + admin mark-as-paid endpoint (PRs #2771–#2772, deployed 2026-02-12) ✅
- **SEED-DATA-FIX** — Greek names, descriptions for all producers/products/categories + data migration (PRs #2768–#2769, deployed 2026-02-12) ✅
- **PRODUCER-ONBOARD-01** — Producer self-service registration + onboarding form + admin approve/reject + email notifications (PRs #2760–#2765, deployed 2026-02-12) ✅
- **FULL-AUDIT** — Deep functional audit of all user journeys, reset priorities to marketplace-first (2026-02-11)
- **PROD-IMAGE-FIX-01** — Product image fallback + cart i18n (PR #2757, deployed 2026-02-11) ✅
- **PROD-STABILITY-02** — nginx cleanup, Prisma singleton, Neon pooling (PR #2755, deployed 2026-02-11) ✅
- **PROD-FIX-SPRINT-01** — Cart toast, legal pages, producer redirect (PRs #2749/#2751/#2753, deployed 2026-02-11) ✅
- **ADMIN-BULK-STATUS-01** — Bulk order status update (PR #2744, deployed 2026-02-11) ✅
- **CLEANUP-SPRINT-01** — PrismaClient singleton, SQLite compat, XSS fix (#2738-#2743) ✅
- **DUAL-DB-MIGRATION** — Laravel SSOT for products (PRs #2734-#2737, deployed 2026-02-11) ✅
- **AUTH-UNIFY** — Fix producer dashboard auth (PRs #2721-#2722, deployed 2026-02-10) ✅

---

## Guardrails

- **WIP limit = 1** — One item in progress at any time
- **PR size ≤300 LOC** — May need multiple PRs for large features
- **No workflow changes** — `.github/workflows/**` locked
- **Docs inside PR** — No separate docs-only PRs (update AGENT-STATE in same PR)
- **Deploy via GitHub** — PR → CI → merge → SSH deploy

---

## After Completing a Pass

1. Update this file (WIP → Recently Done, update audit status if relevant)
2. Add entry to `docs/OPS/STATE.md` (top)
3. Verify prod: `curl -sI https://dixis.gr/api/healthz`

---

## Key Technical Notes

- **Auth**: Email + password (customers/producers), Phone OTP (admin only)
- **Product SSOT**: Laravel/PostgreSQL — frontend proxies via `apiClient` (`src/lib/api.ts`)
- **Cart**: Zustand store + server sync, keyed by Laravel integer IDs
- **Payment**: Stripe Checkout Sessions + webhooks. **COD** enabled (+€4 fee, admin confirms). Viva NOT working.
- **Producer routes**: `/producer/*` (dashboard, orders), `/my/products/*` (product CRUD)
- **Deploy**: `ssh dixis-prod` → `cd /var/www/dixis/current && git pull origin main && cd frontend && npm run build && pm2 restart dixis-frontend && pm2 save`

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/OPS/STATE.md` | Detailed pass records |
| `docs/AGENT/SOPs/` | Standard operating procedures |
| `docs/PRODUCT/PRD-AUDIT.md` | Feature gap analysis |
| `docs/PRODUCT/ARCH-AUDIT-2026-02-12.md` | Architecture audit backlog |

---

_Lines: ~100 | Target: ≤150_
