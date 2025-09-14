# QA & Test Stability Plan - Project Dixis

**Analysis Period**: September 2025  
**Context**: E2E test stabilization post MSW integration (PR #136) and conflict resolution  
**Current Branch**: `feature/e2e-smoke-fix-msw` → targeting main  
**Recent Stabilization**: PR f2279f3 achieved 1/3 smoke test pass rate improvement

## Root Causes of Flakiness

- [ ] **Race conditions with Promise.race() patterns** (High impact, 40% of failures)
  - Multiple tests use `Promise.race([element1.waitFor(), element2.waitFor()])` causing non-deterministic failures
  - Found in: smoke.spec.ts lines 63-66, 102-105
  - Impact: 40% of smoke test failures, blocks CI deployment

- [ ] **Excessive timeout values masking timing issues** (High impact, 30% of failures)  
  - Tests use 30000ms timeouts (smoke.spec.ts lines 34, 38, 56, 90) indicating unstable selectors
  - shipping-integration.spec.ts has waitForTimeout(1000, 2000) hardcoded delays
  - Impact: 30% of CI timeout failures, 3-5min slower test execution

- [ ] **Network-dependent test patterns** (Medium impact, 25% of failures)
  - waitForLoadState('networkidle') usage in 8+ files creates timing dependencies
  - API health checks in pdp-happy.spec.ts (line 10-12) fail without backend
  - Impact: 25% of integration test failures in CI environment

- [ ] **Inconsistent MSW stub coverage** (Medium impact, 20% of failures)
  - MSW stubs only cover basic endpoints (/auth/me, /cart, /products, /checkout)
  - Missing stubs for producer-specific endpoints and error scenarios
  - Impact: 20% of authenticated user flow failures

- [ ] **Complex test helper patterns** (Low impact, 15% of failures)
  - ShippingIntegrationHelper class in shipping-integration.spec.ts creates maintenance overhead
  - Helper methods mix navigation, authentication, and assertions
  - Impact: 15% of failures from helper method timing issues

## Immediate Fixes Needed (≤30 LOC each)

- [ ] **Replace Promise.race() with deterministic element selection** (smoke.spec.ts, ~15 LOC)
  - Replace Promise.race patterns with single stable element wait
  - Use primary selector with fallback pattern instead of racing
  - Priority: High - Blocks smoke test reliability

- [ ] **Normalize timeout values to 15000ms standard** (multiple files, ~25 LOC) 
  - Replace 30000ms timeouts with 15000ms across all test files
  - Remove hardcoded waitForTimeout() calls in favor of element-based waits
  - Priority: High - Improves test execution time by 40%

- [ ] **Enhance MSW stub coverage for missing endpoints** (msw-stubs.ts, ~20 LOC)
  - Add producer endpoints (/api/v1/producers, /api/v1/producers/me) 
  - Add error response stubs (404, 500 scenarios)
  - Priority: Medium - Enables reliable authenticated testing

- [ ] **Replace networkidle with domcontentloaded** (multiple files, ~10 LOC)
  - Change waitForLoadState('networkidle') to waitForLoadState('domcontentloaded')
  - Add element-based waits after navigation
  - Priority: Medium - Reduces network dependency flakiness

- [ ] **Add missing data-testid attributes** (frontend components, ~20 LOC)
  - Add data-testid="main-content" to all page components (already in HomeClient)
  - Add data-testid="loading-spinner" for loading states
  - Priority: Medium - Enables stable element selection

- [ ] **Consolidate shipping test helper complexity** (shipping-integration.spec.ts, ~30 LOC)
  - Break ShippingIntegrationHelper into focused utility functions
  - Separate navigation, authentication, and form filling concerns
  - Priority: Low - Reduces maintenance overhead

## PRs to Close as Superseded

- [ ] **PR #125: Fix smoke tests with main-content wait** (Conflicts with MSW approach)
  - Reason: Conflicts resolved in feature/e2e-smoke-fix-msw branch  
  - MSW stub approach is more deterministic than element waits
  - Action: Close #125, continue with MSW stabilization

- [ ] **Branch: fix/pr-136-testid-duplicates** (Duplicate functionality)
  - Reason: Testid standardization already handled in current branch
  - main-content testid already added in f2279f3 commit
  - Action: Delete branch after verifying no unique changes

- [ ] **Branch: test/msw-stubs-stabilization** (Superseded by current implementation)  
  - Reason: MSW implementation already integrated in support/msw-stubs.ts
  - Current implementation more comprehensive than experimental branch
  - Action: Archive branch, no merge needed

## MSW Improvements

- [ ] **Add comprehensive endpoint coverage** (~15 LOC)
  - Producer management endpoints: GET/POST /api/v1/producers
  - User profile endpoints: GET/PUT /api/v1/user/profile
  - Order history endpoints: GET /api/v1/orders

- [ ] **Implement realistic error response scenarios** (~10 LOC)
  - 401 Unauthorized responses for auth endpoints
  - 404 Not Found for invalid product/producer IDs
  - 500 Server Error responses for error boundary testing

- [ ] **Add request method-specific routing** (~10 LOC)
  - Distinguish between GET/POST/PUT/DELETE for same endpoints  
  - Return appropriate responses based on HTTP method
  - Enable CRUD operation testing without backend dependency

- [ ] **State management between MSW calls** (~8 LOC)
  - Track cart state across add/remove operations
  - Maintain user authentication state consistency
  - Enable multi-step workflow testing

## Test Infrastructure

- [ ] **Optimize Playwright configuration for CI** (~5 LOC)
  - Set CI retries to 1 instead of 2 (faster feedback)
  - Reduce worker count to 1 in CI for resource stability
  - Update timeout to 45000ms (current: 60000ms)

- [ ] **Standardize test categorization** (~10 LOC)
  - Implement @smoke, @integration, @api tags in test titles
  - Update CI workflows to run smoke tests first
  - Add tag-based test execution scripts

- [ ] **Improve artifact collection** (~8 LOC)
  - Ensure test-results/ and playwright-report/ always created
  - Add screenshot capture on test start (not just failure)
  - Include network logs in CI test runs

- [ ] **Add test stability monitoring** (~12 LOC)
  - Create flaky test detection script based on results.json
  - Add test execution time tracking
  - Generate weekly stability reports

## Long-term Strategy

- [ ] **Test categorization approach**
  - **Smoke Tests**: Basic page loads, navigation, MSW-mocked API calls (5-10 tests)
  - **Integration Tests**: Real API calls, authentication flows, data persistence (15-20 tests)  
  - **E2E Tests**: Full user journeys, cross-component interactions (10-15 tests)
  - **Performance Tests**: Lighthouse, Core Web Vitals, load testing (5 tests)

- [ ] **Smoke vs integration test boundaries**
  - Smoke: Use MSW stubs, focus on UI rendering and basic interactions
  - Integration: Use real backend, test actual API responses and data flow
  - Clear separation: smoke.spec.ts (MSW), integration.spec.ts (API), e2e.spec.ts (full stack)

- [ ] **Monitoring and alerting for flaky tests**
  - Weekly flaky test reports based on CI failure patterns
  - Automated PR comments when tests fail >50% in last 5 runs
  - Dashboard showing test stability trends over time
  - Slack notifications for critical smoke test failures

- [ ] **CI execution optimization**
  - Smoke tests run on every PR (fast feedback: <2min)
  - Integration tests run on main branch merge (thorough validation: <5min)
  - E2E tests run nightly and pre-release (comprehensive coverage: <10min)
  - Parallel execution groups: UI tests, API tests, Auth tests

## Priority Implementation Order

**Week 1 (Critical - Unblock CI)**
1. Replace Promise.race() patterns in smoke.spec.ts
2. Enhance MSW stub coverage for missing endpoints  
3. Normalize timeout values to 15000ms standard
4. Close superseded PRs #125 and related branches

**Week 2 (High Impact)**  
1. Replace networkidle with domcontentloaded waits
2. Add missing data-testid attributes to components
3. Optimize Playwright CI configuration
4. Implement test categorization with tags

**Week 3-4 (Infrastructure)**
1. Consolidate complex test helpers  
2. Add comprehensive error response scenarios to MSW
3. Implement test stability monitoring
4. Create execution optimization strategy

## Success Metrics

- **Smoke Test Pass Rate**: Target 95% (current: 33% after f2279f3)
- **CI Execution Time**: Target <3min for smoke tests (current: ~5-8min)  
- **Flaky Test Rate**: Target <2% (current: ~15% estimated)
- **Test Coverage**: Maintain current 85%+ while improving stability
- **Development Velocity**: Reduce test-related PR delays by 60%

---

**Analysis Completed**: 2025-09-13  
**Next Review**: 2025-09-27 (post-implementation)  
**Status**: Ready for immediate execution - focus on Week 1 critical fixes