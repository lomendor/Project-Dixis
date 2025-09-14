# PR Execution Roadmap - Project Dixis

**Sprint Focus**: Highest impact, lowest LOC fixes for immediate stability and core functionality  
**Timeline**: 2 weeks (5 PRs, micro-PR strategy ≤30 LOC each)

## PR-001: Fix Promise.race() Test Patterns

**Title**: `fix(e2e): replace Promise.race() with deterministic element waits`

**Target Files**:
- `frontend/tests/e2e/smoke.spec.ts` (lines 63-66, 102-105)
- `frontend/tests/e2e/checkout-happy-path.spec.ts` (similar patterns if found)

**LOC Estimate**: 15 LOC

**Changes**:
- Replace `Promise.race([element1.waitFor(), element2.waitFor()])` patterns  
- Use primary selector with fallback pattern: `await page.locator('[data-testid="primary"]').or(page.locator('[data-testid="fallback"]')).first().waitFor()`
- Update timeout values to consistent 15000ms

**Acceptance Criteria**:
- [ ] All Promise.race() patterns removed from smoke tests
- [ ] Smoke test pass rate improves from 33% to >70%
- [ ] No regression in existing test functionality
- [ ] CI execution time reduced by 20%

**Priority**: P0 - Critical (unblocks CI deployment)

---

## PR-002: Optimize Test Network Dependencies

**Title**: `fix(e2e): replace networkidle waits with domcontentloaded`

**Target Files**:
- `frontend/tests/e2e/shipping-integration.spec.ts`
- `frontend/tests/e2e/pdp-happy.spec.ts`
- `frontend/tests/e2e/filters-search.spec.ts`
- `frontend/playwright.config.ts` (global config)

**LOC Estimate**: 10 LOC

**Changes**:
- Replace `waitForLoadState('networkidle')` with `waitForLoadState('domcontentloaded')`
- Add element-based waits after navigation: `await page.waitForSelector('[data-testid="main-content"]')`
- Remove hardcoded `waitForTimeout()` calls

**Acceptance Criteria**:
- [ ] Zero networkidle waits remaining in test suite
- [ ] All navigation followed by element-based waits
- [ ] Integration test stability improves from 60% to >85%
- [ ] Test execution time reduced by 30%

**Priority**: P0 - Critical (highest impact/LOC ratio)

---

## PR-003: User Profile Management API

**Title**: `feat(api): user profile update endpoints`

**Target Files**:
- `backend/routes/api.php` (add profile routes)
- `backend/app/Http/Controllers/ProfileController.php` (new controller)
- `backend/tests/Feature/ProfileTest.php` (comprehensive tests)

**LOC Estimate**: 30 LOC

**Changes**:
- Add `PUT /api/v1/profile` endpoint for profile updates
- Add `POST /api/v1/profile/avatar` endpoint for avatar upload
- Add validation for email uniqueness and password confirmation
- Include Sanctum auth middleware protection

**Acceptance Criteria**:
- [ ] Users can update name, email, password via API
- [ ] Avatar upload with file validation (jpeg, png, max 2MB)
- [ ] Proper authorization (users can only update own profile)
- [ ] Comprehensive test coverage (>90% for new endpoints)
- [ ] API documentation updated

**Priority**: P1 - High (completes core user management)

---

## PR-004: Add Missing Test Identifiers

**Title**: `test(e2e): add missing data-testid attributes for stable selection`

**Target Files**:
- `frontend/src/app/cart/page.tsx`
- `frontend/src/app/checkout/page.tsx`
- `frontend/src/app/producer/dashboard/page.tsx`
- `frontend/src/components/ui/LoadingSpinner.tsx`

**LOC Estimate**: 20 LOC

**Changes**:
- Add `data-testid="main-content"` to all page components missing it
- Add `data-testid="loading-spinner"` to loading states  
- Add `data-testid="empty-state"` to empty state components
- Add `data-testid="error-message"` to error displays

**Acceptance Criteria**:
- [ ] All major page components have main-content testid
- [ ] Loading and error states have consistent testids
- [ ] Existing E2E tests pass with new selectors
- [ ] No visual or functional changes to UI
- [ ] Test selector documentation updated

**Priority**: P1 - High (enables stable element selection)

---

## PR-005: Order Status Management API

**Title**: `feat(api): order status management endpoints`

**Target Files**:
- `backend/routes/api.php` (add order status routes)
- `backend/app/Http/Controllers/OrderController.php` (extend existing)
- `backend/app/Models/Order.php` (add status constants)
- `backend/tests/Feature/OrderStatusTest.php` (new tests)

**LOC Estimate**: 25 LOC

**Changes**:
- Add `PATCH /api/v1/orders/{id}/status` endpoint (producer/admin only)
- Add `POST /api/v1/orders/{id}/cancel` with stock restoration logic
- Add order status validation (pending → processing → shipped → delivered)
- Add audit trail for status changes

**Acceptance Criteria**:
- [ ] Producers can update orders to processing/shipped status
- [ ] Order cancellation restores product stock quantities
- [ ] Status transitions follow business rules (no backward steps)
- [ ] Audit trail records status changes with timestamps
- [ ] Email notifications sent on status updates

**Priority**: P1 - High (completes order workflow)

---

## Implementation Order & Dependencies

**Week 1 (Critical Fixes)**:
1. PR-001: Promise.race() fixes (unblocks CI)
2. PR-002: Network dependency optimization (reduces flakiness)

**Week 2 (Core Features)**:
3. PR-003: User profile API (parallel development)
4. PR-004: Test identifiers (parallel development)  
5. PR-005: Order status API (depends on PR-003 patterns)

**Execution Strategy**:
- Each PR targets single responsibility
- All PRs maintain ≤30 LOC constraint
- Parallel development where no dependencies exist
- Immediate CI testing after each merge

**Success Metrics**:
- Smoke test stability: 33% → 90%+
- CI execution time: 5-8min → <3min
- Core marketplace functionality: 80% → 95% complete
- Development velocity: 60% reduction in test-related delays