# Stage 3 — Producer Product CRUD (Verification & Gap Analysis)

**Date**: 2025-12-19 23:52 UTC
**Status**: 🔍 **AUDIT IN PROGRESS**
**Previous Audit**: See `docs/FEATURES/PRODUCER-PRODUCT-CRUD-AUDIT.md` (2025-12-19 21:10 UTC)

---

## Goal (User-Facing)

**Core Requirements**:
- Producer can: list/create/edit/delete ONLY own products
- Producer cannot touch other producers' products (403 Forbidden)
- Admin can override/edit any product
- Public catalog reflects changes (products list + product detail)

**Stage 3 Focus**: Verify existing implementation is correct, identify any gaps, ensure E2E coverage.

---

## Current Surfaces (AUDIT)

### Backend Routes

**File**: `backend/routes/api.php`

**Public Routes** (no auth required):
```php
GET  /api/v1/public/products           → Public\ProductController::index
GET  /api/v1/public/products/{id}      → Public\ProductController::show
```

**Authenticated Routes** (auth:sanctum required):
```php
POST   /api/v1/products                → ProductController::store
PATCH  /api/v1/products/{product}      → ProductController::update
DELETE /api/v1/products/{product}      → ProductController::destroy
```

**Producer-Scoped Routes** (auth:sanctum + producer middleware):
```php
GET    /api/v1/producer/products                    → ProducerController::getProducts
PATCH  /api/v1/producer/products/{product}/toggle   → ProducerController::toggleProduct
PATCH  /api/v1/producer/products/{product}/stock    → ProducerController::updateStock
```

### Frontend Routes

**File**: `frontend/src/app/my/products/`

**Pages**:
- `/my/products` → List page (page.tsx, 22KB)
- `/my/products/create` → Create page (create/page.tsx)
- `/my/products/[id]/edit` → Edit page ([id]/edit/page.tsx)

**Features**:
- Lists only producer's own products
- Search/filter by category
- Edit/Delete actions per product
- "Add Product" button
- AuthGuard protection (requireAuth=true, requireRole="producer")

---

## Authorization Model (AUDIT)

### ProductPolicy

**File**: `backend/app/Policies/ProductPolicy.php`

**Summary**:
```php
view(?User $user, Product $product): bool
  → return true; // Public read access

viewAny(?User $user): bool
  → return true; // Public read access

create(User $user): bool
  → return $user->role === 'producer' || $user->role === 'admin';

update(User $user, Product $product): bool
  → if admin: return true;
  → if producer: return $user->producer && $product->producer_id === $user->producer->id;
  → else: return false;

delete(User $user, Product $product): bool
  → return $this->update($user, $product); // Same as update
```

**How producer_id is Derived**:
- Server-side assignment in `ProductController::store:119`
- `$data['producer_id'] = $user->producer->id;`
- Cannot be hijacked by client manipulation

**Admin Override Path**:
- `if ($user->role === 'admin') { return true; }`
- Admin bypasses producer_id ownership check

**Known Risks**:
- ✅ Server-side producer_id assignment (safe)
- ✅ ProductPolicy enforces ownership (tested)
- ✅ 18 backend tests PASSING (no known gaps)

---

## Definition of Done (Measurable)

### Backend Verification

- [ ] **403 on editing other producer's product**: Verify AuthorizationTest covers this
- [ ] **200/201 on own product CRUD**: Verify ProductsTest covers create/update/delete
- [ ] **Tests**: Confirm all 18 tests in PRODUCER-PRODUCT-CRUD-AUDIT are green
  - ProductsTest: 3 tests (create, update, delete)
  - AuthorizationTest: 6 tests (producer isolation)
  - ProducerSystemIntegrationTest: 3 tests (toggle, top products)
  - ProductsToggleTest: 2 tests (toggle own/other)
  - CartOrderIntegrationTest: 1 test (KPI scoping)
  - ProducerAnalyticsTest: 3 tests (analytics scoping)

**Commands**:
```bash
cd backend
php artisan test --filter "Products.*Test|Authorization.*Test"
```

### Frontend Verification

- [ ] **Producer dashboard shows ONLY own products**: Manual test or E2E
- [ ] **E2E: Create → Edit → Verify catalog update**: Playwright test
- [ ] **E2E: Attempt edit other producer's product → 403/blocked**: Playwright test

**Commands**:
```bash
cd frontend
npx playwright test tests/e2e/producer-product-crud.spec.ts
```

### Evidence Commands (No Secrets)

**Backend**:
```bash
# Test producer isolation
curl -X PATCH http://localhost:8001/api/v1/products/{other_producer_product_id} \
  -H "Authorization: Bearer {producer_token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hacked Product"}'
# Expected: 403 Forbidden

# Test own product update
curl -X PATCH http://localhost:8001/api/v1/products/{own_product_id} \
  -H "Authorization: Bearer {producer_token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Product"}'
# Expected: 200 OK
```

**Frontend**:
```bash
# E2E test
npx playwright test --grep "producer can only edit own products"
```

---

## Current Status (from Previous Audit)

**Backend**: ✅ **FULLY IMPLEMENTED**
- ProductPolicy: Enforces ownership (Lines 40-61)
- Server-side producer_id: Prevents hijacking (Line 119)
- Tests: 18 tests PASSING (0.91s)

**Frontend**: ✅ **FULLY IMPLEMENTED**
- Pages: List, Create, Edit (all exist)
- AuthGuard: Protects routes (requireRole="producer")
- API Integration: Working (confirmed by manual testing)

**Known Gaps** (from Previous Audit):
1. **Image Upload**: Component exists but requires S3/storage configuration (P2)
2. **Bulk Operations**: Not implemented (P3)
3. **Product Templates**: Not implemented (P3)
4. **Stock Alerts**: Not implemented (P2)

---

## Stage 3 Execution Plan (Next 1-2 Passes)

### Pass S3-A: Verification & Test Coverage
**Goal**: Verify all DoD items are met, no new gaps
**Scope**: Docs-only initially, then test execution
**Actions**:
1. Run backend tests: `php artisan test --filter "Products.*Test|Authorization.*Test"`
2. Verify all 18 tests PASS
3. Document results in this file (update Status section)
4. Identify any missing E2E tests

### Pass S3-B: E2E Test Coverage (Optional)
**Goal**: Add E2E test for producer product CRUD if missing
**Scope**: Tests-only (no business logic changes)
**Actions**:
1. Check if `tests/e2e/producer-product-crud.spec.ts` exists
2. If missing: Create E2E test covering:
   - Producer login → Create product → Edit product → Verify catalog update
   - Producer attempts to edit other producer's product → 403/blocked
3. Run E2E tests, verify PASS
4. Update this doc with E2E test status

### Pass S3-C: Documentation Update (Current Pass)
**Goal**: Document Stage 3 scope and DoD
**Scope**: Docs-only
**Actions**:
1. ✅ Create this doc (STAGE3-PRODUCER-PRODUCT-CRUD.md)
2. Update AGENT-STATE.md to set WIP=1 to Stage 3
3. PR with auto-merge

---

## Conclusion

**Current Assessment**: Producer Product CRUD is **PRODUCTION READY** per previous audit (2025-12-19 21:10 UTC).

**Stage 3 Goal**: Verify this assessment is accurate by:
1. Running all backend tests (confirm 18 PASS)
2. Checking E2E test coverage (add if missing)
3. Documenting any gaps (none expected based on previous audit)

**Expected Outcome**: Stage 3 closure with confirmation that CRUD is fully functional and tested.

---

**Document Owner**: Claude (automated audit)
**Last Updated**: 2025-12-19 23:52 UTC
**Next Action**: Run backend tests to verify DoD
