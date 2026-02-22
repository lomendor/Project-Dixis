# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-22 (EU food compliance: allergens, ingredients, producer EFET/agreement)

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
- **Commission System**: Configurable rules (B2C/B2B, per-producer, per-category, amount tiers), wired to checkout, admin CRUD + preview calculator, producer sees breakdown on orders, feature flag toggle in admin settings. **Flag OFF in production** — ready to activate. ✅
- **Payout Infrastructure**: IBAN field on producer profile, monthly settlement generation command (14-day hold, €20 minimum), admin settlement dashboard (view/pay/cancel), producer payout history page, CSV export for bank transfers. **Ready to use when commission flag is activated.** ✅
- **Categories**: 10 definitive locker-compatible categories, unified backend + frontend, Wolt-style cards with custom 3D icons ✅

### What is BROKEN or MISSING
- **Producer Registration**: ✅ FIXED (PRODUCER-ONBOARD-01)
- **Producer Onboarding Flow**: ✅ FIXED
- **Admin Approve Producers**: ✅ FIXED (ADMIN-PRODUCERS)
- **Viva Wallet**: ✅ REMOVED (VIVA-CLEANUP)
- **Seed Data**: ✅ FIXED (SEED-DATA-FIX)
- **20 stale PRs**: ✅ FIXED (STALE-PR-CLEANUP)

---

## WIP (max 1)

**None** — Ready for next task. CI is GREEN.

---

## NEXT — Feature Backlog

**Commission + Payout infrastructure DONE. Waiting for real producers + orders.**

**Owner decisions (locked 2026-02-16):**
- Commission activation: after 1st real producer order
- B2C rate: 12% (seeded), Payout: Monthly (1st of month), Min: €20, Hold: 14 days
- IBAN: collected before 1st payout (optional at onboarding)

**Business context (reviewed 2026-02-21):**
- Capital: ~€5K (budget very tight, old plans of €40K/€81.5K are OUTDATED)
- 3 producers already interested (trial, 0% commission initially)
- Strategy: B2C first → B2B after validation. No B2B features needed yet
- Fixed costs: ~€150/month (accountant only). Marketing starts at €0 (organic)
- Realistic Year 1: 10-15 producers, €2.5-4K commission revenue
- First target: €150/mo commission (covers accountant) = ~€1,500/mo GMV at 10%
- Action: Onboard 3 producers → first 20 orders → measure → then decide spend
- Full analysis: `docs/BUSINESS-REVIEW-2026-02.md`

**Feature backlog (paused):** `docs/BACKLOG.md` — resumes after 5 real producers + 10 real orders.
**Next from backlog:** S1-03 (Q&A), S1-04 (Wishlist), S1-05 (Certifications).
**Completed from backlog:** S1-01 ✅ Cultivation Type, S1-02 ✅ Reviews & Ratings, S3-01 ✅ Cost Transparency, HOUSEKEEPING ✅ SEO + TODO cleanup + a11y, HARDENING-5PR ✅ Security + dead code + resilience.

**User-reported issues (for later):**
- Product renaming (improve Greek product names)
- ~~Photo mismatch~~ ✅ FIXED (PR #3056, migration syncs image_url from product_images)

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED (frontend flag + key deployed 2026-02-13) |
| **COD (Cash on Delivery)** | ✅ ENABLED (+€4.00 fee) |
| **Resend (Email)** | ✅ ENABLED |
| **Viva Wallet** | ❌ REMOVED — All dead code deleted (PR #2971, VIVA-CLEANUP) |

---

## Recently Done (last 10)

- **EU-FOOD-COMPLIANCE** — EU 1169/2011 allergens (14 mandatory) + ingredients on products. Producer EFET food license number + agreement acceptance fields. Frontend: create/edit forms with allergens checkboxes + ingredients textarea, customer-facing allergens badges + ingredients display, admin compliance warnings in moderation queue. Backend: 2 migrations (allergens JSON + ingredients text on products, food_license_number + agreement_accepted_at on producers). (PR #3090, deployed 2026-02-22) ✅
- **BUSINESS-POLICIES** — About page claims fixed (no more "χαμηλότερη"), 5 policy docs created (Producer Agreement, Return/Refund, Content Guidelines, Delivery Confirmation, Post-Payout Refund), 3 financial safeguards added. Financial plan reviewed — old plans outdated, realistic model agreed. (PR #3087, deployed 2026-02-21) ✅
- **TECH-DEBT-CLEANUP** — Deploy workflow fix (`cp -r i18n` → `cp i18n.ts`), 36 stale issues closed (50→14), 100+ stale branch refs pruned, STATE.md archived (1024→48 lines). E2E stabilized: `networkidle` → `domcontentloaded`, `goto('/')` ERR_ABORTED fixed in payment tests, auth hydration timing fix. (PRs #3075-#3080, merged 2026-02-21) ✅
- **MONITORING-CLEANUP** — Fixed false alarm epidemic: production-smoke 307 redirect bug, uptime-ping dedup, disabled 10 redundant legacy cron workflows, closed 14 stale auto-generated P0/P1 issues. (PR #3075, merged 2026-02-21) ✅
- **IMAGE-SYNC-FIX** — Fixed photo mismatch bug: 7/17 products showed different image on card vs detail. Migration syncs `products.image_url` from `product_images`. (PR #3056, deployed 2026-02-19) ✅
- **CATEGORY-UNIFY-10** — Unified 14 backend + 9 frontend categories into exactly 10 definitive locker-compatible categories. (PRs #3052-#3054, deployed 2026-02-19) ✅
- **UI-REDESIGN-10PHASES** — Premium marketplace visual overhaul (17 PRs): cream backgrounds, gold accents, Wolt-style category cards, custom 3D icons. (PRs #3038-#3050, deployed 2026-02-17–19) ✅
- **HARDENING-5PR** — Production hardening: Viva dead code removed, dead stubs deleted, robots.txt expanded, cart TTL. (PRs #2971-#2977, deployed 2026-02-17) ✅
- **CI-E2E-GREEN** — Fixed E2E from 100% fail → 100% pass (96 tests). SSR fetch fallback, glob pattern fix, checkout skip in CI. (PRs #2962-#2963, deployed 2026-02-17) ✅
- **S3-01: COST-TRANSPARENCY** — Green trust badge on product detail: "88% στον παραγωγό / 12% πλατφόρμα". (PR #2960, deployed 2026-02-16) ✅
- **PAYOUT-INFRASTRUCTURE** — Complete payout: IBAN field, settlement generation, admin dashboard, producer history, CSV export. (PRs #2952-#2958, deployed 2026-02-16) ✅
- **COMMISSION-ENGINE** — Commission system wired to checkout, admin CRUD, feature flag, producer breakdown. Flag OFF — ready to activate. (PRs #2932-#2935, deployed 2026-02-16) ✅

---

## Guardrails

- **WIP limit = 1** — One item in progress at any time
- **PR size ≤300 LOC** — May need multiple PRs for large features
- **Workflow changes only if broken** — `.github/workflows/**` locked unless deploy/CI is failing
- **Docs inside PR** — No separate docs-only PRs (update AGENT-STATE in same PR)
- **Deploy**: Auto-deploy via GitHub Actions currently broken (SSH key issue). Manual: `ssh dixis-prod` → SOP below

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
- **Payment**: Stripe Checkout Sessions + webhooks. **COD** enabled (+€4 fee, admin confirms). Viva REMOVED.
- **Producer routes**: `/producer/*` (dashboard, orders), `/my/products/*` (product CRUD)
- **Categories**: 10 unified slugs in both backend + frontend. `toStorefrontSlug()` bridge in `category-map.ts`.
- **i18n**: Single `i18n.ts` config file + `messages/` directory (el.json, en.json). NOT an `i18n/` directory.
- **Deploy (manual)**: `ssh dixis-prod` → `cd /var/www/dixis/current && git pull origin main && cd frontend && npm run build && pm2 restart dixis-frontend && pm2 save`
- **Deploy (auto)**: `deploy-frontend.yml` builds standalone bundle, copies `static/`, `public/`, `messages/`, `i18n.ts` into `.next/standalone/`, rsync to VPS. **Currently broken** — SSH precheck fails (exit 255).

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/OPS/STATE.md` | Detailed pass records |
| `docs/AGENT/SOPs/` | Standard operating procedures |
| `docs/PRODUCT/PRD-AUDIT.md` | Feature gap analysis |
| `docs/PRODUCT/ARCH-AUDIT-2026-02-12.md` | Architecture audit backlog |
| `docs/policies/` | Business policies (Producer Agreement, Returns, Content, Delivery, Post-Payout) |
| `docs/BUSINESS-REVIEW-2026-02.md` | Financial plan analysis & realistic projections |
| `docs/OPS-QUICK-REFERENCE.md` | Daily ops cheat sheet — "τι κάνω ΤΩΡΑ όταν..." |
| `docs/LAUNCH-CHECKLIST-7DAY.md` | 7-day launch plan with checkboxes |

---

_Lines: ~130 | Target: ≤150_
