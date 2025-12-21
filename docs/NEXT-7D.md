# NEXT 7 DAYS

**Last Updated**: 2025-12-21 01:00 UTC

## WIP (1 item only)
**Pass 12**: Scheduled PROD smoke monitoring (workflow + docs)

## NEXT (ordered, max 3)

### 1) Backend E2E test improvements (optional)
- **Scope**: Enhance test coverage with seed data and E2E scenarios
- **DoD**:
  - E2E tests can run with seed data (`pnpm test:e2e:prep`)
  - All critical flows have E2E coverage
  - CI runs E2E tests on PR
- **Estimated effort**: 1-2 days
- **Priority**: Optional (core features already verified)

### 2) Feature planning for next phase
- **Scope**: Review PRD and prioritize next features based on user feedback
- **DoD**:
  - Review `docs/PRODUCT/DATA-DEPENDENCY-MAP.md` for next phase
  - Prioritize features based on user feedback/business goals
  - Create feature spec docs in `docs/FEATURES/` for chosen items
- **Estimated effort**: Planning session (4-6 hours)

### 3) Future features (pending PROD stability + planning)
- Payment integration (Viva Wallet) - requires feature spec
- Shipping integration (ACS/ELTA Courier) - requires feature spec
- Future role: "πωλητής Dixis" (seller who sells on behalf of producers)
- OS package updates (security patches)
- Monitoring tweaks (alert thresholds)

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
