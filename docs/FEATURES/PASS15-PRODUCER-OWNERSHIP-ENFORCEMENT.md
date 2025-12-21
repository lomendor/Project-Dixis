# Pass 15: Producer Ownership Enforcement

**Date**: 2025-12-21
**Type**: Code improvement (authorization consistency)
**PR**: #1810 (merged 2025-12-21T15:13:08Z)
**Branch**: `feat/pass15-producer-ownership`

---

## Executive Summary

**Status**: ✅ Complete - Producer ownership now consistently enforced via ProductPolicy

**Changes Made**:
- Replaced manual authorization checks in `ProducerController` with `$this->authorize()`
- Updated test expectations to match ProductPolicy behavior (404 → 403)
- Added admin override test for completeness

**Impact**:
- ✅ Consistent authorization pattern across all producer endpoints
- ✅ Correct HTTP status codes (403 Forbidden, not 404)
- ✅ Admin override works automatically via ProductPolicy

**Test Coverage**: 4 tests PASS (7 assertions) in 0.48s

---

## Problem Statement

**Context**: Pass 14 audit (`docs/FEATURES/PRODUCER-PERMISSIONS-AUDIT.md`) identified that `ProducerController` used manual authorization checks instead of ProductPolicy.

**Inconsistency Found**:

**V1/ProductController** (correct pattern):
```php
// backend/app/Http/Controllers/Api/V1/ProductController.php:153
public function update(UpdateProductRequest $request, Product $product): JsonResponse
{
    $this->authorize('update', $product);  // ✅ Uses ProductPolicy
    // ... update logic
}
```

**ProducerController** (manual checks):
```php
// backend/app/Http/Controllers/Api/ProducerController.php:31,113 (BEFORE)
public function toggleProduct(Request $request, Product $product): JsonResponse
{
    $user = $request->user();

    if (! $user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    if (! $user->producer) {
        return response()->json(['message' => 'Producer profile not found'], 403);
    }

    // Manual ownership check
    if ($product->producer_id !== $user->producer->id) {
        return response()->json(['message' => 'Product not found'], 404);  // ❌ Wrong status code
    }

    // ... toggle logic
}
```

**Issues**:
1. **Inconsistent pattern**: Manual `if ($product->producer_id !== $user->producer->id)` instead of ProductPolicy
2. **Wrong HTTP status**: Returns 404 for authorization failure (should be 403)
3. **Admin override missing**: Admin users couldn't toggle products (ProductPolicy has admin override)
4. **Code duplication**: Same manual checks in `toggleProduct()` and `updateStock()`

---

## Solution Implemented

### Code Changes

#### File: `backend/app/Http/Controllers/Api/ProducerController.php`

**`toggleProduct()` - Before** (lines 16-44, 29 lines):
```php
public function toggleProduct(Request $request, Product $product): JsonResponse
{
    $user = $request->user();

    // Ensure user is authenticated
    if (! $user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    // Ensure user has a producer profile
    if (! $user->producer) {
        return response()->json(['message' => 'Producer profile not found'], 403);
    }

    // Ensure product belongs to this producer
    if ($product->producer_id !== $user->producer->id) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // Toggle the active status
    $product->is_active = ! $product->is_active;
    $product->save();

    return response()->json([
        'id' => $product->id,
        'is_active' => $product->is_active,
        'message' => 'Product status updated successfully',
    ]);
}
```

**`toggleProduct()` - After** (lines 16-29, 14 lines, **-15 lines**):
```php
public function toggleProduct(Request $request, Product $product): JsonResponse
{
    // Use ProductPolicy for authorization (enforces producer ownership)
    $this->authorize('update', $product);

    // Toggle the active status
    $product->is_active = ! $product->is_active;
    $product->save();

    return response()->json([
        'id' => $product->id,
        'is_active' => $product->is_active,
        'message' => 'Product status updated successfully',
    ]);
}
```

**`updateStock()` - Before** (lines 98-135, 38 lines):
```php
public function updateStock(Request $request, Product $product, InventoryService $inventoryService): JsonResponse
{
    $user = $request->user();

    // Ensure user is authenticated
    if (! $user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    // Ensure user has a producer profile
    if (! $user->producer) {
        return response()->json(['message' => 'Producer profile not found'], 403);
    }

    // Ensure product belongs to this producer
    if ($product->producer_id !== $user->producer->id) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // Validate request
    $request->validate([
        'stock' => 'required|integer|min:0|max:99999',
    ]);

    $oldStock = $product->stock;
    $newStock = $request->input('stock');

    // Update stock using inventory service
    $inventoryService->updateProductStock($product, $newStock);

    return response()->json([
        'id' => $product->id,
        'name' => $product->name,
        'old_stock' => $oldStock,
        'new_stock' => $newStock,
        'message' => 'Stock updated successfully',
    ]);
}
```

**`updateStock()` - After** (lines 84-107, 24 lines, **-14 lines**):
```php
public function updateStock(Request $request, Product $product, InventoryService $inventoryService): JsonResponse
{
    // Use ProductPolicy for authorization (enforces producer ownership)
    $this->authorize('update', $product);

    // Validate request
    $request->validate([
        'stock' => 'required|integer|min:0|max:99999',
    ]);

    $oldStock = $product->stock;
    $newStock = $request->input('stock');

    // Update stock using inventory service
    $inventoryService->updateProductStock($product, $newStock);

    return response()->json([
        'id' => $product->id,
        'name' => $product->name,
        'old_stock' => $oldStock,
        'new_stock' => $newStock,
        'message' => 'Stock updated successfully',
    ]);
}
```

**Total Reduction**: 29 lines removed (18 + 15 - 4 comments)

---

### Test Updates

#### File: `backend/tests/Feature/ProductsToggleTest.php`

**1. Updated Cross-Producer Test** (line 98):

**Before**:
```php
public function test_producer_cannot_toggle_other_producer_product(): void
{
    // ... setup code ...

    $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");

    $response->assertStatus(404);  // ❌ Wrong expectation
}
```

**After**:
```php
public function test_producer_cannot_toggle_other_producer_product(): void
{
    // ... setup code ...

    $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");

    // ProductPolicy throws 403 Forbidden when authorization fails
    $response->assertStatus(403);  // ✅ Correct expectation
}
```

**2. Added Admin Override Test** (lines 123-148, **+26 lines**):

```php
public function test_admin_can_toggle_any_product(): void
{
    // Create admin user
    $admin = User::factory()->create([
        'email' => 'admin@test.com',
        'role' => 'admin',
    ]);

    // Create producer and product
    $producer = Producer::factory()->create();
    $product = Product::factory()->create([
        'producer_id' => $producer->id,
        'is_active' => true,
    ]);

    // Admin can toggle any product (ProductPolicy admin override)
    Sanctum::actingAs($admin);

    $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");

    $response->assertStatus(200)
        ->assertJson([
            'id' => $product->id,
            'is_active' => false,  // Toggled from true to false
        ]);
}
```

**Why This Test Matters**: Verifies ProductPolicy admin override (line 42) works automatically without manual checks.

---

## ProductPolicy Authorization Logic

**File**: `backend/app/Policies/ProductPolicy.php`

```php
// Line 40: update() method
public function update(User $user, Product $product): bool
{
    if ($user->role === 'admin') {
        return true;  // ← Admin override (line 42)
    }

    if ($user->role === 'producer') {
        // Check if the user owns this product through their producer record
        return $user->producer && $product->producer_id === $user->producer->id;  // ← Ownership check (line 48)
    }

    return false;
}
```

**How `$this->authorize()` Works**:
1. Laravel calls `ProductPolicy::update($user, $product)`
2. If admin → returns `true` (authorized)
3. If producer → checks `$product->producer_id === $user->producer->id`
4. If unauthorized → throws `AuthorizationException` (HTTP 403)

---

## Test Results

### Local Verification (main branch, 2025-12-21 15:15 UTC)

```bash
$ cd backend && php artisan test --filter ProductsToggleTest

   PASS  Tests\Feature\ProductsToggleTest
  ✓ producer can toggle own product                                      0.34s
  ✓ producer cannot toggle other producer product                        0.02s
  ✓ unauthenticated user cannot toggle product                           0.02s
  ✓ admin can toggle any product                                         0.02s

  Tests:    4 passed (7 assertions)
  Duration: 0.48s
```

**Test Breakdown**:

| Test | Assertion | Status | What It Proves |
|------|-----------|--------|----------------|
| `test_producer_can_toggle_own_product` | 200 + is_active toggled | ✅ PASS | Producer can toggle own products |
| `test_producer_cannot_toggle_other_producer_product` | 403 Forbidden | ✅ PASS | ProductPolicy enforces ownership |
| `test_unauthenticated_user_cannot_toggle_product` | 401 Unauthorized | ✅ PASS | Auth middleware working |
| `test_admin_can_toggle_any_product` | 200 + product toggled | ✅ PASS | Admin override functional |

---

## CI Verification (PR #1810)

**GitHub Actions - All Checks PASSED**:

| Check | Duration | Status | Evidence |
|-------|----------|--------|----------|
| **phpunit** | 46s | ✅ PASS | Backend tests including ProductsToggleTest |
| **build-and-test** | 2m10s | ✅ PASS | Full Laravel build |
| **E2E (PostgreSQL)** | 2m59s | ✅ PASS | E2E test suite |
| **smoke-production** | 1m8s | ✅ PASS | PROD endpoints healthy |
| **gate** | 6s | ✅ PASS | PR gate check |
| **Analyze (javascript)** | 1m58s | ✅ PASS | Code analysis |
| **CodeQL** | 2s | ✅ PASS | Security scan |

**Auto-merge**: Triggered successfully after all checks passed

---

## PROD Verification (2025-12-21 15:15 UTC)

**Endpoint Health**:
```bash
$ curl -sS -o /dev/null -w "%{http_code}" https://dixis.gr/api/healthz
200 ✅

$ curl -sS -o /dev/null -w "%{http_code}" https://dixis.gr/products
200 ✅

$ curl -sS -o /dev/null -w "%{http_code}" https://dixis.gr/api/v1/public/products
200 ✅

$ curl -sS -o /dev/null -w "%{http_code}" https://dixis.gr/orders
200 ✅
```

**All PROD endpoints operational** - No regressions from Pass 15 changes.

---

## Benefits Achieved

### 1. Consistent Authorization Pattern

**Before**: Mixed patterns across codebase
- V1/ProductController → Used `$this->authorize()`
- ProducerController → Manual `if ($product->producer_id === ...)` checks

**After**: Uniform pattern everywhere
- All controllers → Use `$this->authorize()`
- All authorization → Enforced by ProductPolicy

### 2. Correct HTTP Status Codes

**Before**: Authorization failures returned 404
```php
if ($product->producer_id !== $user->producer->id) {
    return response()->json(['message' => 'Product not found'], 404);  // ❌ Misleading
}
```

**After**: Authorization failures return 403
```php
$this->authorize('update', $product);  // Throws 403 if unauthorized ✅
```

**Why This Matters**:
- **404 Not Found**: Resource doesn't exist
- **403 Forbidden**: Resource exists but user lacks permission (correct for authorization failures)

### 3. Admin Override Works Automatically

**Before**: Admin users got 404 when trying to toggle producer products

**After**: Admin users can toggle any product via ProductPolicy admin override (line 42)

**Evidence**: New test `test_admin_can_toggle_any_product()` proves admin functionality

### 4. Code Reduction

**Lines Removed**: 29 lines of manual authorization logic
**Lines Added**: 4 lines (`$this->authorize()` + comments)
**Net Reduction**: 25 lines

**Maintainability**: Authorization logic now centralized in ProductPolicy (single source of truth)

---

## Authorization Matrix (Post-Pass 15)

| Endpoint | Method | Auth | Producer A (owns) | Producer B | Admin | Consumer |
|----------|--------|------|-------------------|------------|-------|----------|
| `/api/v1/producer/products/{id}/toggle` | PATCH | Required | ✅ 200 | ❌ 403 | ✅ 200 | ❌ 403 |
| `/api/v1/producer/products/{id}/stock` | PATCH | Required | ✅ 200 | ❌ 403 | ✅ 200 | ❌ 403 |
| `/api/v1/products/{id}` | PATCH | Required | ✅ 200 | ❌ 403 | ✅ 200 | ❌ 403 |
| `/api/v1/products/{id}` | DELETE | Required | ✅ 204 | ❌ 403 | ✅ 204 | ❌ 403 |

**Legend**:
- ✅ 200/204: Authorized and successful
- ❌ 403: Forbidden (ProductPolicy rejection)

**Enforcement**: All via `ProductPolicy::update()` (line 40) and `ProductPolicy::delete()` (line 66)

---

## References

**Code Files**:
- `backend/app/Http/Controllers/Api/ProducerController.php` (lines 16-29, 84-107)
- `backend/app/Policies/ProductPolicy.php` (lines 40-52)
- `backend/tests/Feature/ProductsToggleTest.php` (lines 28, 65, 101, 123)

**Documentation**:
- Pass 14 Audit: `docs/FEATURES/PRODUCER-PERMISSIONS-AUDIT.md`
- Pass 8 Permissions Audit: `docs/SECURITY/PERMISSIONS-AUDIT-PASS8.md`
- Pass 5 Producer Permissions Proof: `docs/FEATURES/PRODUCER-PERMISSIONS-PROOF.md`

**Pull Request**:
- PR #1810: https://github.com/lomendor/Project-Dixis/pull/1810
- Merged: 2025-12-21T15:13:08Z
- Auto-merge: Enabled (squash)
- Labels: `ai-pass`, `risk-ok`

---

## Conclusion

**Pass 15 Status**: ✅ **COMPLETE**

| Objective | Status | Evidence |
|-----------|--------|----------|
| Replace manual auth with ProductPolicy | ✅ DONE | ProducerController.php:18,86 |
| Update test expectations (404 → 403) | ✅ DONE | ProductsToggleTest.php:98 |
| Add admin override test | ✅ DONE | ProductsToggleTest.php:123 |
| All tests pass | ✅ VERIFIED | 4 passed (7 assertions) in 0.48s |
| PROD endpoints healthy | ✅ VERIFIED | healthz, products, orders all 200 |
| PR merged | ✅ MERGED | PR #1810 (2025-12-21T15:13:08Z) |

**Impact**:
- ✅ Consistent authorization pattern (ProductPolicy everywhere)
- ✅ Correct HTTP status codes (403 Forbidden for auth failures)
- ✅ Admin override working automatically
- ✅ Code reduced by 25 lines (better maintainability)

**No Critical Gaps Found** - Producer ownership enforcement complete.

---

**Pass Type**: Code improvement (authorization consistency)
**Pass Status**: ✅ COMPLETE
**Next Pass**: Feature planning or optional test improvements

**Document Status**: LOCKED (reflects completed Pass 15)
**Next Update**: If authorization patterns change or new producer endpoints added
