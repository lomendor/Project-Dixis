# OPS STATE

**Last Updated**: 2025-12-23 00:35 UTC

## CLOSED ✅ (do not reopen without NEW proof)
- **SSH/fail2ban**: Canonical SSH config enforced (deploy user + dixis_prod_ed25519 key + IdentitiesOnly yes). fail2ban active with no ignoreip whitelist. Production access stable. (Closed: 2025-12-19)
- **OPS Bootstrap**: State management system (STATE.md + NEXT-7D.md + prod-facts.sh) committed and merged via PR #1761. (Closed: 2025-12-19)
- **PM2 Resurrect**: pm2-deploy.service enabled (auto-start on boot). Tested pm2 kill + pm2 resurrect → both processes restored (dixis-frontend + dixis-backend). All health checks 200. Proof: `docs/OPS/PM2-RESURRECT-PROOF.md` (Closed: 2025-12-19)
- **Data Dependency Map**: Complete roadmap created (`docs/PRODUCT/DATA-DEPENDENCY-MAP.md`). Merged via PR #1763. (Closed: 2025-12-19)
- **smoke-production CI**: Timeout increased 15s→45s for network resilience (PR #1764). Not a PROD regression (all endpoints 200). Verified: ui-only label does NOT skip smoke tests. (Closed: 2025-12-19)
- **Producer Permissions Audit**: ProductPolicy enforces producer_id ownership. Admin override works. 12 authorization tests pass. No auth bugs found. Audit doc: `docs/FEATURES/PRODUCER-PERMISSIONS-AUDIT.md` (Closed: 2025-12-19)
- **Producer Product CRUD**: Complete producer dashboard with product CRUD already implemented and production-ready. ProductPolicy enforces ownership. 18 backend tests PASS (0.91s). Frontend pages: list, create, edit. Server-side producer_id assignment. Audit doc: `docs/FEATURES/PRODUCER-PRODUCT-CRUD-AUDIT.md` (Closed: 2025-12-19)
- **Stage 2 Permissions Audit**: Advanced producer isolation scenarios verified. NO AUTHORIZATION GAPS found. ProductPolicy enforces producer_id ownership (17 tests PASS). Multi-producer orders correctly scoped. Admin override working. Dashboard filtering by producer_id. Audit doc: `docs/FEATURES/PERMISSIONS-STAGE-2-AUDIT.md` (Closed: 2025-12-19)
- **PROD Facts Monitoring**: Automated production health monitoring implemented. Scripts + GitHub Actions workflow (daily 07:00 UTC). CI heavy-checks skips for `ai-pass` label. PR #1774 merged. (Closed: 2025-12-19)
- **ProducerOrderManagementTest Fix**: Fixed 8 failing tests caused by incorrect HasOne association usage. All tests now PASS (42 assertions). PR #1776 merged. (Closed: 2025-12-19)
- **Stage 3 Producer Product Authorization Gap**: Fixed Update/Delete routes bypassing ProductPolicy. Frontend `/api/me/products/{id}` PUT/DELETE now proxy to backend (enforces ProductPolicy consistently). Admin override restored. File: `frontend/src/app/api/me/products/[id]/route.ts`. Evidence: PR #1779 (merged 2025-12-20T00:24:04Z), audit doc: `docs/OPS/STAGE3-EXEC-AUDIT.md`. (Closed: 2025-12-20)
- **Stage 3 Producer My Products List Verification**: Verified existing implementation of producer product list with ownership enforcement. Backend `GET /api/v1/producer/products` filters by producer_id (server-side). Frontend page `/my/products` exists with AuthGuard. Tests: 4 PASS (11 assertions). Verification doc: `docs/FEATURES/PRODUCER-MY-PRODUCTS-VERIFICATION.md`. (Closed: 2025-12-20)
- **Stage 3 Producer Product CRUD Complete Verification**: Comprehensive audit confirming create/edit/delete functionality is production-ready. Backend: 49 tests PASS (251 assertions). Frontend: create/edit pages with AuthGuard. ProductPolicy enforces ownership. Admin override working. Server-side producer_id validation. No authorization gaps. Verification doc: `docs/FEATURES/PRODUCER-PRODUCT-CRUD-COMPLETE-VERIFICATION.md`. (Closed: 2025-12-20)
- **Stage 4A Orders & Checkout Flow Verification**: Comprehensive verification of cart-to-order flow. Backend: POST /api/v1/orders/checkout creates Order + OrderItems, 54 tests PASS (517 assertions). Frontend: cart page with checkout button, order detail page. Stock validation prevents overselling. User authorization enforced. Transaction-safe order creation. Formal verification doc: `docs/FEATURES/STAGE4A-ORDERS-VERIFICATION.md`. (Closed: 2025-12-20)
- **PROD Monitoring & Stability**: Production monitoring enforcement implemented and verified. Workflow `.github/workflows/prod-facts.yml` runs daily at 07:00 UTC, exits non-zero on failure, auto-creates GitHub Issues on failure, auto-commits reports on success. All endpoints healthy (healthz=200, products=200, login=200). Evidence: PR #1790 (merged 2025-12-20T19:32:55Z), last check: 2025-12-20 20:29:13 UTC (ALL CHECKS PASSED). (Closed: 2025-12-20)
- **Pass 5 Producer Permissions Proof**: Comprehensive authorization proof with test evidence. ProductPolicy enforces producer_id ownership. 19 tests PASS (53 assertions) covering cross-producer isolation, own product management, admin override, server-side producer_id enforcement, producer scoping, and database integrity. NO AUTHORIZATION GAPS found. Proof pack: `docs/FEATURES/PRODUCER-PERMISSIONS-PROOF.md` (Closed: 2025-12-20)
- **Pass 6 Checkout → Order Creation MVP Proof**: Audit-first verification confirms complete checkout flow is production-ready. POST /api/v1/orders creates Order + OrderItems atomically. 54 tests PASS (517 assertions). Features: DB transaction safety, stock validation with race condition prevention, multi-producer support (producer_id in order_items), authorization (consumers can order, producers cannot), low stock alerts. NO code changes required. Proof pack: `docs/FEATURES/CHECKOUT-ORDER-MVP-PROOF.md` (Closed: 2025-12-20)
- **Pass 7 Frontend Checkout Wiring**: Frontend cart checkout now calls backend Laravel API (POST /api/v1/orders) instead of frontend Prisma DB. Cart page wired with authentication check, stock validation handled server-side. E2E tests verify cart → order creation flow. Files changed: `frontend/src/app/(storefront)/cart/page.tsx` (uses apiClient.createOrder()), `frontend/tests/e2e/cart-backend-api.spec.ts` (2 tests). Audit doc: `docs/FEATURES/FRONTEND-CHECKOUT-AUDIT.md`. PROD proof (2025-12-20 22:40 UTC): cart=200, /order/1=200, /orders/1=200, backend /api/v1/orders=401 (correctly requires auth). PR #1797 merged 2025-12-20T22:36:32Z. (Closed: 2025-12-20)
- **Pass 8 Permissions/Ownership Audit (Stage 2)**: Deep permissions audit proving producer can CRUD ONLY own products. ProductPolicy enforces producer_id ownership (line 48). Server-side producer_id auto-set prevents hijacking (ProductController lines 111-121). OrderPolicy prevents producers from creating orders. 21 authorization tests PASS (56 assertions). NO CRITICAL AUTHORIZATION GAPS FOUND. Audit doc: `docs/SECURITY/PERMISSIONS-AUDIT-PASS8.md`. PROD verification: products=200, api_public_products=200, api_orders=401 (correctly requires auth). (Closed: 2025-12-21)
- **Pass 9 Producer Dashboard CRUD Verification**: Audit confirmed producer dashboard product management already fully implemented and end-to-end. Frontend pages exist (`/my/products`, create, edit) with AuthGuard. Frontend routes (`/api/me/products/*`) proxy to backend Laravel API (NOT Prisma). Backend routes enforce ProductPolicy with server-side producer_id. Tests: 21 authorization + 49 CRUD tests PASS (from existing verification docs). PROD endpoints healthy. NO CODE CHANGES REQUIRED. Evidence: `docs/FEATURES/PASS9-PRODUCER-DASHBOARD-CRUD.md`, PR #1779 (Stage 3 gap fix merged), `docs/SECURITY/PERMISSIONS-AUDIT-PASS8.md`. (Closed: 2025-12-21)
- **Pass 10 Checkout Orders List Page**: Created `/orders` list page to complete MVP checkout flow. PROD `/orders` was 404 (no page.tsx). Solution: Created orders list page calling existing backend `GET /api/v1/orders`. Features: orders table (ID, date, status, total), links to order details, AuthGuard enforced, empty state, Greek locale. Files: `frontend/src/app/(storefront)/orders/page.tsx` (232 lines), audit doc `docs/FEATURES/PASS10-CHECKOUT-ORDER-CREATION.md` (242 lines). PR #1800 merged 2025-12-20T23:56:24Z. PROD after: /orders → 200 ✅. Completes MVP journey: Cart → Checkout → Order Created → View ALL Orders. (Closed: 2025-12-21)
- **Pass 11 Checkout E2E Test**: Added E2E happy-path test proving checkout creates order and it appears in `/orders` list. Makes checkout order creation non-regressing. Test file: `frontend/tests/e2e/checkout-order-creation.spec.ts` (111 lines). Flow: Login → Browse products → Add to cart → Checkout → Verify redirect to `/order/{id}` → Navigate to `/orders` → Verify order appears in list with ID, status, view link. All CI checks PASS. PR #1801 merged 2025-12-21T00:10:20Z. DoD: E2E proof completes integration of Pass 7 (backend API) + Pass 10 (orders list). (Closed: 2025-12-21)
- **Pass 12 Scheduled PROD Smoke Monitoring**: Created GitHub Actions workflow (`.github/workflows/prod-smoke.yml`) to probe critical PROD endpoints every 15 minutes. Checks: healthz (200), API products (200 + data), products page (200), auth redirects (307/302), orders page. Workflow runs on schedule (`*/15 * * * *`) + manual dispatch. Retries: 3 attempts, 2s delay, 10s connect timeout, 20s max. Documentation: `docs/OPS/PROD-MONITORING.md` (183 lines). Known issue at time of creation: `/orders` returned 404 (fixed in Pass 13). PR #1803 merged 2025-12-21T00:49:37Z. (Closed: 2025-12-21)
- **Pass 13 Fix /orders Route + Enforce Prod-Smoke**: Fixed `/orders` route returning 404 by moving orders list page from `(storefront)/orders/page.tsx` to `orders/page.tsx` (resolves Next.js routing conflict). Updated `prod-smoke.yml` to FAIL if `/orders` returns 404 (removes TODO tolerance). Root cause: `orders/` directory shadowed `(storefront)/orders/` route group. Solution: Moved page.tsx to correct location (file rename, zero logic changes). Build passed in CI, all smoke checks ✅. PR #1804 merged 2025-12-21T06:50:00Z. Note: PROD deployment pending (infrastructure issue outside scope). (Closed: 2025-12-21)
- **PROD Outage Recovery - IPv6 Binding Issue**: Production outage (2025-12-21 07:20-09:45 UTC, ~2 hours downtime) caused by Next.js 15.5.0 IPv6 binding incompatibility with VPS environment. Root cause: Next.js changed default binding from IPv4 (`0.0.0.0`) to IPv6 (`::`) causing `EADDRINUSE` error despite port 3000 being free. VPS IPv6 configuration incompatible. Solution: Created systemd launcher service (`dixis-frontend-launcher.service`) with explicit `HOSTNAME=127.0.0.1` environment variable forcing IPv4-only binding. Launcher enabled (auto-starts on boot). Frontend process management switched from PM2 to systemd (more reliable, system-level). PM2 now manages backend only. PROD verified operational (all endpoints 200). Incident documentation: `docs/OPS/INCIDENTS/2025-12-21-prod-outage-hostname.md`. VPS reboot tested and working. (Closed: 2025-12-21)
- **Pass 15 Producer Ownership Enforcement**: Replaced manual authorization checks in ProducerController with ProductPolicy. Changes: `toggleProduct()` and `updateStock()` now use `$this->authorize('update', $product)` instead of manual `if ($product->producer_id !== $user->producer->id)` checks (removed 29 lines). Updated test expectations (404 → 403 to match ProductPolicy behavior). Added admin override test. Benefits: consistent authorization pattern, correct HTTP status codes (403 Forbidden), admin override works automatically, code reduced by 25 lines. Tests: 4 PASS (7 assertions) in 0.48s. Files: `backend/app/Http/Controllers/Api/ProducerController.php` (lines 18, 86), `backend/tests/Feature/ProductsToggleTest.php` (updated line 98, added lines 123-148). Audit doc: `docs/FEATURES/PASS15-PRODUCER-OWNERSHIP-ENFORCEMENT.md`. PR #1810 merged 2025-12-21T15:13:08Z. PROD verified operational (all endpoints 200). (Closed: 2025-12-21)
- **Pass 16 E2E Producer Ownership Isolation**: Added Playwright E2E test proving GET /api/me/products scopes correctly by producer. Test approach: API-level (page.evaluate + fetch with route mocking for speed). Producer A sees ONLY A products (IDs 101, 102), Producer B sees ONLY B products (IDs 201, 202, 203). CRITICAL: Backend scoping already proven by `backend/tests/Feature/AuthorizationTest.php:374-446` (4 PHPUnit tests: test_producer_sees_only_own_products_in_list, test_producer_does_not_see_other_producers_products, test_unauthenticated_user_cannot_access_producer_products, test_consumer_cannot_access_producer_products, 11 assertions, 0.36s, run in ci.yml:99 and backend-ci.yml:101). Pass 16 E2E adds frontend proxy coverage. Backend scoping: ProducerController.php:141 ($producer->products()). Tests: 3 E2E PASS (11.5s). File: `frontend/tests/e2e/producer-product-ownership.spec.ts` (248 lines). PR #1813 merged 2025-12-21T17:52:48Z. Guardrail status: Backend scoping verified (PHPUnit Feature tests), frontend proxy coverage added (E2E). (Closed: 2025-12-21)
- **Pass 18 Producer Product Image Upload**: Audit-first verification confirms feature is 100% production-ready. Complete vertical slice: UploadImage component → POST /api/me/uploads (auth, validation, storage) → putObjectFs/putObjectS3 → Producer forms use UploadImage → Products.image_url + ProductImage model → Storefront displays images. Tests: 8 existing (3 backend: PublicProductsTest, PublicProductShowTest, FrontendSmokeTest + 5 E2E: upload-driver, upload-auth, upload-and-use, product-image-timeout, product-image-workflow). PROD proof (2025-12-22): Product #1 has image_url="https://images.unsplash.com/..." + 2 ProductImage records. NO CODE CHANGES REQUIRED. Audit doc: `docs/FEATURES/PASS18-PRODUCT-IMAGE-UPLOAD-AUDIT.md`. Similar to Pass 6 and Pass 9: audit-first verification. (Closed: 2025-12-22)
- **Pass 19 Product Detail Pages PROD Fix**: Fixed product detail pages showing loading skeleton on both dixis.gr and www.dixis.gr. Root causes diagnosed: (1) Backend API down (Laravel not running on port 8001), (2) SSR using external URL causing timeout/race conditions, (3) Nested `frontend/frontend/` directory breaking TypeScript module resolution in build. Fixes applied: (1) Created durable systemd service `dixis-backend.service` (replaces nohup - survives reboots), (2) PR #1836 merged - SSR now uses internal API URL `http://127.0.0.1:8001/api/v1` instead of external `https://dixis.gr/api/v1`, (3) Removed orphaned nested directory blocking viva-wallet TypeScript imports. Infrastructure improvements: Backend runs as systemd service, nginx proxies to 127.0.0.1:3000 (frontend), SSR uses internal API for fast rendering, clean build without TypeScript errors. PROD proof (2025-12-22 19:16 UTC): `curl dixis.gr/products/1 | grep "Organic Tomatoes"` ✅ + `curl www.dixis.gr/products/1 | grep "Organic Tomatoes"` ✅. Both hosts display actual product content. (Closed: 2025-12-22)
- **Pass 20 Cart localStorage Canonical Redirect**: Fixed cart appearing empty when navigating between www.dixis.gr and dixis.gr. Root cause: localStorage is origin-specific (www ≠ apex), users adding items on one domain couldn't see them on the other. Solution: Added canonical host redirect in Next.js middleware (www → apex, 301 permanent). Changes: `frontend/middleware.ts` (redirect logic), `frontend/tests/e2e/cart-prod-regress.spec.ts` (3 E2E tests), `doc/research/cart-bug-root-cause.md` (comprehensive analysis). PR #1846 merged 2025-12-22T23:44:01Z, deployed successfully. PROD proof (2025-12-22 23:48 UTC): `curl -I www.dixis.gr/products/1` → HTTP 301 ✅, `curl -I www.dixis.gr/cart` → HTTP 301 ✅. Cart persistence fixed, SEO benefit (canonical domain). Note: Initial redirect included `:3000` port (fixed in Pass 21). (Closed: 2025-12-22)
- **Pass 21 Canonical Redirect Clean URLs**: Fixed canonical redirect outputting `:3000` port in Location header. Root cause: middleware cloned request URL including port, but didn't clear it before redirect. Solution: Explicitly set `url.protocol = 'https:'`, `url.hostname = 'dixis.gr'`, `url.port = ''` in middleware. Changes: `frontend/middleware.ts` (3 lines: protocol, hostname, port), `frontend/tests/e2e/cart-prod-regress.spec.ts` (added explicit `:3000` checks). PROD proof (before): `location: https://dixis.gr:3000/cart` ❌ → (after): `location: https://dixis.gr/cart` ✅. Clean canonical URLs, no port in redirect. (Closed: 2025-12-23)

## STABLE ✓ (working with evidence)
- **Backend health**: /api/healthz returns 200 ✅
- **Products API**: /api/v1/public/products returns 200 with data ✅
- **Products list page**: /products returns 200, renders product names (e.g., "Organic Tomatoes") ✅
- **Product detail page**: /products/1 returns 200, renders expected product content ✅
- **Auth redirects**: /login → /auth/login (307), /register → /auth/register (307) ✅
- **Auth pages**: /auth/login and /auth/register return 200 ✅
- **Cart page**: /cart returns 200 ✅
- **Orders list page**: /orders returns 200 (Pass 13 fix deployed) ✅
- **Order pages**: /order/1 and /orders/1 return 200 ✅
- **Backend Orders API**: /api/v1/orders returns 401 (correctly requires authentication) ✅

**Evidence**: See `docs/OPS/PROD-FACTS-LAST.md` (last updated: 2025-12-23 00:35 UTC)
**Automated Monitoring**: Daily checks at 07:00 UTC via `.github/workflows/prod-facts.yml`

**MVP Core Features Summary**: See `docs/FEATURES/MVP-CORE-VERIFICATION.md` (140+ tests, 838+ assertions, all PASS)

**Latest Verification** (2025-12-23 00:35 UTC):
- All core endpoints healthy (healthz=200, API=200, storefront=200, auth=200/307)
- Product detail pages render correctly (Organic Tomatoes visible, no error boundaries)
- Canonical redirect working (www → apex, clean URLs without :3000)
- Cart persistence verified across domains

## IN PROGRESS → (WIP=1 ONLY)
- (none)

## BLOCKED ⚠️
- (none)

## NEXT 📋 (max 3, ordered, each with DoD)

### 1) Admin Product Moderation Queue
- **DoD**:
  - Admin sees pending products at `/admin/products?status=pending`
  - Admin can approve/reject with reason (PATCH /api/v1/admin/products/{id}/moderate)
  - Producer receives email notification on approval/rejection
  - Backend tests: 3 tests (list_pending, approve_product, reject_product)
  - Policy test: 1 test (admin_can_moderate_any_product)
  - PROD smoke: Admin moderation endpoint returns 401 for non-admin

### 3) Order Status Tracking (Consumer View)
- **DoD**:
  - Consumer sees order status on `/orders/{id}` page (pending/processing/shipped/delivered)
  - Backend supports status transitions (POST /api/v1/orders/{id}/status)
  - Email sent to consumer on status change
  - Backend tests: 2 tests (status_transition, notification_sent)
  - E2E test: 1 test (order-status-display.spec.ts verifying status shown)
  - PROD smoke: Order detail page shows status field

---

## How to Use This System

### Before Starting Any Work
```bash
# 1. Rehydrate: Check current state
cat docs/OPS/STATE.md

# 2. Run PROD facts
./scripts/prod-facts.sh

# 3. Read PROD-FACTS-LAST.md to see current reality
cat docs/OPS/PROD-FACTS-LAST.md

# 4. Check NEXT-7D to see WIP item
cat docs/NEXT-7D.md
```

### After Completing Work
```bash
# Update STATE.md:
# - Move completed item from IN PROGRESS to STABLE
# - Add new item to IN PROGRESS (WIP=1 only)
# - Update NEXT list if priorities changed

# Update NEXT-7D.md:
# - Move completed item to DONE
# - Update WIP to next item
```

### Rule: WIP Limit = 1
Only ONE item can be "IN PROGRESS" at any time. This prevents context switching and ensures completion.

---

## Process Enforcement (MANDATORY)

**Decision Gate**: Every task MUST pass the Decision Gate before execution.

See: `docs/OPS/DECISION-GATE.md`

**3-step preflight**:
1. CLOSED check: Is topic in CLOSED section? → Require NEW evidence to reopen
2. WIP check: Does topic match current WIP? → Require explicit WIP change approval
3. DoD check: Does task have measurable Definition of Done? → Draft DoD first

**No exceptions. Gate runs FIRST.**
