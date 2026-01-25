# Tasks: Pass-MP-ORDERS-SCHEMA-01

**Date**: 2026-01-25
**Status**: COMPLETE
**PR**: Pending

---

## Goal

Phase 1 of multi-producer order splitting: Create database schema and models for CheckoutSession parent-child architecture.

---

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Create `checkout_sessions` table migration | ✅ |
| 2 | Add `checkout_session_id` FK to orders | ✅ |
| 3 | Add `is_child_order` boolean to orders | ✅ |
| 4 | Create `CheckoutSession` model | ✅ |
| 5 | Add `checkoutSession()` relation to Order | ✅ |
| 6 | Write unit tests for schema | ✅ |
| 7 | Write unit tests for relationships | ✅ |
| 8 | Run migrations | ✅ |
| 9 | Verify all tests pass | ✅ |

---

## Schema Changes

### New Table: `checkout_sessions`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint nullable | FK to users |
| stripe_payment_intent_id | string nullable | Stripe PI ID |
| subtotal | decimal(10,2) | Sum of child order subtotals |
| shipping_total | decimal(10,2) | Sum of child order shipping |
| total | decimal(10,2) | Grand total |
| status | enum | pending, payment_processing, paid, failed, cancelled |
| currency | string(3) | EUR default |
| order_count | tinyint | Number of child orders |
| timestamps | | created_at, updated_at |

### Modified Table: `orders`

| Column | Type | Description |
|--------|------|-------------|
| checkout_session_id | bigint nullable | FK to checkout_sessions |
| is_child_order | boolean | true if part of multi-producer checkout |

---

## Test Results

```
✓ checkout sessions table exists
✓ checkout sessions has required columns
✓ orders table has checkout session columns
✓ can create checkout session
✓ checkout session belongs to user
✓ checkout session has many orders
✓ order belongs to checkout session
✓ is multi producer returns correct value
✓ mark as paid updates session and orders
✓ recalculate totals sums child orders
✓ standalone order has null checkout session

Tests: 11 passed (35 assertions)
Duration: 0.52s
```

---

## Files Changed

- `backend/database/migrations/2026_01_25_140000_create_checkout_sessions_table.php` (NEW)
- `backend/database/migrations/2026_01_25_140001_add_checkout_session_id_to_orders_table.php` (NEW)
- `backend/app/Models/CheckoutSession.php` (NEW)
- `backend/app/Models/Order.php` (MODIFIED: +relations, +fillable)
- `backend/tests/Unit/CheckoutSessionTest.php` (NEW)

---

_Pass-MP-ORDERS-SCHEMA-01 | 2026-01-25_
