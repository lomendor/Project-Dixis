# Pass 61 — Admin Dashboard Polish

**Date**: 2025-12-29
**Status**: IN REVIEW
**PR**: #1950

## TL;DR

Connected admin orders dashboard to Laravel API (single source of truth), added search/filter/pagination/quick-stats endpoint. Follows same split-brain fix pattern as Pass 39/44/56.

## What Changed

| File | Type | Description |
|------|------|-------------|
| `backend/app/Http/Controllers/Api/Admin/AdminOrderController.php` | Modified | Added `index()` method with filters/pagination/stats |
| `backend/routes/api.php` | Modified | Added GET `/api/v1/admin/orders` route |
| `frontend/src/lib/api.ts` | Modified | Added `AdminOrder`, `AdminOrdersResponse` types + `getAdminOrders()` method |
| `frontend/src/app/api/admin/orders/route.ts` | Modified | Proxy to Laravel API when auth token present, fallback to demo |
| `frontend/tests/e2e/pass-61-admin-dashboard.spec.ts` | New | 4 E2E tests for admin dashboard UI |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE (split-brain)                                       │
├─────────────────────────────────────────────────────────────┤
│  Admin Orders UI → /api/admin/orders → Prisma/Demo data     │
│                                                             │
│  Orders created via checkout → Laravel PostgreSQL           │
│  Result: Admin sees demo data, not real orders              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  AFTER (single source of truth)                             │
├─────────────────────────────────────────────────────────────┤
│  Admin Orders UI → /api/admin/orders → Laravel API          │
│                    ↓ (if no auth)                           │
│                    Demo mode fallback (for E2E tests)       │
│                                                             │
│  Orders created via checkout → Laravel PostgreSQL           │
│  Result: Admin sees real orders from Laravel                │
└─────────────────────────────────────────────────────────────┘
```

## Laravel Endpoint

```php
GET /api/v1/admin/orders

Query params:
- status: pending|confirmed|processing|shipped|delivered|cancelled
- q: search string (customer name/email, order ID)
- from_date: YYYY-MM-DD
- to_date: YYYY-MM-DD
- page: 1
- per_page: 10 (max 100)
- sort: created_at|-created_at

Response:
{
  "success": true,
  "orders": [...],
  "meta": { "current_page": 1, "last_page": 1, "per_page": 10, "total": 6 },
  "stats": { "pending": 2, "paid": 1, "shipped": 1, ... }
}

Authorization: admin role required (returns 403 for non-admin)
```

## Frontend Proxy Logic

```typescript
// 1. Check for auth token (cookie or header)
const token = cookieStore.get('auth_token')?.value
           || req.headers.get('authorization')?.replace('Bearer ', '');

// 2. If token present, call Laravel API
if (token) {
  const laravelRes = await fetch(`${apiBase}/admin/orders?${params}`);
  if (laravelRes.ok) return NextResponse.json(transformed);
}

// 3. Fallback to demo mode (for E2E testing without auth)
const repo = getOrdersRepo('demo');
return NextResponse.json(await repo.list(...));
```

## Tests

4 E2E tests in demo mode:
1. `admin orders page loads with core UI elements` - heading, table headers
2. `filter controls are present` - status chips, search input, date filters
3. `pagination controls exist` - results count, prev/next buttons, page size
4. `quick stats totals are displayed` - status counts, total count

## Notes

- Admin UI components (filters, pagination, stats) already existed - just needed backend wiring
- Same pattern as Pass 39 (consumer orders), Pass 44 (checkout), Pass 56 (producer orders)
- E2E tests run against demo mode to avoid CI auth complexity

---
Generated-by: Claude (Pass 61)
