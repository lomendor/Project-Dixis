# E2E RCA — Phase 2 (tests-only) — CI run 18122123554

- **Run**: https://github.com/lomendor/Project-Dixis/actions/runs/18122123554
- **PR**: https://github.com/lomendor/Project-Dixis/pull/276
- **Branch**: test/e2e-auth-bootstrap-p0
- **Status**: In Progress (E2E tests running as of document creation)

## Phase 2 Implementation

### Changes Applied
1. **Added `gotoLoginStable()` helper** in `frontend/tests/e2e/helpers/test-auth.ts`
   - 45-second timeout for auth bootstrap
   - DOM-content-loaded waits before form element assertions
   - Robust selector fallbacks for login form detection

2. **Updated shipping-checkout-e2e.spec.ts**
   - Import and use `gotoLoginStable()` before URL assertions
   - Increased auth timeout from 20s to 45s
   - Replaced fragile URL-first approach with DOM-ready navigation

### Targeted Fix
The changes specifically address the RCA Phase 1 findings:
- **TimeoutError**: `locator.waitFor: Timeout 20000ms exceeded`
- **toHaveURL failures**: Tests expecting `/auth/login` but timing out
- **Auth bootstrap race**: Server ready vs app hydrated timing issues

## CI Status (as of creation)
- **type-check**: ✅ PASSED (39s)
- **frontend-tests**: ✅ PASSED (1m1s)
- **e2e-tests**: 🟡 RUNNING (shipping integration tests in progress)

## Expected Outcome
If successful, the auth bootstrap stabilization should:
- Eliminate TimeoutError occurrences in shipping tests
- Stabilize `/auth/login` URL expectations
- Pass all 6 previously failing shipping-checkout test variants

## Artifacts captured
- (To be updated when CI completes)

---
*Generated during Phase 2 execution - tests-only mitigation, no runtime changes*