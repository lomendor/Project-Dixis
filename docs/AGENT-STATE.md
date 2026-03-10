# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-03-10 (Action plan locked)

> **This is THE entry point.** Read this first on every agent session. Single source of truth.
> **Then read**: `docs/AGENT/CONTEXT-BOOT.md` — full operational context, deploy procedures, architecture, permissions.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health** | `/api/healthz` (200 = OK) |
| **SSH** | `ssh dixis-prod` (alias, key: `dixis_prod_ed25519_20260115`) |
| **Ports** | 3000 (frontend via PM2), 3001 (Umami analytics via PM2), backend via PHP-FPM unix socket |
| **Goal** | Real marketplace — real producers, real products, real customers |

---

## Full Functional Audit (2026-02-11)

### What WORKS end-to-end
- **Customer**: register → login → browse → cart → checkout → Stripe pay → email confirm → order history ✅
- **Producer**: register → onboarding V2 (docs + categories + compliance) → admin approve → add products → see orders ✅
- **Admin**: phone OTP login → dashboard stats → manage orders → bulk status update → approve producers with docs ✅
- **Shipping**: cost calc by postal code + weight, per-producer free threshold, **COD** (+€4 fee) ✅
- **Email**: Resend integration, Greek templates, idempotent (no double-sends) ✅
- **Commission System**: Configurable rules (B2C/B2B, per-producer, per-category, amount tiers), wired to checkout, admin CRUD + preview calculator, producer sees breakdown on orders, feature flag toggle in admin settings. **Flag OFF in production** — ready to activate. ✅
- **Payout Infrastructure**: IBAN field on producer profile, monthly settlement generation command (14-day hold, €20 minimum), admin settlement dashboard (view/pay/cancel), producer payout history page, CSV export for bank transfers. **Ready to use when commission flag is activated.** ✅
- **Categories**: 10 definitive locker-compatible categories, unified backend + frontend, Wolt-style cards with custom 3D icons ✅
- **B2B Wholesale**: Business role + registration (admin approval required), annual subscription (Stripe Checkout, €120/yr), commission wiring (0% subscriber / 7% non-subscriber), B2B-only product visibility, business dashboard + subscription page, admin businesses CRUD. **Deployed, ready for first business signup.** ✅

### What is BROKEN or MISSING
- **Producer Registration**: ✅ FIXED (PRODUCER-ONBOARD-01)
- **Producer Onboarding Flow**: ✅ FIXED
- **Admin Approve Producers**: ✅ FIXED (ADMIN-PRODUCERS)
- **Viva Wallet**: ✅ REMOVED (VIVA-CLEANUP)
- **Seed Data**: ✅ FIXED (SEED-DATA-FIX)
- **20 stale PRs**: ✅ FIXED (STALE-PR-CLEANUP)

---

## WIP (max 1)

**Mobile polish + Legal disclaimers** — while founder handles business steps (see Action Plan below).

---

## ACTION PLAN — LOCKED 2026-03-10

> **This plan does NOT change between sessions.** Every new chat reads this and continues, not restarts.
> **Status updates**: Mark items ✅ as completed. Do NOT reorganize or reprioritize.

### FOUNDER (Panagiotis) — Business steps:

| # | Action | Status | Notes |
|---|--------|--------|-------|
| F1 | Send 4 PDFs to accountant, request meeting | ⏳ | PDFs: ~/Desktop/Dixis/Logistis/ |
| F2 | Send 2 PDFs to lawyer, request meeting | ⏳ | PDFs: ~/Desktop/Dixis/Dikigoros/ |
| F3 | Call 1st producer — register at dixis.gr/producer/register | ⏳ | Admin approve after signup |
| F4 | Call 2nd producer | ⏳ | After F3 works |
| F5 | Call 3rd producer | ⏳ | After F3 works |
| F6 | Accountant meeting → answers to PENDING-EXTERNAL.md | ⏳ | Unblocks IKE + invoicing |
| F7 | Lawyer meeting → producer contract + ToS | ⏳ | Unblocks legal launch |
| F8 | IKE formation (after accountant guidance) | ⏳ | Unblocks real revenue |
| F9 | 5 test orders (friends/family) | ⏳ | After 1st producer live |

### CTO (Agent) — Technical steps (parallel):

| # | Action | Status | Depends on |
|---|--------|--------|-----------|
| T1 | S0-06: Legal disclaimers on product pages | ✅ | Nothing |
| T2 | S2-05: Mobile audit + fixes | ✅ | Nothing |
| T3 | S0-09: Direct Charges code prep (build, don't deploy) | ⏳ | Nothing |
| T4 | S0-11: DAC7 fields code prep (build, don't deploy) | ⏳ | F6 confirms fields |
| T5 | Deploy Direct Charges | ⏳ | F6 + F7 confirm flow |
| T6 | Deploy DAC7 fields | ⏳ | F6 confirms requirements |
| T7 | Activate commission flag | ⏳ | F8 (IKE formed) |

### Milestones:

| Milestone | What it means | Blocked by |
|-----------|--------------|------------|
| **M1: First producer live** | Real products on dixis.gr | F3 |
| **M2: First test order** | End-to-end flow proven with real money | M1 + F9 |
| **M3: Legal clearance** | IKE + contract + ToS | F6 + F7 + F8 |
| **M4: Real launch** | Commission ON, production mode | M1 + M2 + M3 |

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
- Strategy: B2C live + B2B infrastructure deployed. Onboard producers → validate → activate
- Fixed costs: ~€150/month (accountant only). Marketing starts at €0 (organic)
- First target: €150/mo commission (covers accountant) = ~€1,500/mo GMV at 10%
- Action: Onboard 3 producers → first 20 orders → measure → then decide spend

**Feature backlog (active):** `docs/BACKLOG.md`
**Next from backlog:** S2-05 (Mobile audit), S1-03 (Q&A), S5-03 (Bulk orders).
**Completed:** S1-01 ✅ S1-02 ✅ S1-04 ✅ S3-01 ✅ S3-04 ✅ S2-06 ✅ S5-01 ✅ S5-02 ✅ + housekeeping + hardening.

**User-reported issues:** Product renaming (improve Greek product names)

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED (frontend flag + key deployed 2026-02-13) |
| **COD (Cash on Delivery)** | ✅ ENABLED (+€4.00 fee) |
| **Resend (Email)** | ✅ ENABLED |
| **Umami Analytics** | ✅ ENABLED — Self-hosted, cookieless, proxied via `/u/*` |
| **Viva Wallet** | ❌ REMOVED — All dead code deleted (PR #2971, VIVA-CLEANUP) |

---

## Recently Done (last 10)

- **B2B-WHOLESALE-SYSTEM** — Full-stack B2B wholesale buyer system: business role + model, admin approval workflow, subscription infrastructure (Stripe Checkout, €120/yr), commission wiring (0% subscriber / 7% non-subscriber), B2B product visibility (is_b2b_only + "Χονδρική" badge), business dashboard + subscription page, admin businesses CRUD. 9 commits, 40 files, ~1,330 LOC. (PR #3277, deployed 2026-03-09) ✅
- **SEO + SKELETON + WISHLIST** — SEO: meta title shortened, JSON-LD enriched, Contact/FAQ metadata. Skeleton loaders for 5 pages. S1-04 Wishlist: heart toggle, favorites page, nav links. B2B research doc. (PR #3272, 2026-03-04) ✅
- **ANALYTICS-UMAMI-01** — Self-hosted Umami v3.0.3 analytics on VPS. Cookieless, GDPR-compliant. First-party proxy `/u/*`. (PR #3269, deployed 2026-03-02) ✅
- **FIX-CART-LEAK-01** — Cart cross-user leakage fix. `clearCartStorage()` on login/logout. (PR #3268, deployed 2026-03-02) ✅
- **ADMIN-SESSION-FIX** — Fixed admin session dropping after 2-3 pages ("jwt malformed"). Root cause: Laravel session cookie `dixis_session` collided with Next.js JWT cookie of same name. Cookie renamed to `dixis_jwt` across 14 files. Also: unified `getLaravelInternalUrl()` in 12 admin routes, added admin logout button + diagnostic logging. Live verified 12/12 admin pages with zero drops. (PRs #3165-#3167, deployed 2026-02-24) ✅
- **GREEK-READINESS-AUDIT** — Full Greek market readiness: 25 English string leaks fixed across 15 files (auth, storefront, account, producer, admin). Currency ✅ (`el-GR` Intl format), postal codes ✅ (5-digit + city cross-validation), AFM ✅ (9-digit), IBAN ✅ (GR prefix). VAT 24% mainland ✅, island 13% deferred to post-MVP. (PR #3104, deployed 2026-02-22) ✅
- **SECURITY-HARDENING** — crypto OTP (not Math.random), open redirect fix, S3 path guard, JWT secret validation, checkout endpoint hardening, cart quantity limits, payment provider validation. (PRs #3098-#3099, deployed 2026-02-22) ✅
- **ONBOARDING-V2** — Producer onboarding: doc uploads (TAXIS, EFET, HACCP), product categories, bank details (IBAN), conditional fields (honey→beekeeper, cosmetics→CPNP). E2E smoke tests. (PRs #3095 + #3103, deployed 2026-02-22) ✅
- **MIDDLEWARE-REDIRECT-FIX** — Auth redirect in standalone mode behind nginx was sending users to localhost:3000. Fixed via Host header override. (PRs #3101-#3102, deployed 2026-02-22) ✅
- **EU-MARKETPLACE-READINESS** — EU 1169/2011 allergens/ingredients, IBAN field, shipping threshold fix. (PR #3097, deployed 2026-02-22) ✅
_(Older entries archived — see `docs/OPS/STATE.md`)_

---

## Guardrails

- **WIP limit = 1** — One item in progress at any time
- **PR size ≤300 LOC** — May need multiple PRs for large features
- **Workflow changes only if broken** — `.github/workflows/**` locked unless deploy/CI is failing
- **Docs inside PR** — No separate docs-only PRs (update AGENT-STATE in same PR)
- **Deploy**: Auto-deploy via GitHub Actions WORKING (verified 2026-02-28). Manual fallback: `ssh dixis-prod` → PM2 restart only (do NOT git pull + build, rsync --delete will overwrite)

---

## After Completing a Pass

1. Update this file (WIP → Recently Done, update audit status if relevant)
2. Add entry to `docs/OPS/STATE.md` (top)
3. Verify prod: `curl -sI https://dixis.gr/api/healthz`

---

## Key Technical Notes

- **Auth**: Email + password (customers/producers), Phone OTP (admin only)
- **Product SSOT**: Laravel/PostgreSQL — frontend proxies via `apiClient` (`src/lib/api.ts`)
- **Cart**: Zustand store + server sync, keyed by Laravel integer IDs. `clearCartStorage()` on login/logout prevents cross-user leakage.
- **Payment**: Stripe Checkout Sessions + webhooks. **COD** enabled (+€4 fee, admin confirms). Viva REMOVED.
- **Producer routes**: `/producer/*` (dashboard, orders, products, settings, analytics, settlements) — all wrapped in sidebar layout. `/my/*` routes are redirect stubs only.
- **Categories**: 10 unified slugs in both backend + frontend. `toStorefrontSlug()` bridge in `category-map.ts`.
- **i18n**: Single `i18n.ts` config file + `messages/` directory (el.json, en.json). NOT an `i18n/` directory.
- **Deploy (auto)**: `deploy-frontend.yml` builds standalone bundle, rsync to VPS, restores .env, PM2 restart, 20x health proof. **WORKING** (verified 2026-02-28).
- **Analytics**: Umami v3.0.3 self-hosted at `/var/www/dixis/umami/`, PM2 on port 3001. Cookieless (no GDPR consent needed). Proxied via Next.js rewrite `/u/*` → `localhost:3001/*`. Dashboard: SSH tunnel `ssh -L 3001:localhost:3001 dixis-prod` → `http://localhost:3001`. Default credentials: admin/umami (**CHANGE THIS**).
- **Deploy (manual fallback)**: `ssh dixis-prod` → `cd /var/www/dixis/current/frontend && pm2 restart dixis-frontend`. Do NOT `git pull` + `npm run build` — the VPS directory is managed by rsync `--delete`.

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/AGENT/CONTEXT-BOOT.md` | **Cold start brain** — architecture, deploy, permissions, pitfalls |
| `docs/OPS/STATE.md` | Detailed pass records |
| `docs/AGENT/SOPs/` | Standard operating procedures |
| `docs/PRODUCT/PRD-AUDIT.md` | Feature gap analysis |
| `docs/PRODUCT/ARCH-AUDIT-2026-02-12.md` | Architecture audit backlog |
| `docs/policies/` | Business policies (Producer Agreement, Returns, Content, Delivery, Post-Payout) |
| `docs/BUSINESS-REVIEW-2026-02.md` | Financial plan analysis & realistic projections |
| `docs/OPS-QUICK-REFERENCE.md` | Daily ops cheat sheet — "τι κάνω ΤΩΡΑ όταν..." |
| `docs/LAUNCH-CHECKLIST-7DAY.md` | 7-day launch plan with checkboxes |
| `docs/B2B-READINESS.md` | B2B preparation: invoicing, providers, implementation plan |

---

_Lines: ~154 | Target: ≤150_
