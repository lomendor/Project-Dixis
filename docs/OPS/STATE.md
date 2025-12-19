# OPS STATE

**Last Updated**: 2025-12-19 21:45 UTC

## CLOSED ✅ (do not reopen without NEW proof)
- **SSH/fail2ban**: Canonical SSH config enforced (deploy user + dixis_prod_ed25519 key + IdentitiesOnly yes). fail2ban active with no ignoreip whitelist. Production access stable. (Closed: 2025-12-19)
- **OPS Bootstrap**: State management system (STATE.md + NEXT-7D.md + prod-facts.sh) committed and merged via PR #1761. (Closed: 2025-12-19)
- **PM2 Resurrect**: pm2-deploy.service enabled (auto-start on boot). Tested pm2 kill + pm2 resurrect → both processes restored (dixis-frontend + dixis-backend). All health checks 200. Proof: `docs/OPS/PM2-RESURRECT-PROOF.md` (Closed: 2025-12-19)
- **Data Dependency Map**: Complete roadmap created (`docs/PRODUCT/DATA-DEPENDENCY-MAP.md`). Merged via PR #1763. (Closed: 2025-12-19)
- **smoke-production CI**: Timeout increased 15s→45s for network resilience (PR #1764). Not a PROD regression (all endpoints 200). Verified: ui-only label does NOT skip smoke tests. (Closed: 2025-12-19)
- **Producer Permissions Audit**: ProductPolicy enforces producer_id ownership. Admin override works. 12 authorization tests pass. No auth bugs found. Audit doc: `docs/FEATURES/PRODUCER-PERMISSIONS-AUDIT.md` (Closed: 2025-12-19)
- **Checkout Flow MVP**: Complete checkout flow already implemented and tested. POST /api/checkout creates Order + OrderItems. 13 backend tests PASS. 80+ E2E tests exist. Documentation: `docs/FEATURES/CHECKOUT-MVP.md` (Closed: 2025-12-19)
- **Producer Product CRUD**: Complete producer dashboard with product CRUD already implemented and production-ready. ProductPolicy enforces ownership. 18 backend tests PASS (0.91s). Frontend pages: list, create, edit. Server-side producer_id assignment. Audit doc: `docs/FEATURES/PRODUCER-PRODUCT-CRUD-AUDIT.md` (Closed: 2025-12-19)
- **Orders MVP**: Complete orders system (cart → create order → view order) already implemented and production-ready. 55 backend tests PASS (cart + orders). Frontend pages: order details, confirmation, tracking. User authorization enforced. Cart isolation working. Stock validation prevents overselling. Audit doc: `docs/FEATURES/ORDERS-MVP-AUDIT.md` (Closed: 2025-12-19)

## STABLE ✓ (working with evidence)
- **Backend health**: /api/healthz returns 200 ✅
- **Products API**: /api/v1/public/products returns 200 with data ✅
- **Products list page**: /products returns 200, renders product names (e.g., "Organic Tomatoes") ✅
- **Product detail page**: /products/1 returns 200, renders expected product content ✅
- **Auth redirects**: /login → /auth/login (307), /register → /auth/register (307) ✅
- **Auth pages**: /auth/login and /auth/register return 200 ✅

**Evidence**: See `docs/OPS/PROD-FACTS-LAST.md` (auto-updated by `scripts/prod-facts.sh`)

## IN PROGRESS → (WIP=1 ONLY)
- **WIP**: Stage 2 - Advanced permissions & multi-producer scenarios
  - DoD: Verify producer isolation in edge cases (shared products, multi-producer orders), document additional security tests needed, update ProductPolicy if gaps found
  - Status: Planning phase

## BLOCKED ⚠️
- (none)

## NEXT 📋 (max 3, ordered, each with DoD)

### 1) PROD monitoring & stability
- **DoD**:
  - Run `scripts/prod-facts.sh` daily
  - All endpoints return expected status codes
  - No regressions in smoke-production CI
  - Document any new issues in STATE.md

### 2) Backend test improvements (optional)
- **DoD**:
  - E2E tests can run with seed data (`pnpm test:e2e:prep`)
  - All critical flows have E2E coverage
  - CI runs E2E tests on PR

### 3) Future feature planning
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
