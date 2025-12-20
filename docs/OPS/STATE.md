# OPS STATE

**Last Updated**: 2025-12-20 22:40 UTC

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

## STABLE ✓ (working with evidence)
- **Backend health**: /api/healthz returns 200 ✅
- **Products API**: /api/v1/public/products returns 200 with data ✅
- **Products list page**: /products returns 200, renders product names (e.g., "Organic Tomatoes") ✅
- **Product detail page**: /products/1 returns 200, renders expected product content ✅
- **Auth redirects**: /login → /auth/login (307), /register → /auth/register (307) ✅
- **Auth pages**: /auth/login and /auth/register return 200 ✅
- **Cart page**: /cart returns 200 ✅
- **Order pages**: /order/1 and /orders/1 return 200 ✅
- **Backend Orders API**: /api/v1/orders returns 401 (correctly requires authentication) ✅

**Evidence**: See `docs/OPS/PROD-FACTS-LAST.md` (auto-updated by `scripts/prod-facts.sh`)
**Automated Monitoring**: Daily checks at 07:00 UTC via `.github/workflows/prod-facts.yml`

**MVP Core Features Summary**: See `docs/FEATURES/MVP-CORE-VERIFICATION.md` (140+ tests, 838+ assertions, all PASS)

## IN PROGRESS → (WIP=1 ONLY)
- (none currently)

## BLOCKED ⚠️
- (none)

## NEXT 📋 (max 3, ordered, each with DoD)

### 1) Backend test improvements (optional)
- **DoD**:
  - E2E tests can run with seed data (`pnpm test:e2e:prep`)
  - All critical flows have E2E coverage
  - CI runs E2E tests on PR

### 2) Future feature planning
- **DoD**:
  - Review PRD-INDEX.md for next phase
  - Prioritize features based on user feedback
  - Create feature spec docs in `docs/FEATURES/`

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
