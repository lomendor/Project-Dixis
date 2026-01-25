# Summary: Pass-ORDERS-500-HYDRATION-01

**Date**: 2026-01-25
**Status**: COMPLETE
**PR**: #2482

---

## TL;DR

Fixed 500 error on `/api/v1/public/orders` by correcting the path in `vps-migrate.yml` and running pending database migrations on production.

---

## Problem

`GET https://dixis.gr/api/v1/public/orders` returned HTTP 500 with an HTML error page. This caused:
- React hydration errors (#418) on frontend
- Potential auth redirect loops when orders page tried to fetch data

---

## Root Cause

The `vps-migrate.yml` GitHub workflow used the wrong backend path:
- **Wrong**: `/var/www/dixis/backend`
- **Correct**: `/var/www/dixis/current/backend`

This mismatch meant that migrations from the multi-producer checkout feature (PRs #2456, #2476, #2477) were never applied to production, even though the code was deployed.

**Missing schema elements**:
- `order_shipping_lines` table (for per-producer shipping)
- `checkout_sessions` table (for multi-producer parent entity)
- `orders.checkout_session_id` column (FK to checkout session)
- `orders.is_child_order` column (child order flag)

When `OrderController@index` tried to eager-load the `shippingLines` relation or `OrderResource` tried to access `checkout_session_id`, the database threw an error because those tables/columns didn't exist.

---

## Solution

1. **PR #2482**: Changed path in `vps-migrate.yml` (2 occurrences)
2. **Ran vps-migrate workflow**: Applied 3 pending migrations to production

---

## Evidence

| Metric | Before | After |
|--------|--------|-------|
| Pending migrations | 3 | 0 |
| `GET /api/v1/public/orders` | HTTP 500 | HTTP 200 |
| Response type | HTML error | JSON |

**Migration batch**: All 3 migrations ran as batch 7 in ~315ms total.

---

## Prevention

The path mismatch existed because:
1. `deploy-backend.yml` uses `/var/www/dixis/current/backend` (correct)
2. `vps-migrate.yml` was created separately and used old path

Going forward, any new VPS workflows should reference the canonical path from `deploy-backend.yml`.

---

_Pass-ORDERS-500-HYDRATION-01 | 2026-01-25 | COMPLETE_
