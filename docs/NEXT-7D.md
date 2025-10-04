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

### 4. Unskip Progress ✅
- ✅ **Pass 59 (Batch #1)**: Reduced 11 → 8 skips (SSR guards, MSW handlers)
- ✅ **Pass 61 (Batch #2)**: Reduced 8 → 5 skips (error handling, abort signals)
- ✅ **Pass 62**: Restored strict commit discipline (commitlint required)
- **Result**: 112/117 passing (95.7% coverage), 5 skips remaining

### 5. Retry Logic Sprint (Remaining 5 Skips) ✅
- ✅ Scaffold added (Pass 64): tests/utils/retry.ts, tests/fixtures/stability.ts
- **Next**: Adopt helpers in 2 flaky specs → reduce skips 5→4
- Then: Design retry-with-backoff for CheckoutApiClient (remaining 3 skips)
- Target: 116/117 passing (99.1% coverage)

### 6. CI Performance Monitoring
- Track quality-gates runtime daily
- Optimize slow steps if approaching 12-minute budget
- Document baseline metrics

### 7. Nightly E2E Full Monitoring
- Monitor nightly e2e-full runs for flakes
- Triage any new failures with retries=1
- Update skip inventory if new issues found

### 8. Documentation Updates
- Update PRD index with current features
- Document architectural decisions
- Create runbook for common issues

## Blocked / Deferred

- Payment integration: Blocked on vendor API access
- Multi-language: Deferred to Q4 Week 4
- Advanced analytics: Deferred to Q1 2026
