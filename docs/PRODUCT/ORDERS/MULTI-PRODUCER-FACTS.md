# Multi-Producer Cart: Current State

**Pass**: SHIP-MULTI-DISCOVERY-01
**Date**: 2026-01-24
**Status**: Audit Complete

---

## TL;DR

**Schema allows multi-producer. Application blocks it.**

The database schema fully supports orders with items from multiple producers. However, both the client (cart.ts) and server (OrderController.php) explicitly block this behavior as an MVP constraint.

---

## What's Allowed Today

| Scenario | Allowed? | Evidence |
|----------|----------|----------|
| Cart with 1 producer | ✅ Yes | Normal flow |
| Cart with 2+ producers | ❌ No | Returns `conflict` status |
| Order with 2+ producers | ❌ No | 422 `MULTI_PRODUCER_CART_NOT_ALLOWED` |

---

## What Breaks with 2 Producers

### Client Block (cart.ts:46-56)

When user adds product from Producer B while cart has Producer A items:

```typescript
if (existing.producerId !== p.producerId) {
  return {
    status: 'conflict',
    currentProducerId: existing.producerId,
    newProducerId: p.producerId,
  }
}
```

**User Experience**: Modal prompts user to replace cart or cancel.

### Server Block (OrderController.php:131-144)

Defense-in-depth validation if client guard bypassed:

```php
// Pass 57: Server-side guard - one producer per order (MVP)
if ($producerIds->count() > 1) {
    abort(422, json_encode([
        'error' => 'MULTI_PRODUCER_CART_NOT_ALLOWED',
        'message' => 'Το καλάθι περιέχει προϊόντα από διαφορετικούς παραγωγούς...',
    ]));
}
```

---

## Database Schema Analysis

### Orders Table

```sql
orders (
  id, user_id, status, total, shipping_cost, ...
  -- NO producer_id on Order
)
```

### Order Items Table

```sql
order_items (
  id, order_id, product_id, producer_id, ...
  -- producer_id per item (allows multi-producer)
)
```

**Finding**: Schema is producer-agnostic at order level. Each item tracks its producer. No foreign key constraint prevents multi-producer orders.

---

## Infrastructure Ready for Multi-Producer

| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Ready | No changes needed |
| OrderItem model | ✅ Ready | Has `producer_id` |
| Order model | ✅ Ready | No producer constraint |
| Migrations | ✅ Ready | No changes needed |
| Cart state (Zustand) | 🔄 Minor change | Remove conflict check |
| Server validation | 🔄 Minor change | Remove Pass 57 block |

---

## Why It's Blocked (MVP Rationale)

Per Pass 57 comments:

1. **Simplified shipping**: One producer = one pickup/delivery location
2. **Easier order fulfillment**: Producer sees only their items
3. **Simpler notifications**: One producer per order email
4. **MVP scope**: Complexity deferred to post-launch

---

## To Enable Multi-Producer

### Minimal Changes Required

1. **Frontend** (`cart.ts`): Remove/modify lines 46-56 (conflict detection)
2. **Backend** (`OrderController.php`): Remove/modify lines 131-144 (server guard)
3. **Shipping**: Need per-producer shipping calculation
4. **Notifications**: Split emails by producer
5. **Producer Dashboard**: Filter items by producer_id

### Estimated Scope

| Task | Effort |
|------|--------|
| Remove client block | ~10 LOC |
| Remove server block | ~10 LOC |
| Per-producer shipping | Medium (new logic) |
| Split notifications | Medium |
| Dashboard filtering | Small (already filters by producer_id) |

---

## Key Files

| File | Role |
|------|------|
| `frontend/src/lib/cart.ts:46-56` | Client-side producer conflict detection |
| `backend/app/Http/Controllers/Api/V1/OrderController.php:131-144` | Server-side multi-producer guard |
| `backend/app/Models/OrderItem.php` | Has `producer_id` field |
| `backend/database/migrations/*_create_order_items_table.php` | Schema definition |

---

_SHIP-MULTI-DISCOVERY-01 | 2026-01-24_
