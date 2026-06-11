# 🚨 CHECKOUT SPLIT-BRAIN ARCHITECTURE PROBLEM

**Date**: 2025-12-24
**Status**: 🔴 CRITICAL - Duplicate checkout systems causing 500 errors and confusion
**Impact**: Months of work lost to duplicate implementations

---

## 📊 PROBLEM SUMMARY

**Project-Dixis has TWO checkout systems running in parallel:**

1. **Laravel API System** (`/api/v1/orders`) - NEW, correct architecture
2. **Legacy Next.js API** (`/api/checkout`) - OLD, should be removed

**Result**: Users can checkout from `/cart` (works ✅) but `/checkout` uses old system (broken ❌)

---

## 🔍 EVIDENCE: SYSTEM 1 - Laravel API (CORRECT)

### Frontend Files Using `/api/v1/orders` (2 files)

```bash
# Command: rg -n "api/v1/orders|/v1/orders" frontend/src
```

**Result:**
1. `frontend/src/app/(storefront)/cart/page.tsx:42`
2. `frontend/src/components/admin/shipments/ShipmentTracking.tsx:54`

### Flow: Cart Page → Laravel Backend

**File**: `frontend/src/app/(storefront)/cart/page.tsx`

```typescript
const handleCheckout = async () => {
  // Map cart items to backend API format
  const orderItems = list.map(item => ({
    product_id: parseInt(item.id.toString()),
    quantity: item.qty
  }))

  // ✅ CORRECT: Calls Laravel API
  const order = await apiClient.createOrder({
    items: orderItems,
    currency: 'EUR',
    shipping_method: 'HOME',
    notes: ''
  })

  clear()
  router.push(`/order/${order.id}`)
}
```

**API Client**: `frontend/src/lib/api.ts:465-475`

```typescript
async createOrder(data: {
  items: { product_id: number; quantity: number }[];
  currency: 'EUR' | 'USD';
  shipping_method: 'HOME' | 'PICKUP';
  notes?: string;
}): Promise<Order> {
  return this.request<Order>('orders', {  // → POST /api/v1/orders
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**Backend**: `backend/app/Http/Controllers/Api/V1/OrderController.php:73-154`

```php
public function store(StoreOrderRequest $request, InventoryService $inventoryService): OrderResource
{
    $this->authorize('create', Order::class);

    return DB::transaction(function () use ($request, $inventoryService) {
        $validated = $request->validated();
        $orderTotal = 0;
        $productData = [];

        // Validate products and check stock
        foreach ($validated['items'] as $itemData) {
            $product = Product::where('id', $itemData['product_id'])
                ->where('is_active', true)
                ->lockForUpdate() // Prevent race conditions
                ->first();

            // Stock validation, price calculation...
        }

        // Create order in PostgreSQL via Eloquent
        $order = Order::create([
            'user_id' => auth()->id() ?? $validated['user_id'] ?? null,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_method' => $validated['shipping_method'],
            'currency' => $validated['currency'],
            'subtotal' => $orderTotal,
            'total' => $orderTotal,
        ]);

        // Create order items...
        return new OrderResource($order);
    });
}
```

**Status**: ✅ This system works correctly with proper:
- Authentication via Laravel Sanctum
- Database transactions (PostgreSQL via Eloquent)
- Stock validation
- Atomic order creation

---

## 🔍 EVIDENCE: SYSTEM 2 - Legacy Next.js API (WRONG)

### Frontend Files Using `/api/checkout` (~16 files)

```bash
# Command: rg -n "(/api/checkout|app/api/checkout)" frontend/src
```

**Result:**
```
frontend/src/components/checkout/CheckoutClient.tsx:9
frontend/src/components/checkout/CheckoutClient.tsx:54
frontend/src/components/checkout/CheckoutClient.tsx:68
frontend/src/components/checkout/CheckoutClient.tsx:86
frontend/src/components/checkout/CheckoutClient.tsx:94
frontend/src/app/(storefront)/checkout/page.tsx:10
frontend/src/app/api/checkout/route.ts:3
frontend/src/app/api/checkout/route.ts:27
frontend/src/app/api/checkout/route.ts:49
frontend/src/app/api/checkout/address/route.ts:3
frontend/src/app/api/checkout/quote/route.ts:3
frontend/src/app/api/checkout/pay/route.ts:3
frontend/src/app/api/checkout/confirm/route.ts:3
```

### Flow: Checkout Page → sessionStorage (NO DATABASE!)

**File**: `frontend/src/components/checkout/CheckoutSummary.tsx:36-46`

```typescript
const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const payload = {
    customer: { name, email, phone, address, city, postcode, notes },
    items,
    totals: { items: total, shipping: 0, grand: total },
    ts: Date.now()
  };

  try {
    // ❌ WRONG: Just stores in sessionStorage, NO DATABASE!
    sessionStorage.setItem('dixis:last-order', JSON.stringify(payload));

    // Attempt to send email (doesn't block)
    try {
      fetch('/api/ops/email-order', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(payload)
      });
    } catch {}

    clearCart();
    window.location.href = '/checkout/confirmation';
  } catch (e) {
    setErr('Σφάλμα προσωρινής αποθήκευσης — δοκίμασε ξανά.');
  }
};
```

**Status**: ❌ This system is BROKEN:
- No database persistence (only sessionStorage)
- No authentication integration
- No stock validation
- Just sends email and hopes for the best
- User loses order if they close browser

---

## 🗺️ ARCHITECTURE MAP

### Current State (SPLIT-BRAIN)

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /cart page                    /checkout page              │
│  ✅ Uses Laravel API            ❌ Uses sessionStorage      │
│      │                              │                       │
│      │                              │                       │
│      ▼                              ▼                       │
│  apiClient.createOrder()    CheckoutSummary component      │
│      │                              │                       │
└──────┼──────────────────────────────┼───────────────────────┘
       │                              │
       │                              │
       ▼                              ▼
┌──────────────────┐         ┌───────────────────┐
│ Laravel Backend  │         │ sessionStorage    │
│ /api/v1/orders   │         │ (browser only)    │
│                  │         │                   │
│ ✅ PostgreSQL     │         │ ❌ No database     │
│ ✅ Transactions   │         │ ❌ Lost on close   │
│ ✅ Stock check    │         │ ❌ No validation   │
│ ✅ Auth via       │         │                   │
│    Sanctum       │         │                   │
└──────────────────┘         └───────────────────┘
```

### User Journey (BROKEN)

1. User adds items to cart (Zustand state) ✅
2. User goes to `/checkout` ❌
3. Fills form, clicks "Ολοκλήρωση παραγγελίας"
4. **CheckoutSummary stores in sessionStorage** (not database!) ❌
5. Email sent via `/api/ops/email-order` (fire-and-forget) ❌
6. Redirect to `/checkout/confirmation` ✅
7. **Order lost if user closes browser** ❌

### Alternative Journey (WORKS)

1. User adds items to cart (Zustand state) ✅
2. User stays on `/cart` ✅
3. Clicks "Προχώρα στο ταμείο"
4. **apiClient calls Laravel `/api/v1/orders`** ✅
5. **Order saved in PostgreSQL** ✅
6. Redirect to `/order/{id}` ✅
7. **Order persisted forever** ✅

---

## 🎯 ROOT CAUSE

**Two separate checkout implementations were created at different times:**

1. **Phase 1** (OLD): Next.js API routes with Prisma for quick prototyping
2. **Phase 2** (NEW): Laravel backend API with proper architecture

**Nobody removed the old system**, so:
- `/cart` was updated to use Laravel ✅
- `/checkout` still uses old sessionStorage system ❌

---

## 📋 CONSOLIDATION PLAN

### Goal: Single Checkout System (Laravel API)

### Step 1: Update CheckoutSummary to use Laravel API

**Current** (`CheckoutSummary.tsx`):
```typescript
sessionStorage.setItem('dixis:last-order', JSON.stringify(payload));
fetch('/api/ops/email-order', ...);  // Fire-and-forget
```

**Target**:
```typescript
const order = await apiClient.createOrder({
  items: cartItems.map(item => ({
    product_id: parseInt(item.id),
    quantity: item.qty
  })),
  currency: 'EUR',
  shipping_method: 'HOME',
  notes: payload.customer.notes
});

// Redirect to order confirmation
router.push(`/order/${order.id}`);
```

### Step 2: Remove Legacy API Routes

Delete these files:
- `frontend/src/app/api/checkout/route.ts`
- `frontend/src/app/api/checkout/address/route.ts`
- `frontend/src/app/api/checkout/quote/route.ts`
- `frontend/src/app/api/checkout/pay/route.ts`
- `frontend/src/app/api/checkout/confirm/route.ts`
- `frontend/src/app/api/ops/email-order/route.ts` (if not used elsewhere)

### Step 3: Update CheckoutClient.tsx

Replace all `/api/checkout/*` calls with `apiClient.*` calls to Laravel backend.

### Step 4: Add Customer Info to Laravel Order

Extend `OrderController` to accept optional customer shipping details:
```php
$order = Order::create([
    'user_id' => auth()->id() ?? null,
    'customer_name' => $validated['customer_name'] ?? null,
    'customer_email' => $validated['customer_email'] ?? null,
    'customer_phone' => $validated['customer_phone'] ?? null,
    'shipping_address' => $validated['shipping_address'] ?? null,
    'shipping_city' => $validated['shipping_city'] ?? null,
    'shipping_postcode' => $validated['shipping_postcode'] ?? null,
    // ... existing fields
]);
```

### Step 5: Update Database Schema

Add migration for customer/shipping fields if not already present:
```php
Schema::table('orders', function (Blueprint $table) {
    $table->string('customer_name')->nullable();
    $table->string('customer_email')->nullable();
    $table->string('customer_phone')->nullable();
    $table->text('shipping_address')->nullable();
    $table->string('shipping_city')->nullable();
    $table->string('shipping_postcode')->nullable();
});
```

---

## ✅ SUCCESS CRITERIA

After consolidation:
1. ✅ `/cart` checkout → Laravel API (already working)
2. ✅ `/checkout` form → Laravel API (needs fix)
3. ✅ No sessionStorage usage for orders
4. ✅ All orders in PostgreSQL database
5. ✅ All legacy `/api/checkout/*` routes deleted
6. ✅ Single source of truth for order creation

---

## 🚀 IMPLEMENTATION PRIORITY

### HIGH PRIORITY (Fix Now)
- Update `CheckoutSummary.tsx` to call Laravel API
- Test checkout flow end-to-end
- Remove legacy API routes

### MEDIUM PRIORITY (After Fix)
- Add customer/shipping fields to Laravel Order model
- Update database schema
- Add email notifications in Laravel (proper queue)

### LOW PRIORITY (Future)
- Payment integration (currently demo mode)
- Multi-step checkout wizard
- Order status tracking

---

## 📝 NOTES

- **PR #1873** already fixed auth issue in `OrderController` (uses `auth()->id()`)
- **Cart page works** because it was already updated to use Laravel API
- **Checkout page broken** because it still uses legacy sessionStorage system
- **Database transaction errors** were side effect of failed migrations, not architecture issue

---

**Generated**: 2025-12-24
**Author**: Claude Code (Architecture Audit)
**Context**: Response to user frustration about duplicate systems and months of lost work
