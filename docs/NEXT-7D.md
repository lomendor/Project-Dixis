# NEXT 7 DAYS

**Last Updated**: 2025-12-19 21:30 UTC

## WIP (1 item only)
**None** - Awaiting next priority

## NEXT (ordered, max 3)

### 1) PROD stability monitoring
- **DoD**:
  - Run `scripts/prod-facts.sh` to verify baseline
  - All endpoints return expected codes (healthz=200, products=200, login=307)
  - smoke-production CI stays green
  - No new regressions introduced
- **Estimated effort**: Ongoing daily check (5 min)

### 2) E2E test infrastructure (optional)
- **DoD**:
  - Add seed data script for E2E tests
  - Verify checkout-happy-path.spec.ts runs successfully
  - Document E2E test setup in README
- **Estimated effort**: 2-3 hours

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
