# Ownership & Flows (MVP)

**Last Updated:** 2025-12-18  
**Status:** Documented (Implementation verified in codebase)

## Roles

- **Visitor** (not logged in)
- **Customer** (logged in, role='consumer')
- **Producer** (logged in, role='producer', has Producer profile)
- **Admin** (logged in, role='admin')

## Entities & Ownership

### Producer
- **Owned by:** Producer user (1:1 relationship via `user_id`)
- **Producer can:** View/edit own profile, manage own products
- **Admin can:** View/edit/approve/reject any producer

**Schema Evidence:**
- `backend/app/Models/Producer.php` (line 78): `hasMany(Product::class)`
- `backend/app/Policies/ProducerPolicy.php`

### Product
- **Must belong to:** Exactly one Producer (`producer_id` NOT NULL)
- **Producer can:** Create/edit/activate/deactivate **own products only**
- **Admin can:** Create/edit/disable **any product**

**Schema Evidence:**
- `backend/app/Models/Product.php` (line 28): `producer_id` in fillable
- `backend/app/Models/Product.php` (line 65): `belongsTo(Producer::class)`
- `backend/app/Policies/ProductPolicy.php` (line 48): `$product->producer_id === $user->producer->id`

**Authorization Check:**
```php
// backend/app/Policies/ProductPolicy.php:48
return $user->producer && $product->producer_id === $user->producer->id;
```

### Order
- **Customer** places order (guest checkout planned but not implemented)
- **Producer** sees orders containing **their products** (scoped by `order_items.producer_id`)
- **Admin** sees **all orders**

**Schema Evidence:**
- `backend/app/Models/OrderItem.php` (line 15): `producer_id` in fillable
- `backend/app/Models/OrderItem.php` (line 49): `belongsTo(Producer::class)`
- `backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php` (line 49): Scopes by `producer_id`

## Public Storefront

### Product List (`/products`)
- Lists only **active products** (`is_active=true`)
- Shows producer name for each product
- **Source of truth:** Backend public API (`/api/v1/public/products`)
- **Implementation:** `frontend/src/app/(storefront)/products/page.tsx` (line 18): `fetch()` with `cache: 'no-store'`

### Product Detail (`/products/[id]`)
- Shows product details + producer name
- **Source of truth:** Backend public API
- **Implementation:** `frontend/src/app/(storefront)/products/[id]/page.tsx`: Uses API fetch (Prisma removed in PR #1736)

## Dashboards

### Producer Dashboard (`/my/products`)
- **Access:** Producer role only (enforced by `AuthGuard`)
- **Scope:** Shows **only products** where `product.producer_id = current_producer.id`
- **Backend:** `/api/me/products` (line 34): `producerId: producer.id`

**Authorization Evidence:**
```typescript
// frontend/src/app/my/products/page.tsx:37
<AuthGuard requireAuth={true} requireRole="producer">
```

### Admin Dashboard (`/admin/products`)
- **Access:** Admin role only
- **Scope:** Shows **all products** (no producer filtering)
- **Backend:** `/api/admin/products`

**Evidence:**
- `frontend/src/app/admin/products/page.tsx` (line 382): Shows `producer.name` column

## Security Requirements

### Server-Side Authorization (Backend)
- ✅ Every `my/*` endpoint **must scope by authenticated producer_id**
- ✅ Backend **never trusts client** for ownership checks
- ✅ Policies enforce ownership at model level

**Implementation Evidence:**
```php
// backend/app/Http/Controllers/Api/ProducerController.php:31
if ($product->producer_id !== $user->producer->id) {
    return response()->json(['error' => 'Unauthorized'], 403);
}
```

### Frontend Guards
- ✅ `AuthGuard` component enforces role-based access
- ✅ Routes like `/my/products`, `/producer/*` require producer role
- ✅ Admin routes require admin role

## Data Flow Summary

```
┌─────────────┐
│   Visitor   │ → View /products (public API)
└─────────────┘

┌─────────────┐
│  Customer   │ → Place orders, view /my/orders
└─────────────┘

┌─────────────┐
│  Producer   │ → Manage /my/products (scoped to own)
│             │ → View /producer/orders (orders with own products)
└─────────────┘

┌─────────────┐
│    Admin    │ → Manage /admin/products (all)
│             │ → Approve/reject producers
│             │ → View all orders
└─────────────┘
```

## Gaps & TODOs

### Known Issues
- ⚠️ Guest checkout not implemented (`user_id` nullable in orders table but flow incomplete)
- ⚠️ Some admin endpoints may lack full authorization checks
- ⚠️ Product creation from admin panel may not auto-set producer_id correctly

### Next Actions
See `docs/OPS/NEXT-3-PASSES.md` for execution plan.

## Related Files

### Backend
- `backend/app/Models/Product.php` - Product model with producer relationship
- `backend/app/Models/Producer.php` - Producer model
- `backend/app/Policies/ProductPolicy.php` - Authorization rules
- `backend/app/Http/Controllers/Api/ProducerController.php` - Producer API
- `backend/database/migrations/2025_08_26_154228_add_producer_id_to_order_items.php`

### Frontend
- `frontend/src/app/my/products/page.tsx` - Producer product list
- `frontend/src/app/admin/products/page.tsx` - Admin product management
- `frontend/src/components/AuthGuard.tsx` - Role enforcement
- `frontend/src/app/(storefront)/products/page.tsx` - Public product list
