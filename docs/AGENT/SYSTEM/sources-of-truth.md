# Sources of Truth - Dixis Architecture

> **Pass 44: Architecture Reconciliation** - Established December 2025

## Overview

This document defines the authoritative data sources for the Dixis platform.
Violating these rules causes **split-brain bugs** where data exists in one
system but not another.

## The Rule

| Domain | Source of Truth | API Endpoint | Database |
|--------|-----------------|--------------|----------|
| **Orders** | Laravel API | `POST /api/v1/public/orders` | Laravel PostgreSQL |
| **Order Items** | Laravel API | (nested in order) | Laravel PostgreSQL |
| **Products** | Laravel API | `GET /api/v1/public/products` | Laravel PostgreSQL |
| **Producers** | Laravel API | `GET /api/v1/public/producers` | Laravel PostgreSQL |
| **Users/Auth** | Laravel API | `POST /api/v1/auth/*` | Laravel PostgreSQL |

## Order Creation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CHECKOUT FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   CheckoutClient.tsx                                                │
│         │                                                           │
│         ▼                                                           │
│   apiClient.createOrder()                                           │
│         │                                                           │
│         ▼                                                           │
│   POST /api/v1/public/orders  ◄──── Laravel OrderController         │
│         │                                                           │
│         ▼                                                           │
│   Laravel PostgreSQL                                                │
│         │                                                           │
│         ▼                                                           │
│   Order response (with shipping_address, shipping_method_label)     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Deprecated Endpoints

| Endpoint | Status | Replacement |
|----------|--------|-------------|
| `POST /api/checkout` | **410 Gone** | `apiClient.createOrder()` → Laravel API |
| Prisma order creation | **Disabled** | Laravel OrderController |

## Why This Matters

### The Split-Brain Problem (Pre-Pass 44)

Before Pass 44, checkout worked like this:

```
CheckoutClient.tsx → /api/checkout → Prisma/Neon DB
Orders UI → Laravel API → Laravel PostgreSQL
```

This caused:
- Orders created in checkout didn't appear in Orders UI
- Shipping address saved in Prisma, but Orders UI read from Laravel (null)
- Inconsistent data between two databases with no sync

### The Solution (Pass 44)

Single source of truth:

```
CheckoutClient.tsx → apiClient.createOrder() → Laravel API → Laravel PostgreSQL
Orders UI → Laravel API → Laravel PostgreSQL (same data!)
```

## Implementation Details

### Frontend (CheckoutClient.tsx)

```typescript
// Pass 44: Use Laravel API directly
const order = await apiClient.createOrder({
  items: items.map(i => ({ product_id: i.id, quantity: i.qty })),
  currency: 'EUR',
  shipping_method: shippingMethod,
  shipping_address: {
    name,
    phone,
    line1,
    city,
    postal_code: postal,
    country: 'GR',
  },
  payment_method: 'COD',
});
```

### Backend (OrderController.php)

```php
$order = Order::create([
    'user_id' => $userId,
    'status' => 'pending',
    'payment_status' => 'pending',
    'payment_method' => $validated['payment_method'] ?? 'COD',
    'shipping_method' => $validated['shipping_method'],
    'shipping_address' => $validated['shipping_address'] ?? null,
    // ... other fields
]);
```

### API Response (OrderResource.php)

```php
return [
    'id' => $this->id,
    'shipping_method' => $this->shipping_method,
    'shipping_method_label' => $shippingMethodLabels[$shippingMethodCode],
    'shipping_address' => $this->shipping_address, // JSON object
    'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
    // ... other fields
];
```

## Verification

Run the Pass 44 E2E tests:

```bash
cd frontend
npx playwright test pass-44-architecture-reconciliation.spec.ts
```

Tests verify:
1. Legacy `/api/checkout` returns 410 Gone
2. Laravel API accepts `shipping_address`
3. Orders created via API appear in list with correct data
4. Shipping method labels are in Greek
5. Order items include producer info

## Related Documents

- `docs/PRODUCT/contracts/order-public-v1.md` - API contract
- `docs/OPS/STATE.md` - Operational state log
- `frontend/tests/e2e/pass-44-architecture-reconciliation.spec.ts` - E2E tests
- `frontend/tests/e2e/orders-data-completeness.spec.ts` - Pass 41/43 tests

## History

| Pass | Date | Change |
|------|------|--------|
| 44 | 2025-12-27 | Architecture Reconciliation - single source of truth |
| 43 | 2025-12-27 | Added shipping_method_label, shipping_address, producer info |
| 41 | 2025-12-26 | Fixed OrderResource missing fields |
| 40 | 2025-12-26 | Orders list reads from Laravel API |
