# NEXT 7 DAYS

**Last Updated**: 2025-12-20 00:30 UTC

## WIP (1 item only)
None (awaiting next priority)

## NEXT (ordered, max 3)

### 1) PROD stability monitoring
- **DoD**:
  - Run `scripts/prod-facts.sh` to verify baseline
  - All endpoints return expected codes (healthz=200, products=200, login=307)
  - smoke-production CI stays green
  - No new regressions introduced
- **Estimated effort**: Ongoing daily check (5 min)

### 2) Stage 3 authorization regression tests (backend)
- **DoD**:
  - Add backend tests proving producer product Update/Delete ownership enforcement
  - Tests: producer can update/delete own product, cannot touch others, admin override works
  - All tests PASS, no authorization regressions
- **Estimated effort**: 1 hour

### 3) Feature prioritization
- **DoD**:
  - Review `docs/PRODUCT/PRD-INDEX.md` for next features
  - Gather user feedback on checkout flow
  - Create spec docs for next phase features
- **Estimated effort**: 1-2 hours planning

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
