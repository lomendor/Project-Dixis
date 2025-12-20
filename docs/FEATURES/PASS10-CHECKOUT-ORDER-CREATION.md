# Pass 10 — Checkout → Order Creation (Audit + Plan)

**Date**: 2025-12-21
**Status**: AUDIT COMPLETE - ONE MINIMAL FIX IDENTIFIED

## PROD Facts (2025-12-21 00:35 UTC)
```
healthz=200     ✅
products=200    ✅
cart=200        ✅
checkout=200    ✅
orders=404      ❌ <- PRIMARY GAP
```

## Current Behavior (Evidence)

### Frontend Pages (exist ✅)
1. **Cart page**: `src/app/(storefront)/cart/page.tsx`
   - Status: ✅ Working (PROD: cart=200)
   - Features: Add to cart, quantity controls, checkout button
   - Calls: `/api/cart` (backend Laravel API)

2. **Checkout page**: `src/app/(storefront)/checkout/page.tsx`
   - Status: ✅ Working (PROD: checkout=200)
   - Features: Checkout form, shipping/payment selection
   - Hook: `useCheckout` (src/hooks/useCheckout.ts)
   - Calls: `checkoutApi.processValidatedCheckout()`

3. **Order detail pages**: `src/app/(storefront)/order/[id]/page.tsx`, `src/app/orders/[id]/page.tsx`
   - Status: ✅ Exist (individual order view)
   - Features: View order details, tracking

4. **Orders list page**: `/orders` (MISSING ❌)
   - Status: ❌ **404 on PROD** (directory exists but no page.tsx)
   - Directory: `src/app/(storefront)/orders/` has only `/receipt` subdirectory
   - Gap: **NO page.tsx to list user's orders**

### Backend Routes (exist ✅)

From `backend/routes/api.php`:

**Order Routes** (lines 83-87, 105-107):
```php
// Authenticated routes
Route::post('orders', [OrderController::class, 'store'])  // Create order
Route::get('orders', [OrderController::class, 'index'])   // List orders
Route::get('orders/{order}', [OrderController::class, 'show'])  // Show order
Route::post('orders/checkout', [OrderController::class, 'checkout'])  // Checkout
```

**Cart Routes** (lines 112-117):
```php
Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
    Route::get('items', [CartController::class, 'index']);      // List cart items
    Route::post('items', [CartController::class, 'store']);     // Add to cart
    Route::patch('items/{cartItem}', [CartController::class, 'update']);  // Update qty
    Route::delete('items/{cartItem}', [CartController::class, 'destroy']); // Remove item
});
```

**Controllers**:
- `app/Http/Controllers/Api/V1/OrderController.php` ✅ (handles order CRUD)
- `app/Http/Controllers/Api/CartController.php` ✅ (handles cart operations)

**Models**:
- `app/Models/Order.php` ✅
- `app/Models/OrderItem.php` ✅

**Migrations** (verified):
- `2025_08_24_191037_create_orders_table.php` ✅
- `2025_08_24_191114_create_order_items_table.php` ✅
- `2025_08_25_160748_create_cart_items_table.php` ✅

### Frontend → Backend Integration (from Pass 7)

**Pass 7 evidence** (`docs/FEATURES/FRONTEND-CHECKOUT-AUDIT.md`):
- ✅ Frontend cart checkout wired to backend `POST /api/v1/orders`
- ✅ Cart page uses `apiClient.createOrder()` (calls Laravel API)
- ✅ E2E tests verify cart → order creation flow
- ✅ PR #1797 merged (2025-12-20)

**Current flow** (VERIFIED working):
```
Cart page → Checkout button → POST /api/v1/orders (backend) → Order created in DB
```

## Gaps (First Failing Point)

### Gap 1: `/orders` list page returns 404 (PRIMARY)
- **PROD**: `curl https://dixis.gr/orders` → 404
- **Cause**: No `page.tsx` in `src/app/(storefront)/orders/`
- **Impact**: User cannot view list of their orders after checkout
- **Expected**: `/orders` should list user's orders (like `/my/orders` for authenticated users)

### Gap 2 (secondary): Redirect after order creation unclear
- After `POST /api/v1/orders` succeeds, where does user land?
- From Pass 7: "redirect to /order/[id]" (individual order view)
- But no clear path to see ALL orders

### What WORKS ✅ (do not fix)
1. ✅ Cart functionality (add/update/remove items)
2. ✅ Checkout flow (frontend + backend integrated)
3. ✅ Order creation API (`POST /api/v1/orders`)
4. ✅ Backend `GET /api/v1/orders` endpoint (list user's orders)
5. ✅ Individual order view (`/order/[id]`)
6. ✅ E2E tests for cart → order creation

## Minimal Deliverable for This Pass (ONE)

**Option A (SELECTED)**: Create `/orders` list page

**Why**:
- Smallest missing piece for complete MVP flow
- Backend endpoint already exists (`GET /api/v1/orders`)
- Completes the user journey: Cart → Checkout → Order created → View all orders

**Implementation**:
1. Create `src/app/(storefront)/orders/page.tsx`
2. Fetch user's orders from `GET /api/v1/orders` (backend)
3. Display orders table/list with:
   - Order ID, date, status, total
   - Link to `/order/[id]` for details
4. AuthGuard (require authenticated user)
5. Empty state if no orders

**Files changed** (estimated):
- `src/app/(storefront)/orders/page.tsx` (NEW, ~150 lines)
- Optional: Update navigation to include "My Orders" link

**Excluded** (defer to next passes):
- Order filtering/search
- Pagination (if needed)
- Order confirmation emails
- Producer order views

## Definition of Done (for This Pass)

### Acceptance Criteria
1. ✅ `/orders` page exists and returns 200 (not 404)
2. ✅ Authenticated user can view list of their orders
3. ✅ Page displays: order ID, date, status, total amount
4. ✅ Each order links to `/order/[id]` for details
5. ✅ Empty state shown if user has no orders
6. ✅ AuthGuard enforced (unauthenticated → redirect to login)

### Proof Commands (dev)
```bash
# 1. Start dev servers
cd backend && php artisan serve --port=8001 &
cd frontend && npm run dev &

# 2. Create test order via API
curl -X POST http://localhost:8001/api/v1/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":2}],"shipping_method":"standard","currency":"EUR"}'

# 3. Visit orders page
curl -sS -o /dev/null -w "orders=%{http_code}\n" http://localhost:3001/orders

# Expected: orders=200 (or 307 redirect to login if not authenticated)
```

### Proof Commands (PROD after merge)
```bash
curl -sS -o /dev/null -w "orders=%{http_code}\n" https://dixis.gr/orders
# Expected: 200 (authenticated) or 307 (redirect to login)
```

### Test Coverage
- **E2E test** (optional, minimal): User creates order → navigates to /orders → sees order in list
- **Backend tests**: Already exist (Pass 6: 54 tests PASS)

## Next Passes (Only List 2)

### Pass 11: Order confirmation email (log-only in dev)
- Send email after order creation
- Log-only in dev (no SMTP in MVP)
- Uses Laravel Mail facade
- DoD: Email logged after `POST /api/v1/orders` succeeds

### Pass 12: Producer order view (orders containing own products)
- Producer can view orders containing their products
- Backend route: `GET /api/v1/producer/orders` (already exists!)
- Frontend page: `/producer/orders` (already exists!)
- DoD: Producer sees only orders with their products

## Architecture Notes

### Data Flow (Complete MVP)
```
1. Cart: Add products → localStorage + /api/cart (backend)
2. Checkout: Submit form → POST /api/v1/orders (backend)
3. Order Created: DB insert (orders + order_items tables)
4. Redirect: → /order/{id} (individual order view)
5. View All Orders: → /orders (LIST PAGE - this pass)
```

### Backend Endpoints Used
- `POST /api/v1/orders` - Create order (Pass 7: WORKING ✅)
- `GET /api/v1/orders` - List user's orders (EXISTS, NOT WIRED ✅)
- `GET /api/v1/orders/{id}` - Show order details (Pass 7: WORKING ✅)

### Frontend Pages After This Pass
- `/cart` - Cart items (WORKING ✅)
- `/checkout` - Checkout form (WORKING ✅)
- `/order/{id}` - Order details (WORKING ✅)
- `/orders` - Orders list (THIS PASS 🎯)

## Referenced Files

### Backend (all VERIFIED existing)
- `backend/routes/api.php:83-87` (order routes)
- `backend/app/Http/Controllers/Api/V1/OrderController.php` (order CRUD)
- `backend/app/Models/Order.php` (Order model)
- `backend/app/Models/OrderItem.php` (OrderItem model)
- `backend/database/migrations/2025_08_24_191037_create_orders_table.php`

### Frontend (existing)
- `src/app/(storefront)/cart/page.tsx` (cart page)
- `src/app/(storefront)/checkout/page.tsx` (checkout page)
- `src/app/(storefront)/order/[id]/page.tsx` (order detail page)
- `src/hooks/useCheckout.ts` (checkout logic)

### Frontend (NEW in this pass)
- `src/app/(storefront)/orders/page.tsx` (NEW - orders list page 🎯)

## Conclusion

**PRIMARY GAP**: `/orders` page returns 404 on PROD

**ROOT CAUSE**: No `page.tsx` in `src/app/(storefront)/orders/` directory

**MINIMAL FIX**: Create orders list page that calls existing `GET /api/v1/orders` backend endpoint

**IMPACT**: Completes MVP user journey (cart → checkout → order created → view all orders)

**NO BACKEND CHANGES REQUIRED** - Backend endpoint already exists and works.

---

**READY TO EXECUTE** - Option A (Create /orders list page)
