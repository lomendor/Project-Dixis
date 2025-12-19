# Producer Permissions Audit (Stage 2)

**Date**: 2025-12-19
**Auditor**: Claude (automated audit)
**Scope**: Verify producer_id ownership enforcement in ProductPolicy, controllers, and frontend

---

## Executive Summary

**Status**: ✅ **PASS**
**Verdict**: Producer permissions are correctly enforced. No authorization bugs found.

- ✅ ProductPolicy enforces producer_id ownership for update/delete
- ✅ Admin override works correctly
- ✅ Backend endpoints properly scope products to authenticated producer
- ✅ Frontend dashboard only fetches producer's own products
- ✅ Comprehensive test coverage exists (12 authorization tests)
- ✅ No code changes required

---

## Goal

Verify that:
1. Producers can ONLY edit their own products (enforced by `producer_id` foreign key)
2. Admin can override and edit any product
3. E2E test coverage exists for authorization rules
4. Frontend dashboard is properly scoped

---

## Audit Findings

### 1. Backend: ProductPolicy (Authorization Layer)

**File**: `backend/app/Policies/ProductPolicy.php`

#### ✅ Create Policy (Lines 31-34)
```php
public function create(User $user): bool
{
    return $user->role === 'producer' || $user->role === 'admin';
}
```
- Producers and admins can create products
- Consumers are denied (403)

#### ✅ Update Policy (Lines 40-52)
```php
public function update(User $user, Product $product): bool
{
    if ($user->role === 'admin') {
        return true; // Admin override
    }

    if ($user->role === 'producer') {
        // Check if the user owns this product through their producer record
        return $user->producer && $product->producer_id === $user->producer->id;
    }

    return false;
}
```
**Security Analysis**:
- ✅ **Admin override**: Admins can edit any product (line 42)
- ✅ **Producer ownership check**: `$product->producer_id === $user->producer->id` (line 48)
- ✅ **Null safety**: Checks `$user->producer` exists before accessing `id`
- ✅ **Default deny**: Returns `false` for consumers (line 51)

#### ✅ Delete Policy (Lines 58-61)
```php
public function delete(User $user, Product $product): bool
{
    return $this->update($user, $product); // Same rules as update
}
```
- Delegates to `update()` policy (DRY principle)
- Same ownership checks apply

**Verdict**: ✅ Policy correctly enforces producer_id ownership with admin override.

---

### 2. Backend: ProductController (API Layer)

**File**: `backend/app/Http/Controllers/Api/V1/ProductController.php`

#### ✅ Store Method (Lines 104-132)
```php
public function store(StoreProductRequest $request): ProductResource
{
    $this->authorize('create', Product::class); // Line 106

    $data = $request->validated();
    $user = $request->user();

    // Security: Auto-set producer_id from authenticated user (server-side)
    // Never trust client for ownership. Admin can override via request.
    if ($user->role === 'producer') {
        if (!$user->producer) {
            return response()->json([...], 403);
        }
        $data['producer_id'] = $user->producer->id; // Line 119 - Server-side override
    }
    // Admin can specify producer_id from request (already validated)

    $product = Product::create($data);
    return new ProductResource($product);
}
```
**Security Strengths**:
- ✅ **Authorization check**: Calls `$this->authorize('create', Product::class)` (line 106)
- ✅ **Server-side producer_id**: Producers CANNOT hijack other producer's ID (line 119)
- ✅ **Admin flexibility**: Admins can specify any producer_id (line 121)
- ✅ **Comment clarity**: Explicitly states "Never trust client for ownership"

#### ✅ Update Method (Lines 151-166)
```php
public function update(UpdateProductRequest $request, Product $product): ProductResource
{
    $this->authorize('update', $product); // Line 153
    $data = $request->validated();
    // ... slug generation ...
    $product->update($data);
    return new ProductResource($product);
}
```
**Security**:
- ✅ Calls `$this->authorize('update', $product)` which invokes ProductPolicy::update()
- ✅ ProductPolicy checks `product->producer_id === auth.user.producer.id`

#### ✅ Destroy Method (Lines 171-178)
```php
public function destroy(Product $product): JsonResponse
{
    $this->authorize('delete', $product); // Line 173
    $product->delete();
    return response()->json(['message' => 'Product deleted successfully'], 204);
}
```
**Security**:
- ✅ Calls `$this->authorize('delete', $product)` which delegates to `update()` policy

**Verdict**: ✅ All CRUD operations use Laravel's authorization layer correctly.

---

### 3. Backend: ProducerController (Dashboard Scoping)

**File**: `backend/app/Http/Controllers/Api/ProducerController.php`

#### ✅ getProducts Method (Lines 140-193)
```php
public function getProducts(Request $request): JsonResponse
{
    $user = $request->user();
    if (!$user || !$user->producer) {
        return response()->json(['message' => 'Unauthenticated/Forbidden'], 401/403);
    }

    $producer = $user->producer;
    $query = $producer->products()->orderBy('name', 'asc'); // Line 169 - Automatic scoping

    // ... search/filter logic ...
    $products = $query->paginate($perPage);
    return response()->json([...]);
}
```
**Scoping Analysis**:
- ✅ **Eloquent relationship**: `$producer->products()` automatically adds `WHERE producer_id = ?`
- ✅ **No manual filtering needed**: Relationship handles scoping
- ✅ **Auth checks**: Verifies user has producer profile (lines 145-152)

#### ✅ toggleProduct Method (Lines 16-44)
```php
public function toggleProduct(Request $request, Product $product): JsonResponse
{
    $user = $request->user();
    if (!$user || !$user->producer) {
        return response()->json([...], 401/403);
    }

    // Ensure product belongs to this producer
    if ($product->producer_id !== $user->producer->id) {
        return response()->json(['message' => 'Product not found'], 404); // Line 32
    }

    $product->is_active = !$product->is_active;
    $product->save();
    return response()->json([...]);
}
```
**Security**:
- ✅ **Explicit ownership check**: Line 31 validates `product->producer_id === auth.user.producer.id`
- ✅ **404 instead of 403**: Prevents information disclosure (attacker can't enumerate products)

#### ✅ updateStock Method (Lines 98-135)
```php
// Ensure product belongs to this producer
if ($product->producer_id !== $user->producer->id) {
    return response()->json(['message' => 'Product not found'], 404); // Line 113
}
```
**Security**:
- ✅ Same ownership check as `toggleProduct`

**Verdict**: ✅ Producer dashboard endpoints are properly scoped to authenticated producer.

---

### 4. Frontend: Dashboard Scoping

**File**: `frontend/src/app/my/products/page.tsx`

#### ✅ Products Fetch (Lines 114-131)
```typescript
const loadProducts = async (q = '', category = '') => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  const url = `/api/me/products${params.toString() ? `?${params}` : ''}`;

  const response = await fetch(url); // Line 121
  if (response.ok) {
    const data = await response.json();
    setProducts(data.products || []);
  }
};
```
**Analysis**:
- ✅ **Calls scoped endpoint**: `/api/me/products` (frontend Next.js API route)
- ✅ **No producer_id in query**: Cannot manually specify producer to fetch

**File**: `frontend/src/app/api/me/products/route.ts`

#### ✅ Frontend API Proxy (Lines 32-49)
```typescript
const backendUrl = new URL(
  '/api/v1/producer/products',  // Line 33 - Calls scoped backend endpoint
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001'
);

// Call backend scoped endpoint with session token
const response = await fetch(backendUrl.toString(), {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,  // Line 45 - Auth token identifies producer
    'Accept': 'application/json',
  },
  cache: 'no-store',
});
```
**Security**:
- ✅ **Proxies to scoped endpoint**: Calls `/api/v1/producer/products` (backend ProducerController::getProducts)
- ✅ **Auth token scoping**: Bearer token identifies user → backend extracts producer_id
- ✅ **No manual producer_id**: Cannot be overridden by client

**Verdict**: ✅ Frontend dashboard is properly scoped. Producers only see their own products.

---

### 5. Test Coverage

**File**: `backend/tests/Feature/AuthorizationTest.php`

#### ✅ Comprehensive Authorization Tests (12 tests)

| Test Name | Line | Coverage |
|-----------|------|----------|
| `test_consumer_cannot_create_products` | 18-33 | ✅ Consumer role denied (403) |
| `test_producer_can_create_products` | 36-51 | ✅ Producer role allowed (201) |
| `test_consumer_can_create_orders` | 54-80 | ✅ Consumer can order products |
| `test_producer_cannot_create_orders` | 83-104 | ✅ Producer cannot be consumer |
| `test_admin_has_full_access` | 107-141 | ✅ Admin override works |
| `test_producer_cannot_update_other_producers_product` | 145-174 | ✅ **Cross-producer protection** (403) |
| `test_producer_can_update_own_product` | 178-201 | ✅ Own product update allowed (200) |
| `test_admin_can_update_any_product` | 205-228 | ✅ Admin override confirmed |
| `test_producer_cannot_delete_other_producers_product` | 232-251 | ✅ Cross-producer delete blocked (403) |
| `test_producer_create_auto_sets_producer_id` | 255-277 | ✅ Server-side producer_id enforcement |
| `test_producer_cannot_hijack_producer_id` | 281-311 | ✅ **Security test**: Client cannot override producer_id |
| `test_producer_gets_only_own_products` | 315-355 | ✅ Dashboard scoping verified |

**Key Security Tests**:

1. **Cross-Producer Update Block** (Lines 145-174):
```php
// Producer B tries to update Producer A's product
$response = $this->actingAs($producerBUser, 'sanctum')
    ->patchJson("/api/v1/products/{$productA->id}", $updateData);

$response->assertStatus(403); // Forbidden ✅

// Verify product was NOT updated
$this->assertDatabaseHas('products', [
    'id' => $productA->id,
    'name' => 'Producer A Product',  // Original name unchanged
    'price' => 10.00,
]);
```

2. **Producer ID Hijack Prevention** (Lines 281-311):
```php
// Producer A tries to create product with Producer B's ID
$productData = [
    'name' => 'Hijack Attempt',
    'producer_id' => $producerB->id,  // Malicious: different producer
];

$response = $this->actingAs($producerAUser, 'sanctum')
    ->postJson('/api/v1/products', $productData);

// Verify product was created with Producer A's ID (server-side override)
$this->assertDatabaseHas('products', [
    'name' => 'Hijack Attempt',
    'producer_id' => $producerA->id,  // ✅ Server forced correct ID
]);

// Verify product was NOT created for Producer B
$this->assertDatabaseMissing('products', [
    'name' => 'Hijack Attempt',
    'producer_id' => $producerB->id,  // ✅ Hijack failed
]);
```

3. **Dashboard Scoping** (Lines 315-385):
```php
// Producer A fetches their products
$response = $this->actingAs($producerAUser, 'sanctum')
    ->getJson('/api/v1/producer/products');

$data = $response->json('data');
$this->assertCount(2, $data);  // Only Producer A's 2 products

$productIds = collect($data)->pluck('id')->toArray();
$this->assertContains($productA1->id, $productIds);  // ✅ Own product
$this->assertContains($productA2->id, $productIds);  // ✅ Own product
$this->assertNotContains($productB1->id, $productIds);  // ✅ Other producer's product excluded
```

**Verdict**: ✅ Test coverage is comprehensive. All critical authorization paths are tested.

---

## Database Constraints

**File**: `backend/database/migrations/*_create_products_table.php`

### ✅ Foreign Key Constraint
```php
$table->foreignId('producer_id')
    ->constrained('producers')
    ->onDelete('cascade');
```
**Protection**:
- ✅ **NOT NULL**: Product MUST have a producer (orphan products impossible)
- ✅ **Foreign key**: `producer_id` must reference valid `producers.id`
- ✅ **Cascade delete**: Deleting producer deletes all their products

**Test Verification** (AuthorizationTest.php:445-458):
```php
public function test_database_enforces_producer_id_not_null(): void
{
    $this->expectException(\Illuminate\Database\QueryException::class);
    $this->expectExceptionMessageMatches('/not-null|NOT NULL/i');

    // Attempt to create product without producer_id (should fail)
    Product::factory()->create(['producer_id' => null]);  // ✅ Database rejects
}
```

**Verdict**: ✅ Database schema enforces referential integrity.

---

## Authorization Flow Summary

### Create Product Flow
```
1. POST /api/v1/products
2. ProductController::store()
   ├─ $this->authorize('create', Product::class)  ← ProductPolicy::create()
   │  └─ Check: user.role === 'producer' OR 'admin' ✅
   ├─ If producer: server sets producer_id = auth.user.producer.id ✅
   └─ Product::create($data) ✅
```

### Update Product Flow
```
1. PATCH /api/v1/products/{id}
2. ProductController::update(Product $product)
   ├─ $this->authorize('update', $product)  ← ProductPolicy::update()
   │  ├─ If admin: return true ✅ (admin override)
   │  ├─ If producer: check product.producer_id === auth.user.producer.id ✅
   │  └─ Else: return false (consumer denied) ✅
   └─ $product->update($data) ✅
```

### Dashboard Products Fetch Flow
```
1. GET /api/me/products (frontend Next.js API)
   └─ Proxies to: GET /api/v1/producer/products (backend)
2. ProducerController::getProducts()
   ├─ Check: auth.user.producer exists ✅
   ├─ $query = $producer->products()  ← Eloquent relationship
   │  └─ Automatic WHERE clause: producer_id = ? ✅
   └─ return $query->paginate() ✅
```

---

## Security Strengths

1. ✅ **Defense in Depth**:
   - Database: Foreign key constraint + NOT NULL
   - Backend: ProductPolicy authorization layer
   - Controller: Server-side producer_id enforcement
   - Frontend: Scoped API endpoints (no manual producer_id)

2. ✅ **Fail-Safe Defaults**:
   - ProductPolicy::update() returns `false` by default (deny unless explicitly allowed)
   - ProducerController checks `$user->producer` exists before proceeding

3. ✅ **Admin Override**:
   - Admins can edit any product (ProductPolicy line 42)
   - Tested in `test_admin_can_update_any_product`

4. ✅ **Information Disclosure Prevention**:
   - Returns 404 "Product not found" instead of 403 "Forbidden" (ProducerController:32)
   - Prevents attackers from enumerating other producers' product IDs

5. ✅ **Server-Side Enforcement**:
   - Producer ID is set server-side (ProductController:119)
   - Client cannot hijack another producer's ID (tested in line 281-311)

---

## Gaps Found

**None**. No authorization bugs or missing checks found.

---

## Tests to Add (if missing)

### ✅ Already Covered
All critical authorization paths are tested:
- ✅ Producer cannot update other producer's products
- ✅ Producer cannot delete other producer's products
- ✅ Producer cannot hijack producer_id on create
- ✅ Producer dashboard only shows own products
- ✅ Admin can edit any product
- ✅ Database enforces producer_id NOT NULL

### Optional Enhancements (nice-to-have, not critical)
1. **E2E Test**: Playwright test for producer dashboard scoping
   - Login as Producer A → Verify can only see own products
   - Login as Producer B → Verify cannot see Producer A's products
   - **Status**: Not critical (backend tests provide coverage)

2. **Policy Unit Test**: Dedicated ProductPolicyTest.php
   - Direct policy method testing (without HTTP layer)
   - **Status**: Not critical (covered by AuthorizationTest.php via HTTP)

---

## Decision

**Status**: ✅ **PASS**
**Action**: NO CODE CHANGES REQUIRED

### Rationale
1. ProductPolicy correctly enforces producer_id ownership
2. Admin override works as expected
3. Backend controllers use authorization layer properly
4. Frontend dashboard is scoped to authenticated producer
5. Comprehensive test coverage exists (12 authorization tests)
6. Database schema enforces referential integrity
7. No security bugs or authorization gaps found

### Recommendations
1. ✅ **Keep current implementation**: No changes needed
2. ✅ **Monitor**: Continue running existing authorization tests in CI
3. 📋 **Future enhancement** (optional): Add E2E Playwright test for producer dashboard scoping (low priority)

---

## Audit Completed

**Date**: 2025-12-19 19:45 UTC
**Audited by**: Claude (automated audit)
**Files reviewed**: 6 backend files, 2 frontend files, 1 test file
**Test coverage**: 12 authorization tests (all passing)
**Verdict**: ✅ PASS - No authorization bugs found

**Next steps**: Move to CLOSED in STATE.md, proceed with next item (Checkout flow smoke test).
