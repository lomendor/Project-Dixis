# Stage 3 Execution Audit - Producer Product CRUD

**Date**: 2025-12-20 00:15 UTC
**Status**: 🔴 **AUTHORIZATION GAP FOUND**
**Auditor**: Claude (automated)

---

## Executive Summary

**Finding**: **INCONSISTENT AUTHORIZATION ENFORCEMENT** between Create (backend) and Update/Delete (frontend-only).

- ✅ **Backend Authorization**: ProductPolicy enforces producer_id ownership with admin override
- ✅ **Create Flow**: Proxies to backend `/api/v1/products` → ProductPolicy ✅
- ❌ **Update/Delete Flow**: Uses Next.js Prisma directly → **NO ProductPolicy enforcement**
- ❌ **Admin Override**: Missing for Update/Delete (admins cannot override via frontend)

---

## Architecture Verification

### 1. Backend Routes + Policy Wiring ✅

**ProductPolicy Registration** (`backend/app/Providers/AuthServiceProvider.php:8,20`):
```php
use App\Policies\ProductPolicy;
...
Product::class => ProductPolicy::class,
```

**ProductPolicy Implementation** (`backend/app/Policies/ProductPolicy.php:33,46-48`):
```php
public function create(User $user): bool
{
    return $user->role === 'producer' || $user->role === 'admin';
}

public function update(User $user, Product $product): bool
{
    if ($user->role === 'admin') {
        return true; // Admin override
    }

    if ($user->role === 'producer') {
        return $user->producer && $product->producer_id === $user->producer->id;
    }

    return false;
}
```

**Controller Authorization** (`backend/app/Http/Controllers/Api/V1/ProductController.php:153`):
```php
public function update(UpdateProductRequest $request, Product $product): ProductResource
{
    $this->authorize('update', $product); // ✅ Policy enforced
    ...
}
```

**Routes Protection** (`backend/routes/api.php:75-78,788`):
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('products', [ProductController::class, 'store']);
    Route::patch('products/{product}', [ProductController::class, 'update']);
    Route::delete('products/{product}', [ProductController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('v1/producer')->group(function () {
    Route::get('products', [ProducerController::class, 'getProducts']);
    ...
});
```

**Verdict**: ✅ **Backend authorization correctly wired and tested** (47 tests PASS, 247 assertions)

---

### 2. Producer Endpoints Ownership Enforcement ✅

**ProducerController Methods** (`backend/app/Http/Controllers/Api/ProducerController.php`):
- Line 16: `toggleProduct(Request $request, Product $product)` - Uses `auth:sanctum` + route scoping
- Line 98: `updateStock(Request $request, Product $product)` - Uses `auth:sanctum` + route scoping
- Line 140: `getProducts(Request $request)` - Scoped query by `producer_id`

**Example Scoping** (from `getProducts` method):
```php
$query = Product::where('producer_id', $request->user()->producer->id)
    ->with(['categories', 'producer'])
    ->orderBy('created_at', 'desc');
```

**Verdict**: ✅ **Producer-scoped endpoints correctly filter by producer_id**

---

### 3. Frontend API Integration 🔴 **AUTHORIZATION GAP FOUND**

#### 3.1 AuthGuard Protection ✅

**Frontend Pages** (`frontend/src/app/my/products/*`):
- `page.tsx:37` - ✅ `<AuthGuard requireAuth={true} requireRole="producer">`
- `create/page.tsx:17` - ✅ `<AuthGuard requireAuth={true} requireRole="producer">`
- `[id]/edit/page.tsx:17` - ✅ `<AuthGuard requireAuth={true} requireRole="producer">`

**Verdict**: ✅ **Frontend pages protected by AuthGuard**

#### 3.2 API Endpoint Mapping 🔴 **INCONSISTENT**

| Frontend Endpoint | Next.js Route | Backend Endpoint | Authorization | Status |
|-------------------|---------------|------------------|---------------|--------|
| `GET /api/me/products` | `route.ts:12` | `/api/v1/producer/products` | ✅ Backend scoping | ✅ CORRECT |
| `POST /api/me/products` | `route.ts:107` | `/api/v1/products` | ✅ ProductPolicy | ✅ CORRECT |
| `GET /api/me/products/[id]` | `[id]/route.ts:9` | ❌ **Prisma direct** | ❌ Next.js only | 🔴 **GAP** |
| `PUT /api/me/products/[id]` | `[id]/route.ts:65` | ❌ **Prisma direct** | ❌ Next.js only | 🔴 **GAP** |
| `DELETE /api/me/products/[id]` | `[id]/route.ts:127` | ❌ **Prisma direct** | ❌ Next.js only | 🔴 **GAP** |

**Evidence - Create Flow (CORRECT)**:
`frontend/src/app/api/me/products/route.ts:134-148`
```typescript
// Call backend API (producer_id auto-set server-side)
const backendUrl = new URL(
  '/api/v1/products',
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001'
);

const response = await fetch(backendUrl.toString(), {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    ...
  },
  body: JSON.stringify(backendPayload),
});
```

**Evidence - Update Flow (INCORRECT)**:
`frontend/src/app/api/me/products/[id]/route.ts:77-94`
```typescript
// Update product scoped to this producer (prevents updating other producers' products)
const product = await prisma.product.updateMany({
  where: {
    id: productId,
    producerId: producer.id // ❌ Inline scoping, NOT ProductPolicy
  },
  data: { ... }
});
```

**Evidence - Delete Flow (INCORRECT)**:
`frontend/src/app/api/me/products/[id]/route.ts:136-141`
```typescript
// Delete product scoped to this producer
const result = await prisma.product.deleteMany({
  where: {
    id: productId,
    producerId: producer.id // ❌ Inline scoping, NOT ProductPolicy
  }
});
```

**Verdict**: 🔴 **AUTHORIZATION GAP - Update/Delete bypass ProductPolicy**

---

## Authorization Gaps Identified

### Gap #1: Update/Delete Routes Bypass ProductPolicy

**Severity**: 🔴 **MEDIUM-HIGH**

**Impact**:
1. **Admin Override Not Available**: Admins cannot update/delete products via frontend (ProductPolicy allows this, but Next.js routes don't)
2. **Inconsistent Authorization Logic**: Create uses ProductPolicy, Update/Delete use inline Prisma scoping
3. **Audit Trail Fragmentation**: Authorization scattered across Next.js + Laravel (harder to audit)
4. **Schema Drift Risk**: Next.js Prisma schema could diverge from Laravel migrations (breaking authorization)

**Evidence**:
- `backend/app/Policies/ProductPolicy.php:46-48` - Admin override implemented for update
- `frontend/src/app/api/me/products/[id]/route.ts:77-94` - No admin override check (only `producerId: producer.id`)

**Attack Scenario (Hypothetical)**:
1. Attacker becomes admin (compromised account or privilege escalation)
2. Attempts to edit producer product via frontend `/my/products/123/edit`
3. Frontend blocks with AuthGuard (`requireRole="producer"`) ✅
4. **BUT**: If frontend AuthGuard is bypassed (e.g., client-side manipulation, direct API call), the Next.js route will reject with 404 (no producerId match), not 403 (policy denial)
5. Admin cannot use legitimate override capability designed in ProductPolicy

**Root Cause**:
- GET/POST routes proxy to backend (uses ProductPolicy)
- PUT/DELETE routes use Prisma directly (bypasses ProductPolicy)
- Inconsistent architectural pattern within same API surface

---

## Test Coverage Analysis

### Backend Tests ✅

**Tests Run**: `php artisan test --filter "ProductsTest|AuthorizationTest"`

**Results**: ✅ **47 tests PASSED, 247 assertions, 2.21s**

**Key Authorization Tests** (from `AuthorizationTest.php`):
- ✅ `producer cannot update other producers product` (Line 2.02s)
- ✅ `producer can update own product` (Line 2.01s)
- ✅ `admin can update any product` (Line 2.02s)
- ✅ `producer cannot delete other producers product` (Line 2.02s)
- ✅ `producer create auto sets producer id` (Line 2.02s)
- ✅ `producer cannot hijack producer id` (Line 2.02s)
- ✅ `producer gets only own products` (Line 2.02s)

**Verdict**: ✅ **Backend authorization fully tested and working**

### Frontend Tests ❌ **MISSING**

**E2E Test Check**: No Playwright tests found for producer product CRUD authorization scenarios.

**Missing Coverage**:
1. ❌ Producer attempts to edit other producer's product via frontend → Expect 404/403
2. ❌ Producer creates product → Verify backend auto-assigns producer_id (not hijackable)
3. ❌ Producer updates own product → Verify success
4. ❌ Producer deletes own product → Verify success
5. ❌ Admin overrides producer product update → Verify success (if frontend supports admin)

**Recommendation**: Add E2E tests for producer CRUD workflows (see PHASE 2 plan)

---

## Definition of Done - Current Status

### Backend Verification ✅

- [x] **403 on editing other producer's product**: ✅ `AuthorizationTest` covers this (test PASSING)
- [x] **200/201 on own product CRUD**: ✅ `ProductsTest` covers create/update/delete (tests PASSING)
- [x] **Tests**: ✅ 47 tests PASSING (all authorization scenarios covered)

### Frontend Verification 🔴

- [ ] **Producer dashboard shows ONLY own products**: ⚠️ Manual test needed (no E2E test)
- [ ] **E2E: Create → Edit → Verify catalog update**: ❌ MISSING
- [ ] **E2E: Attempt edit other producer's product → 403/blocked**: ❌ MISSING

---

## Recommended Fixes (Smallest Change First)

### Option 1: Proxy Update/Delete to Backend (RECOMMENDED) ✅

**Scope**: Modify `/api/me/products/[id]/route.ts` to proxy UPDATE/DELETE to backend (like CREATE does)

**Files Changed**: 1 file (`frontend/src/app/api/me/products/[id]/route.ts`)

**Benefits**:
- ✅ Consistent authorization via ProductPolicy
- ✅ Admin override capability restored
- ✅ Single source of truth for authorization logic
- ✅ Minimal change (update 2 functions: PUT + DELETE)

**Example Fix** (PUT method):
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireProducer(); // Keep AuthGuard

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Proxy to backend PATCH /api/v1/products/{id}
    const backendUrl = new URL(
      `/api/v1/products/${params.id}`,
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001'
    );

    const response = await fetch(backendUrl.toString(), {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to update product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, product: data.data });

  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
```

**Testing**: Run existing backend tests (already PASSING) + add E2E test

---

### Option 2: Add Admin Override to Next.js Routes (NOT RECOMMENDED)

**Scope**: Modify Next.js routes to check `user.role === 'admin'` and bypass `producerId` check

**Files Changed**: 1 file + requires admin context in `requireProducer()` helper

**Issues**:
- ❌ Duplicates authorization logic (violates DRY)
- ❌ Two places to maintain authorization (Next.js + Laravel)
- ❌ Schema drift risk remains
- ❌ More complex than Option 1

---

## Next Actions (PHASE 2)

Based on user's constraint: **"Fix ONLY the first confirmed authorization gap"**

### Action Plan:
1. ✅ **PHASE 1 COMPLETE**: Audit documented (this file)
2. **PHASE 2**: Fix Gap #1 (Update/Delete routes) using Option 1 (proxy to backend)
3. **PHASE 3**: Add E2E test for producer product CRUD authorization
4. **PHASE 4**: Update STATE.md + AGENT-STATE.md with Stage 3 completion

**Constraints**:
- WIP=1 (one fix at a time)
- Smallest change first (modify 1 file: `[id]/route.ts`)
- No new features (only enforce existing ProductPolicy)
- Verify tests PASS before commit

---

## Conclusion

**Stage 3 Goal**: Verify Producer CRUD ownership is enforced end-to-end ✅ **PARTIALLY MET**

**Backend**: ✅ **FULLY VERIFIED** - ProductPolicy enforces ownership, 47 tests PASS
**Frontend**: 🔴 **AUTHORIZATION GAP FOUND** - Update/Delete bypass ProductPolicy

**First Confirmed Gap**: Update/Delete routes use Prisma directly instead of proxying to backend

**Recommended Fix**: Proxy Update/Delete to backend `/api/v1/products/{id}` (1 file change)

**Risk Level**: MEDIUM-HIGH (admin override missing, inconsistent authorization)

---

**Document Owner**: Claude (automated audit)
**Last Updated**: 2025-12-20 00:15 UTC
**Next Action**: Fix Gap #1 (PHASE 2)
