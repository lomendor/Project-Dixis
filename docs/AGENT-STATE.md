# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-12 (SEED-DATA-FIX complete, deployed)

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
- **Shipping**: cost calc by postal code + weight, per-producer free threshold ✅
- **Email**: Resend integration, Greek templates, idempotent (no double-sends) ✅

### What is BROKEN or MISSING
- **Producer Registration**: ✅ FIXED (PRODUCER-ONBOARD-01) — Self-service register → onboarding form → admin approval → email notifications
- **Producer Onboarding Flow**: ✅ FIXED — Form collects business_name, phone, city, region, description, tax_id
- **Admin Approve Producers**: ✅ FIXED — Laravel endpoints + frontend proxy wired to admin panel
- **Viva Wallet**: ❌ Frontend UI exists, backend throws "not yet implemented"
- **Seed Data**: ✅ FIXED (SEED-DATA-FIX) — All producers, products, categories now in Greek with rich descriptions
- **20 stale PRs**: ⚠️ PRs from Dec 2025 still open, need cleanup

---

## WIP (max 1)

_(empty — pick from NEXT)_

> **SEED-DATA-FIX DONE** — 2 PRs merged (#2768–#2769), deployed 2026-02-12
> **PRODUCER-ONBOARD-01 DONE** — 5 PRs merged (#2760–#2765), deployed 2026-02-12

---

## NEXT (correct priority — marketplace-first)

| # | Pass ID | What | Why | Scope |
|---|---------|------|-----|-------|
| 1 | **COD-COMPLETE** | Cash on Delivery fully working | Most Greek customers prefer COD | Backend |
| 2 | **ADMIN-PRODUCERS** | Admin UI polish for producer management | Better UX for approve/reject flow | Frontend |
| 3 | **UX-POLISH-01** | Empty states, loading skeletons, error handling | Professional feel | Frontend only |

**Note**: REORDER-01, OAUTH-GOOGLE-01 deprioritized — nice-to-have, not core flow.

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **Resend (Email)** | ✅ ENABLED |
| **Viva Wallet** | ❌ NOT IMPLEMENTED (backend stub only) |

---

## Recently Done (last 10)

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
- **Payment**: Stripe Checkout Sessions + webhooks. Viva NOT working.
- **Producer routes**: `/producer/*` (dashboard, orders), `/my/products/*` (product CRUD)
- **Deploy**: `ssh dixis-prod` → `cd /var/www/dixis/current && git pull origin main && cd frontend && npm run build && pm2 restart dixis-frontend && pm2 save`

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/OPS/STATE.md` | Detailed pass records |
| `docs/AGENT/SOPs/` | Standard operating procedures |
| `docs/PRODUCT/PRD-AUDIT.md` | Feature gap analysis |

---

_Lines: ~100 | Target: ≤150_
