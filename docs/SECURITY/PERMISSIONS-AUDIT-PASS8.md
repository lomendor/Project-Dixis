# Permissions / Ownership Audit (Pass 8)

## PROD facts (2025-12-20 22:51 UTC)
- products: 200
- login redirect: 307 → https://dixis.gr/auth/login
- cart: 200
- api_public_products: 200
- api_orders: 401 (correctly requires auth)

## What must be true (DoD)
1) Producer can CRUD ONLY own products (server-enforced).
2) Producer cannot read/edit other producer resources (403/404).
3) Admin can override (edit any product).
4) Any "scoping" must exist in backend (not only frontend).
5) Tests exist to prevent regression.

## Current implementation (facts)

### Policies
**ProductPolicy** (`backend/app/Policies/ProductPolicy.php`):
- ✅ `view/viewAny`: Public read access (anyone can view products)
- ✅ `create`: Producer or Admin only (line 33)
- ✅ `update`: Admin can update any, Producer can only update own products (line 48: `$product->producer_id === $user->producer->id`)
- ✅ `delete`: Same rules as update (line 60)

**OrderPolicy** (`backend/app/Policies/OrderPolicy.php`):
- ✅ `view`: Users can view own orders, admins can view all (line 25)
- ✅ `viewAny`: Public access (controller filters)
- ✅ `create`: Consumers and admins (NOT producers - line 50)
- ✅ `update/delete`: Admin only (lines 59, 67)

**ProducerPolicy** (`backend/app/Policies/ProducerPolicy.php`):
- ⚠️ `view/viewAny`: Public access (has TODO comment about tightening - lines 15, 25)

### Routes + middleware
All CRUD routes use `auth:sanctum` middleware (backend/routes/api.php):
- ✅ `/api/v1/products/*` - protected by auth:sanctum (line 61)
- ✅ `/api/v1/producer/*` - protected by auth:sanctum (line 788)
- ✅ `/api/v1/orders/*` - protected by auth:sanctum (line 75)

### Controllers/services scoping

**ProductController** (`backend/app/Http/Controllers/Api/V1/ProductController.php`):
- ✅ Line 106: `$this->authorize('create', Product::class)` - enforces policy
- ✅ Line 111-121: **Server-side producer_id enforcement**:
  ```php
  // Security: Auto-set producer_id from authenticated user (server-side)
  $user = Auth::user();
  if ($user->role === 'producer') {
      $data['producer_id'] = $user->producer->id;  // Line 119
  }
  // Admin can specify producer_id from request (already validated)
  ```
- ✅ Line 153: `$this->authorize('update', $product)` - enforces ProductPolicy
- ✅ Line 173: `$this->authorize('delete', $product)` - enforces ProductPolicy

**ProducerController** (`backend/app/Http/Controllers/Api/ProducerController.php`):
- ✅ Line 31: Ownership check before stock toggle:
  ```php
  if ($product->producer_id !== $user->producer->id) {
      abort(403, 'Unauthorized');
  }
  ```
- ✅ Line 113: Ownership check before stock update (same pattern)
- ✅ Line 173-181: Scoped product queries (filters by producer's own products)

**ProducerOrderController** (`backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php`):
- ✅ Line 49, 101, 168: Scopes orders by `producer_id`:
  ```php
  $q->where('producer_id', $producerId);
  ```

**OrderController** (`backend/app/Http/Controllers/Api/V1/OrderController.php`):
- ✅ Line 75: `$this->authorize('create', Order::class)` - enforces OrderPolicy
- ✅ Line 137: Tracks `producer_id` in order_items for multi-producer orders

## Findings (risk-ranked)

### P0 (critical auth bypass)
**NONE FOUND** ✅

All critical paths enforce authorization:
1. Product create/update/delete → `authorize()` calls + ProductPolicy enforcement
2. Server-side producer_id auto-set (lines 111-121) prevents hijacking
3. Order creation → OrderPolicy prevents producers from creating orders
4. Producer routes → explicit ownership checks (`$product->producer_id !== $user->producer->id`)

### P1 (missing tests / weak scoping)
**NONE CRITICAL** ✅

Existing test coverage found (from Pass 5 & 6):
- ✅ 19 authorization tests PASS (53 assertions) - `backend/tests/Feature/AuthorizationTest.php`
  - Producer cannot update other producer's product (403)
  - Producer can update own product (200)
  - Admin can update any product (200)
  - Producer cannot delete other producer's product (403)
  - Producer can delete own product (204)
  - Producer cannot hijack producer_id
  - Producer gets only own products
  - Database enforces producer_id NOT NULL
- ✅ 54 order tests PASS (517 assertions) - Various order test files
  - Cart → order creation flow
  - Stock validation
  - Multi-producer support
  - Authorization enforcement

### P2 (cleanup / refactor opportunities)
1. **ProducerPolicy TODO** (low priority):
   - File: `backend/app/Policies/ProducerPolicy.php:13, 23`
   - Comment: "TODO: Tighten later with proper authorization"
   - Risk: Low (producers table is read-only for now, no sensitive data exposed)
   - Recommendation: Defer until producer profile editing is implemented

## Recommended next 3 passes (ordered, with evidence needed)

### Pass 9 (Optional): ProducerPolicy tightening
- **Scope**: Implement producer-can-only-edit-own-profile logic
- **DoD**:
  - ProducerPolicy has `update()` method (producer can update own profile, admin can update any)
  - Tests prove producer cannot edit other producer profiles
  - Frontend producer profile page calls backend API (not separate Prisma DB)
- **Effort**: 2-3 hours
- **Priority**: Low (no producer profile editing feature exists yet)

### Pass 10 (Optional): E2E authorization smoke tests
- **Scope**: Add Playwright E2E tests proving authorization works in browser
- **DoD**:
  - E2E test: Producer logs in, tries to edit other producer's product → sees 403/error
  - E2E test: Consumer logs in, tries to access producer dashboard → redirected/403
  - E2E test: Admin logs in, can edit any product
- **Effort**: 3-4 hours
- **Priority**: Medium (backend tests already comprehensive, E2E adds confidence)

### Pass 11 (Optional): Authorization audit CI check
- **Scope**: Add CI job that fails if authorization tests drop below threshold
- **DoD**:
  - CI job runs `php artisan test --filter=Authorization`
  - Fails if < 19 tests pass
  - Badge in README showing authorization test count
- **Effort**: 1-2 hours
- **Priority**: Low (existing CI already runs all tests)

## Minimal test plan

### PHPUnit (ALREADY EXIST ✅)
**File**: `backend/tests/Feature/AuthorizationTest.php` (495 lines, 19 tests)

**Coverage**:
1. ✅ `test_producer_cannot_update_other_producers_product` (lines 145-174)
2. ✅ `test_producer_can_update_own_product` (lines 178-201)
3. ✅ `test_admin_can_update_any_product` (lines 205-228)
4. ✅ `test_producer_cannot_delete_other_producers_product` (lines 232-251)
5. ✅ `test_producer_can_delete_own_product` (lines 256-269)
6. ✅ `test_admin_can_delete_any_product` (lines 274-287)
7. ✅ `test_producer_cannot_hijack_producer_id` (lines 317-347)
8. ✅ `test_producer_gets_only_own_products` (lines 351-391)
9. ✅ `test_database_enforces_producer_id_not_null` (lines 481-494)
10. ✅ Consumer/producer/admin order creation tests
11. ✅ Order viewing authorization tests
12. ✅ Producer order scoping tests

**Last run**: Pass 5 (2025-12-20) - 19 tests PASSED (53 assertions) in 1.21s

### Playwright (PARTIAL COVERAGE)
**File**: `frontend/tests/e2e/cart-backend-api.spec.ts` (Pass 7)

**Coverage**:
1. ✅ Consumer can create order from cart using backend API
2. ✅ Unauthenticated user redirected to login on checkout

**Gaps** (non-critical):
- ❌ Producer tries to edit other producer's product (E2E proof)
- ❌ Consumer tries to access producer dashboard (E2E proof)
- ❌ Admin can edit any product (E2E proof)

**Recommendation**: Defer E2E authorization tests to Pass 10 (optional).

## Conclusion

**PASS** ✅ - **NO CRITICAL AUTHORIZATION GAPS FOUND**

### Evidence summary:
1. ✅ ProductPolicy enforces producer_id ownership (line 48)
2. ✅ ProductController calls authorize() on create/update/delete (lines 106, 153, 173)
3. ✅ Server-side producer_id auto-set prevents hijacking (lines 111-121)
4. ✅ ProducerController has explicit ownership checks (lines 31, 113)
5. ✅ ProducerOrderController scopes orders by producer_id (lines 49, 101, 168)
6. ✅ OrderPolicy prevents producers from creating orders (line 50)
7. ✅ 19 authorization tests PASS (53 assertions)
8. ✅ 54 order tests PASS (517 assertions)
9. ✅ PROD endpoints healthy (verified 2025-12-20 22:51 UTC)

### Security posture:
- **Authentication**: ✅ Strong (auth:sanctum middleware on all CRUD routes)
- **Authorization**: ✅ Strong (ProductPolicy + OrderPolicy + explicit checks)
- **Ownership**: ✅ Enforced (server-side producer_id validation)
- **Scoping**: ✅ Present (queries filter by producer_id)
- **Test coverage**: ✅ Comprehensive (19 authorization tests, 54 order tests)
- **Regression prevention**: ✅ CI runs all tests on every PR

### Recommendations:
1. **No immediate action required** - authorization is secure
2. **Optional enhancements** (Passes 9-11) - defer until needed
3. **Continue WIP=1 discipline** - maintain test coverage on new features

## Referenced Files
- Policies: `backend/app/Policies/ProductPolicy.php:40-61`
- Policies: `backend/app/Policies/OrderPolicy.php:42-50`
- Controller: `backend/app/Http/Controllers/Api/V1/ProductController.php:106-173`
- Controller: `backend/app/Http/Controllers/Api/ProducerController.php:31,113`
- Controller: `backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php:49,101,168`
- Tests: `backend/tests/Feature/AuthorizationTest.php` (19 tests, 495 lines)
- Routes: `backend/routes/api.php:61,75,788`
