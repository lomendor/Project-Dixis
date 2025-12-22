# NEXT 7 DAYS

**Last Updated**: 2025-12-21 18:00 UTC

## WIP (1 item only)
- (none - ready for next item from NEXT queue)

## NEXT (ordered, max 3)

### 1) Admin Product Moderation Queue
- **Scope**: Admin approval workflow for new producer products
- **DoD**:
  - Admin sees pending products at `/admin/products?status=pending`
  - Admin can approve/reject with reason (PATCH /api/v1/admin/products/{id}/moderate)
  - Producer receives email notification on approval/rejection
  - Backend tests: 3 tests (list_pending, approve_product, reject_product)
  - Policy test: 1 test (admin_can_moderate_any_product)
  - PROD smoke: Admin moderation endpoint returns 401 for non-admin
- **Estimated effort**: 1-2 days
- **Priority**: Medium (quality control for marketplace)

### 2) Order Status Tracking (Consumer View)
- **Scope**: Show order processing status to consumers
- **DoD**:
  - Consumer sees order status on `/orders/{id}` page (pending/processing/shipped/delivered)
  - Backend supports status transitions (POST /api/v1/orders/{id}/status)
  - Email sent to consumer on status change
  - Backend tests: 2 tests (status_transition, notification_sent)
  - E2E test: 1 test (order-status-display.spec.ts verifying status shown)
  - PROD smoke: Order detail page shows status field
- **Estimated effort**: 1 day
- **Priority**: Medium (transparency for consumers)

## DONE (this week)
- Bootstrap OPS state management system (2025-12-19) - PR #1761 merged ✅
- SSH/fail2ban hardening (2025-12-19) - CLOSED ✅
- Data Dependency Map (2025-12-19) - PR #1763 merged ✅
- smoke-production CI timeout fix (2025-12-19) - PR #1764 merged ✅
- Producer permissions audit (2025-12-19) - PASS, no bugs found ✅
- Checkout flow MVP verification (2025-12-19) - Already implemented ✅
- Producer Product CRUD audit (2025-12-19) - FULLY IMPLEMENTED, 18 tests PASS ✅
- Orders MVP audit (2025-12-19) - FULLY IMPLEMENTED, 55 tests PASS ✅
- Stage 2 Permissions Audit (2025-12-19) - NO GAPS FOUND, 17 authorization tests PASS, PR #1772 ✅
- PROD Facts Monitoring (2025-12-19) - Automated monitoring live, CI heavy-checks guard, PR #1774 ✅
- ProducerOrderManagementTest fix (2025-12-19) - HasOne association fixed, 8 tests PASS, PR #1776 ✅
- Stage 3 Producer Product CRUD authorization gap fix (2025-12-20) - Update/Delete routes now proxy to backend (enforce ProductPolicy), admin override restored, PR #1779 ✅
- Stage 3 Producer My Products list verification (2025-12-20) - Verified existing implementation, 4 tests PASS, ownership enforced server-side ✅
- Stage 3 Producer Product CRUD complete verification (2025-12-20) - Create/edit/delete verified production-ready, 49 tests PASS (251 assertions), ProductPolicy enforces ownership, admin override working ✅
- Stage 4A Orders & Checkout Flow verification (2025-12-20) - Cart-to-order flow verified production-ready, 54 tests PASS (517 assertions), stock validation working, transaction-safe order creation ✅
- Producer Permissions verification (2025-12-20) - 12 tests PASS (ownership + scoping), PR #1786 merged ✅
- PROD monitoring setup (2025-12-20) - Daily automated checks active ✅
- PROD monitoring & stability enforcement (2025-12-20) - Issue-on-fail + auto-commit implemented, all endpoints healthy, PR #1790 merged ✅
- Pass 1 (PROD monitoring WIP closure) (2025-12-20) - Moved PROD monitoring from IN PROGRESS to CLOSED, updated STATE/NEXT docs, PR #1791 merged ✅
- Pass 2 (MVP core verification master) (2025-12-20) - Created MVP-CORE-VERIFICATION.md consolidating all CLOSED features (140+ tests, 838+ assertions), updated STATE STABLE section, PR #1792 merged ✅
- Pass 3 (Producer permissions audit) (2025-12-20) - Documented producer ownership/permissions state with grep evidence, PR #1793 merged ✅
- Pass 4 (Decision Gate installation) (2025-12-20) - Installed Decision Gate process (docs/OPS/DECISION-GATE.md + scripts/rehydrate.sh), PR #1794 merged ✅
- Pass 5 (Producer permissions proof) (2025-12-20) - Comprehensive authorization proof with 19 tests PASS (53 assertions), no authorization gaps found, proof pack created ✅
- Pass 6 (Checkout → Order MVP proof) (2025-12-20) - Audit-first verification: checkout flow production-ready, 54 tests PASS (517 assertions), NO code changes required ✅
- Pass 7 (Frontend checkout wiring) (2025-12-20) - Cart checkout now calls backend Laravel API (POST /api/v1/orders), E2E tests added (cart-backend-api.spec.ts, 2 tests), authentication check implemented, PR #1797 merged, PROD proof complete (all endpoints healthy) ✅
- Pass 8 (Permissions/Ownership Audit Stage 2) (2025-12-21) - Deep permissions audit: ProductPolicy enforces producer_id ownership, server-side producer_id prevents hijacking, 21 authorization tests PASS (56 assertions), NO CRITICAL AUTHORIZATION GAPS FOUND, audit doc created (docs/SECURITY/PERMISSIONS-AUDIT-PASS8.md), PROD verification complete ✅
- Pass 9 (Producer Dashboard CRUD Verification) (2025-12-21) - Audit confirmed producer dashboard product management already fully implemented end-to-end, frontend routes proxy to backend Laravel API (NOT Prisma), ProductPolicy enforced, 21 authorization + 49 CRUD tests PASS, NO CODE CHANGES REQUIRED, plan doc created (docs/FEATURES/PASS9-PRODUCER-DASHBOARD-CRUD.md) ✅
- Pass 10 (Checkout Orders List Page) (2025-12-21) - Created `/orders` list page to complete MVP checkout flow, PROD `/orders` was 404, created orders list calling backend `GET /api/v1/orders`, orders table with ID/date/status/total, links to order details, AuthGuard enforced, Greek locale, PR #1800 merged (2025-12-20T23:56:24Z), PROD after: /orders → 200 ✅ ✅
- Pass 11 (Checkout E2E Test) (2025-12-21) - Added E2E happy-path test proving checkout creates order and it appears in `/orders` list, makes checkout order creation non-regressing, test file: checkout-order-creation.spec.ts (111 lines), flow: Login → Browse → Cart → Checkout → Verify order in list, all CI checks PASS, PR #1801 merged (2025-12-21T00:10:20Z), DoD: E2E proof integrates Pass 7 + Pass 10 ✅
- Pass 12 (Scheduled PROD Smoke Monitoring) (2025-12-21) - Created GitHub Actions workflow (`.github/workflows/prod-smoke.yml`) probing PROD endpoints every 15 minutes, checks: healthz, API products, products page, auth redirects, orders page, retries: 3 attempts/2s delay/10s timeout, documentation: `docs/OPS/PROD-MONITORING.md` (183 lines), PR #1803 merged (2025-12-21T00:49:37Z) ✅
- Pass 13 (Fix /orders Route + Enforce Prod-Smoke) (2025-12-21) - Fixed `/orders` 404 by moving page from `(storefront)/orders/` to `orders/` (Next.js routing conflict), updated prod-smoke.yml to FAIL on 404 (no tolerance), build passed CI + all smoke checks ✅, PR #1804 merged (2025-12-21T06:50:00Z), deployment pending (infra issue) ✅
- PROD Outage Recovery - IPv6 Binding Issue (2025-12-21) - Production outage (~2 hours) caused by Next.js 15.5.0 IPv6 binding incompatibility. Fixed with systemd launcher service (HOSTNAME=127.0.0.1), frontend switched from PM2 to systemd, incident doc created, PROD operational ✅
- Pass 14 (Producer Permissions Audit) (2025-12-21) - Docs-only audit verifying producer authorization state. ProductPolicy enforces producer_id ownership, server-side producer_id prevents hijacking, 21 authorization + 49 CRUD tests PASS. NO CRITICAL AUTHORIZATION GAPS FOUND. Audit doc: docs/FEATURES/PRODUCER-PERMISSIONS-AUDIT.md. PR #1809 merged ✅
- Pass 15 (Producer Ownership Enforcement) (2025-12-21) - Replaced manual authorization checks in ProducerController with ProductPolicy. toggleProduct() and updateStock() now use $this->authorize(). Code reduced by 25 lines, correct HTTP codes (403 not 404), admin override works. Tests: 4 PASS (7 assertions). PR #1810 merged ✅
- Pass 16 (E2E Producer Ownership Isolation) (2025-12-21) - Added Playwright E2E test proving /api/me/products scopes by producer. Backend scoping already proven by AuthorizationTest.php (4 PHPUnit tests, 11 assertions, run in CI). E2E adds frontend proxy coverage. Tests: 3 E2E PASS (11.5s). PR #1813 merged ✅
- Pass 18 (Producer Product Image Upload) (2025-12-22) - Audit-first verification: feature 100% production-ready. Complete vertical slice exists: UploadImage component → POST /api/me/uploads → storage (fs/s3) → Producer forms → Products.image_url + ProductImage → Storefront display. Tests: 8 existing (3 backend + 5 E2E). PROD proof: Product #1 has image_url + 2 ProductImage records. NO CODE CHANGES REQUIRED. Audit doc: docs/FEATURES/PASS18-PRODUCT-IMAGE-UPLOAD-AUDIT.md. Similar to Pass 6 and Pass 9 ✅
- Pass 19 (Product Detail Pages PROD Fix) (2025-12-22) - Fixed product detail pages showing loading skeleton on dixis.gr + www.dixis.gr. Root causes: (1) Backend API down (Laravel not running on 8001), (2) SSR using external URL causing timeout, (3) Nested frontend/frontend/ breaking TypeScript build. Fixes: (1) Created systemd service dixis-backend.service, (2) PR #1836 - SSR uses internal API (127.0.0.1:8001), (3) Removed orphaned nested directory. PROD proof: curl dixis.gr/products/1 | grep "Organic Tomatoes" ✅ + curl www.dixis.gr/products/1 | grep "Organic Tomatoes" ✅ ✅

---

## Rules

### WIP Limit = 1
Only ONE item in WIP at any time. No exceptions.

### DoD Required
Every item must have measurable Definition of Done before starting work.

### State Updates
After completing WIP item:
1. Move to DONE section
2. Update `docs/OPS/STATE.md` (move from IN PROGRESS to STABLE/CLOSED)
3. Pull next item from NEXT to WIP
4. Run `./scripts/prod-facts.sh` to verify PROD still healthy

### Estimation
Optional but helpful for planning. Reality: most tasks take 2-4 hours of focused work.

---

## References
- Data dependency map: `docs/PRODUCT/DATA-DEPENDENCY-MAP.md`
- Decision gate SOP: `docs/OPS/DECISION-GATE.md`
- Current state: `docs/OPS/STATE.md`
