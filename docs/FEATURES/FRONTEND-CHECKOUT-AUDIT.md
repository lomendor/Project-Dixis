# Frontend Checkout Wiring — Audit (Pass 7)

## Objective
Verify if frontend cart/checkout is wired to backend Laravel API (`POST /api/v1/orders`).

## Audit Findings

### What EXISTS ✅

**1. Backend Orders API** (verified in Pass 6)
- **Endpoint**: `POST /api/v1/orders`
- **Controller**: `backend/app/Http/Controllers/Api/V1/OrderController.php:73-150`
- **Features**:
  - ✅ Authorization enforcement (OrderPolicy)
  - ✅ DB transaction for atomicity
  - ✅ Stock validation with race condition prevention (lockForUpdate)
  - ✅ Multi-producer support (producer_id in order_items)
  - ✅ Stock decrement + low stock alerts
- **Tests**: 54 PASS (517 assertions)

**2. Frontend Cart Page**
- **File**: `frontend/src/app/(storefront)/cart/page.tsx`
- **Features**:
  - ✅ Cart display with quantity controls
  - ✅ Checkout button (line 104: `onClick={handleCheckout}`)
  - ✅ Loading state during checkout
  - ✅ Toast notifications for errors

**3. Frontend Order Intent API**
- **File**: `frontend/src/app/api/order-intents/route.ts`
- **Purpose**: Creates draft Order in **frontend Neon DB** (Prisma)
- **Status**: Working but NOT integrated with backend

**4. Frontend Checkout API**
- **File**: `frontend/src/app/api/checkout/route.ts`
- **Purpose**: Creates Order in **frontend Neon DB** (Prisma)
- **Status**: Working but NOT integrated with backend

### What's MISSING ❌

**CRITICAL GAP: Frontend NOT calling backend Orders API**

1. **Cart checkout flow** (cart/page.tsx:31-35):
   ```typescript
   const res = await fetch('/api/order-intents', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ items: cartItems })
   })
   ```
   - ❌ Calls `/api/order-intents` (frontend Prisma DB)
   - ❌ Should call backend `POST /api/v1/orders`

2. **No backend API integration**:
   - Grep result: NO files call `POST /api/v1/orders`
   - Frontend uses separate Neon DB (Prisma schema)
   - Backend Laravel DB (PostgreSQL) not used for orders from frontend

3. **No E2E test for cart → order creation**:
   - No test verifying complete checkout flow
   - No test proving backend Orders API is called from frontend

### Architecture Gap

**Current Flow** (BROKEN):
```
Frontend Cart → POST /api/order-intents → Frontend Neon DB (Prisma)
                ↓
Frontend Checkout → POST /api/checkout → Frontend Neon DB (Prisma)
```

**Expected Flow** (CORRECT):
```
Frontend Cart → POST /api/v1/orders → Backend Laravel API → Laravel DB (PostgreSQL)
                ↓                        ↓
          Order Created              Stock Validated
                ↓                        ↓
          Redirect to              OrderItems Created
          Success Page              (with producer_id)
```

## Required Changes

### 1. Wire Cart Checkout to Backend API
**File**: `frontend/src/app/(storefront)/cart/page.tsx`

**Change** (lines 23-48):
```typescript
const handleCheckout = async () => {
  setLoading(true)
  try {
    // Map cart items to backend API format
    const items = list.map(item => ({
      product_id: item.id,
      quantity: item.qty
    }))

    // Call backend Laravel API
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if using Sanctum
      },
      body: JSON.stringify({
        items,
        shipping_method: 'standard',
        currency: 'EUR'
      })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to create order')
    }

    const data = await res.json()

    // Clear cart and redirect to success
    clear()
    router.push(`/order/${data.data.id}`)
  } catch (error) {
    console.error('Checkout error:', error)
    showError('Σφάλμα κατά τη δημιουργία παραγγελίας. Παρακαλώ δοκιμάστε ξανά.')
    setLoading(false)
  }
}
```

### 2. Add E2E Test
**File**: `frontend/tests/e2e/checkout.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Cart → Order Creation', () => {
  test('customer can create order from cart', async ({ page }) => {
    // Login as consumer
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'consumer@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Add product to cart
    await page.goto('/products')
    await page.click('[data-testid="add-to-cart-btn"]').first()

    // Go to cart
    await page.goto('/cart')
    await expect(page.getByTestId('product-card')).toBeVisible()

    // Checkout
    await page.click('[data-testid="go-checkout"]')

    // Verify order created (should redirect to order page)
    await expect(page).toHaveURL(/\/order\/[a-z0-9-]+/)
    await expect(page.getByText(/παραγγελία/i)).toBeVisible()
  })
})
```

## Definition of Done
- [x] Frontend checkout flow audited
- [x] Gap documented (frontend NOT calling backend API)
- [ ] Cart page wired to `POST /api/v1/orders`
- [ ] E2E test proves cart → order creation works
- [ ] STATE/NEXT updated
- [ ] PR created with auto-merge

## Conclusion
**GAP FOUND** ❌

Frontend checkout is using separate Prisma DB instead of backend Laravel API. Backend Orders API exists and is production-ready (54 tests PASS), but frontend is not calling it.

**Action Required**: Wire frontend cart checkout to backend `POST /api/v1/orders`.

## Referenced Files
- Backend API: `backend/app/Http/Controllers/Api/V1/OrderController.php:73-150`
- Frontend Cart: `frontend/src/app/(storefront)/cart/page.tsx:23-48`
- Frontend Order Intents: `frontend/src/app/api/order-intents/route.ts`
- Frontend Checkout: `frontend/src/app/api/checkout/route.ts`
