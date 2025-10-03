# NEXT-7D — Immediate Priorities

**Updated:** 2025-10-03
**Context:** Phase 2 E2E Stabilization

## This Week (Days 1-7)

### 1. Strict Smoke Test ✅
- ✅ Create `frontend/tests/e2e/auth-probe.spec.ts`
- ✅ Remove `continue-on-error` from smoke step in pr.yml
- ✅ Ensure auth-probe is strict required check

### 2. Nightly E2E Full ✅
- ✅ Add `.github/workflows/e2e-full.yml`
- ✅ Trigger: Nightly (03:30 UTC) + manual + label `run-e2e-full`
- ✅ Runs all E2E tests with retries=1 and full artifacts

### 3. Skip Inventory & Umbrella Issue ✅
- ✅ Generate skip inventory from test files
- ✅ Create umbrella issue for unskip backlog
- ✅ Map each skip → required production change
- ✅ Prioritize by risk/value

## Next Week (Days 8-14)

### 4. Begin Unskip Phase 1 ✅
- ✅ Implemented minimal production fixes (Pass 59)
- ✅ SSR guards in Navigation.tsx (mobile menu hydration)
- ✅ Enhanced MSW handlers for error scenarios
- ✅ Result: Reduced 11 skips → 8 skips (27% improvement)

### 5. CI Performance Monitoring
- Track quality-gates runtime daily
- Optimize slow steps if approaching 12-minute budget
- Document baseline metrics

### 6. Documentation Updates
- Update PRD index with current features
- Document architectural decisions
- Create runbook for common issues

## Blocked / Deferred

- Payment integration: Blocked on vendor API access
- Multi-language: Deferred to Q4 Week 4
- Advanced analytics: Deferred to Q1 2026
