# NEXT 7 DAYS

**Last Updated**: 2025-12-20 20:35 UTC

## WIP (1 item only)
**Consolidate MVP verification docs** (Started: 2025-12-20)
- **Scope**: Create master verification document summarizing all CLOSED MVP core features
- **DoD**:
  - Create `docs/FEATURES/MVP-CORE-VERIFICATION.md` master summary doc
  - Consolidate Stage 2/3/4A verification results (120+ tests PASS)
  - Cross-reference all audit docs
  - Verify DATA-DEPENDENCY-MAP.md consistency
  - Update STATE.md STABLE section with reference
  - PR created with auto-merge enabled
- **Current status**: Pending Pass 2 execution

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
