# Tasks: Pass-MP-ORDERS-SHIPPING-V1-01 (Schema)

**Date**: 2026-01-24
**Status**: COMPLETE
**PR**: Pending

---

## Goal

Phase 1 of MP-ORDERS-SHIPPING-V1: Create `order_shipping_lines` table for per-producer shipping breakdown.

---

## Tasks Completed

| Task | Status |
|------|--------|
| Create migration: `order_shipping_lines` table | ✅ |
| Add indexes (order_id, producer_id, created_at, composite) | ✅ |
| Add FK constraints with RESTRICT on delete | ✅ |
| Create `OrderShippingLine` model | ✅ |
| Add `shippingLines` relationship to Order model | ✅ |
| Create unit tests (4 tests) | ✅ |
| Run tests locally (all pass) | ✅ |
| Verify no regression in existing tests | ✅ |

---

## Schema Created

```sql
CREATE TABLE order_shipping_lines (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  producer_id BIGINT NOT NULL REFERENCES producers(id) ON DELETE RESTRICT,
  producer_name VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  shipping_method VARCHAR(50),
  free_shipping_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_osl_order_id ON order_shipping_lines(order_id);
CREATE INDEX idx_osl_producer_id ON order_shipping_lines(producer_id);
CREATE INDEX idx_osl_created_at ON order_shipping_lines(created_at);
CREATE INDEX idx_osl_order_producer ON order_shipping_lines(order_id, producer_id);
```

---

## Files Created/Modified

| File | Action |
|------|--------|
| `backend/database/migrations/2026_01_24_130000_create_order_shipping_lines_table.php` | Created |
| `backend/app/Models/OrderShippingLine.php` | Created |
| `backend/app/Models/Order.php` | Modified (added shippingLines relation) |
| `backend/tests/Unit/OrderShippingLineTest.php` | Created |

---

## Tests Added

| Test | Purpose |
|------|---------|
| `test_order_shipping_lines_table_exists` | Verify table exists after migration |
| `test_order_shipping_lines_has_required_columns` | Verify all columns present |
| `test_can_create_order_shipping_line` | Verify model CRUD works |
| `test_order_has_shipping_lines_relationship` | Verify Order->shippingLines relation |

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| FK on delete for orders | RESTRICT (preserve history) |
| FK on delete for producers | RESTRICT (preserve history) |
| Store producer_name | Yes (denormalized for history) |

---

_Pass-MP-ORDERS-SHIPPING-V1-01 | 2026-01-24_
