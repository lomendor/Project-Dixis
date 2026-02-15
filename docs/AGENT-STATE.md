# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-15 (BACKLOG — master roadmap created from owner's PRD)

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

**S1-01: Cultivation Type** — Adding cultivation_type field (organic, biodynamic, etc.) to products. PR pending.

---

## NEXT — See `docs/BACKLOG.md`

The master backlog is now at **`docs/BACKLOG.md`**. It has 6 stages, prioritized by business impact:

| Stage | Theme | Key Items |
|-------|-------|-----------|
| **1** | Trust & Core Commerce | Cultivation type, Reviews, Q&A, Wishlist, Certifications |
| **2** | UI/UX Polish | Homepage redesign, Product cards, Mobile audit, Loading states |
| **3** | Growth & Engagement | Cost transparency, Seasonal calendar, Cart abandonment, SEO |
| **4** | Differentiators | Virtual tours, **Adopt-a-Tree**, Pre-orders, Limited editions |
| **5** | B2B & Revenue | Business registration, Subscription plans, Bulk orders |
| **6** | Community & Vision | Forum, Courses, Carbon footprint, Referral program |

**Current focus: Stage 1. S1-01 (Cultivation Type) in progress.**

**Previous note**: Architecture audit resolved. H1 Phase 1+2 done, L6 i18n unified.

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED (frontend flag + key deployed 2026-02-13) |
| **COD (Cash on Delivery)** | ✅ ENABLED (+€4.00 fee) |
| **Resend (Email)** | ✅ ENABLED |
| **Viva Wallet** | ❌ NOT IMPLEMENTED (backend stub only) |

---

## Recently Done (last 10)

- **ADMIN-NOTIFY-01** — Admin email notification when new order placed: AdminNewOrder Mailable, Greek Blade template (order total, customer, payment method, admin link), hooked into OrderEmailService as Step C. Idempotent, feature-flagged. ADMIN_NOTIFY_EMAIL set on prod. (PR #2905, deployed 2026-02-15) ✅
- **BRAND-COLOR-UNIFY-04** — Brand color round 4: auth pages (login, register, forgot/reset-password, verify-email), CartClient, CartBadge, CustomerDetailsForm, track page, Toast, FilterStrip — all gray→neutral, green/emerald→primary. (PR #2904, deployed 2026-02-15) ✅
- **PALETTE-REFRESH** — Freshen brand palette: primary #0f5c2e→#1a7a3e (brighter), new primary-light #1f8f48, Hellenize Navigation labels (all Greek). (PR #2903, deployed 2026-02-15) ✅
- **BRAND-COLOR-UNIFY-03** — Brand color round 3: shared components (Navigation, CategoryStrip, ProductCard, ProductSearchInput, AddToCartButton, PaymentMethodSelector, ProducerCard). Eliminates last emerald + off-brand green/gray in customer-facing UI. (PR #2901, deployed 2026-02-15) ✅
- **BRAND-COLOR-UNIFY-02** — Brand color round 2: homepage (HomeClient.tsx) hero/filters/product cards, Add-to-Cart button, loading skeletons — all gray→neutral, green→primary. (PR #2899, deployed 2026-02-15) ✅
- **BRAND-COLOR-UNIFY-01** — Unify all storefront pages to brand color palette: gray→neutral, emerald/blue/green→primary across 9 files (cart, checkout, success, order, thank-you, products, Stripe payment). Zero logic changes, pure visual consistency. (PR #2896, deployed 2026-02-15) ✅
- **PRODUCT-DETAIL-POLISH-01** — Product detail page UX: brand-consistent colors (text-blue-600 → text-primary), chevron breadcrumb, inline price+stock layout, producer name above category. (PR #2893, deployed 2026-02-15) ✅
- **OG-SEO-FIX-01** — Fix social sharing previews + structured data: all logo.svg refs → logo.png (real Dixis logo). Delete dead logo.svg route handler + old green abstract SVG + 5 unused Next.js boilerplate SVGs. (PR #2892, deployed 2026-02-15) ✅
- **PHASE-4B: Cart Sync Race Fix** — Version-counter optimistic lock in Zustand cart store. If user adds item during login cart sync, mergeServerCart() merges instead of overwriting — zero item loss. (PR #2890, deployed 2026-02-15) ✅
- **UI-POLISH: Favicon + Minimal Header** — Replaced all icons (favicon, PWA, apple-touch) with correct Dixis logo (fruits/leaves). Removed Επικοινωνία from header nav (footer only). Cleaner, more minimal navigation. (PRs #2885-#2887, deployed 2026-02-15) ✅
- **PHASE-4A: Zod API Validation** — Non-blocking Zod schemas for 12 critical API response endpoints (Product, Order, ShippingQuote, User, Auth, PaymentConfig). Validates at runtime, logs mismatches to Sentry, never crashes. Also fixed CI E2E setup (mock_session cookie for middleware auth). (PR #2883, deployed 2026-02-15) ✅
- **GREEK-UI-POLISH** — Hellenize last English strings: SkipLink ("Μετάβαση στο περιεχόμενο"), Email labels ("Ηλ. Ταχυδρομείο"). Fixed /producers public route (exact segment matching in requiresAuth). (PRs #2879, #2881, deployed 2026-02-15) ✅
- **STRATEGIC-FIX-2B + V1-REALITY-SYNC** — Middleware auth for /producer, /admin, /account, /ops (cookie-based redirect to login). Updated all PRD docs to match production reality (email, Stripe, verification all DONE). Email system verified e2e. (PRs #2872-#2876, deployed 2026-02-15) ✅
- **SECURITY-AUDIT-FIX-01** — Deep functional audit found CRITICAL: GET /api/v1/public/orders exposed ALL orders without auth. Fixed: removed public order list/detail routes, added UUID-based order lookup (by-token), thank-you page uses token not ID, commission-preview requires auth. Also fixed: homepage product images, producers location field mapping, PM2 env vars for standalone. (PRs #2826-#2828, deployed 2026-02-13) ✅
- **LAUNCH-POLISH-01** — Hellenize ALL metadata (title, description, OG, Twitter, JSON-LD, manifest). Rebrand "Project Dixis" → "Dixis". Remove fake "500+" social proof. Enable card payments on prod (Stripe flag + publishable key). (PRs #2802, #2804, deployed 2026-02-13) ✅
- **UX-QUICK-WINS-01** — Hellenize all English UI strings (HomeClient filters/cards, contact, waitlist, order-lookup, footer). Rewrite 404/500 error pages with proper layout + CTAs. New `/faq` page (Greek accordion). (deployed 2026-02-12) ✅
- **L6-I18N-UNIFY** — Remove next-intl, unify on LocaleContext. Delete deprecated CheckoutClient.tsx (561 LOC). Architecture audit 100% resolved. (deployed 2026-02-12) ✅
- **H1-ORDER-MODEL Phase 2** — Proxy admin order detail/summary to Laravel API. Remaining: status+bulk routes still use Prisma Order (email/audit coupling) (deployed 2026-02-12) ✅
- **H1-ORDER-MODEL Phase 1** — Delete CheckoutOrder model (never populated in prod), 8 dead routes/pages, orderStore.ts. Stub admin detail/summary. Remaining: Prisma Order (Phase 2) (deployed 2026-02-12) ✅
- **AUDIT-CLEANUP-02** — Delete 3 orphaned order pages + producer DELETE route, convert 3 inline-style files to Tailwind, mark 5 audit items WONTFIX/DEFER (deployed 2026-02-12) ✅
- **CONSOLE-CLEANUP** — Remove PII from logs (phone/email in 4 files), remove 30+ debug console.log from 6 files (PR #2792, deployed 2026-02-12) ✅
- **CSP-FIX + PRISMA-IMPORT-UNIFY** — Delete dead `csp.ts` (localhost in CSP), unify all Prisma imports to `@/lib/db/client`, delete 2 deprecated shim files (PR #2789, deployed 2026-02-12) ✅
- **ORDER-CONSOLIDATE** — Delete 5 duplicate tracking APIs/pages (169 LOC), fix email tracking link + confirmation page to use canonical `/track/` path (PR #2788, deployed 2026-02-12) ✅
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
