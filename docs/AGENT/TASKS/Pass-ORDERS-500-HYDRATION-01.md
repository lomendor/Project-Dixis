# Tasks: Pass-ORDERS-500-HYDRATION-01

**Date**: 2026-01-25
**Status**: COMPLETE
**PR**: #2482

---

## Goal

Fix 500 error on `GET /api/v1/public/orders` endpoint caused by missing database migrations.

---

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Identify root cause of 500 error | DONE |
| 2 | Fix vps-migrate.yml path | DONE |
| 3 | Create PR #2482 | DONE |
| 4 | Merge PR | DONE |
| 5 | Run migrate:status (before) | DONE |
| 6 | Run migrate --force | DONE |
| 7 | Run migrate:status (after) | DONE |
| 8 | Verify endpoint returns 200 | DONE |
| 9 | Update STATE.md | DONE |
| 10 | Create pass documentation | DONE |

---

## Root Cause Analysis

**Symptom**: `GET https://dixis.gr/api/v1/public/orders` → 500 Internal Server Error (HTML)

**Investigation**:
1. Checked `OrderController@index` - eager loads `shippingLines` relation
2. Checked `OrderResource` - accesses `checkout_session_id`, `is_child_order`
3. Found 3 migrations from Jan 24-25 were PENDING on production
4. Found `vps-migrate.yml` uses wrong path: `/var/www/dixis/backend`
5. Actual backend path: `/var/www/dixis/current/backend`

**Root Cause**: Workflow path mismatch prevented migrations from running.

---

## Changes

### Modified Files

| File | Change |
|------|--------|
| `.github/workflows/vps-migrate.yml` | Fixed path: `/var/www/dixis/backend` → `/var/www/dixis/current/backend` |

---

## Evidence

### Before Migration
```
2026_01_24_130000_create_order_shipping_lines_table ................ Pending
2026_01_25_140000_create_checkout_sessions_table ................... Pending
2026_01_25_140001_add_checkout_session_id_to_orders_table .......... Pending
```

### Migration Output
```
2026_01_24_130000_create_order_shipping_lines_table .......... 207.46ms DONE
2026_01_25_140000_create_checkout_sessions_table .............. 56.85ms DONE
2026_01_25_140001_add_checkout_session_id_to_orders_table ..... 50.67ms DONE
```

### After Migration
```
2026_01_24_130000_create_order_shipping_lines_table ................ [7] Ran
2026_01_25_140000_create_checkout_sessions_table ................... [7] Ran
2026_01_25_140001_add_checkout_session_id_to_orders_table .......... [7] Ran
```

### Endpoint Verification
```
curl -i https://dixis.gr/api/v1/public/orders
HTTP/1.1 200 OK
Content-Type: application/json
{"data":[{"id":103,"order_number":"ORD-000103","checkout_session_id":null,...}],...}
```

---

_Pass-ORDERS-500-HYDRATION-01 | 2026-01-25_
