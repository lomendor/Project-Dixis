# Pass 62 — Orders/Checkout E2E Guardrail

**Date**: 2025-12-29
**Status**: IN REVIEW
**PR**: #TBD

## TL;DR

Added comprehensive E2E regression test to guard the consumer checkout journey from silently breaking. Tests verify: auth → cart → checkout → orders list → order details (with producer info).

## What Changed

| File | Type | Description |
|------|------|-------------|
| `frontend/tests/e2e/orders-checkout-regression.spec.ts` | New | 11 E2E tests covering full consumer orders journey |

## Test Coverage

```
Pass 62: Orders & Checkout Regression
├── 1. Consumer Authentication
│   └── ✅ consumer can access protected orders page
├── 2. Cart Functionality
│   └── ✅ cart persists items and shows correct total
├── 3. Checkout Flow
│   ├── ✅ checkout page loads without error
│   └── ✅ checkout redirects to products when cart is empty
├── 4. Orders List Page
│   ├── ✅ orders list shows at least one order after checkout
│   └── ✅ orders list handles empty state gracefully
├── 5. Order Details Page
│   ├── ✅ order details shows line items with product info
│   ├── ✅ order details shows status badge
│   ├── ✅ order details shows shipping method label
│   └── ✅ order details shows producer name per item
└── 6. API Integration Verification
    └── ✅ orders list calls Laravel API (not Prisma)
```

## Test Strategy

1. **Auth via storageState**: CI uses `ci-global-setup.ts` which sets mock auth tokens
2. **Route mocking**: API responses mocked for deterministic behavior
3. **Real UI verification**: Tests run against production UI to catch real breakage
4. **API contract check**: Verifies frontend calls Laravel `/api/v1/*` not Prisma `/internal/*`

## Mock Data

Tests use realistic Greek mock data:
- Products: Βιολογικές Ντομάτες, Φρέσκα Αυγά
- Producers: Αγρόκτημα Παππού, Πουλερικά Γιώργου
- Order with items, status, shipping method label, producer info

## Why This Matters

Previous passes (39, 44, 56, 61) fixed split-brain issues where frontend used Prisma while Laravel had the real data. This test ensures those fixes never regress by verifying:
1. Orders are fetched from Laravel API
2. Order details render with complete data (items, producers, shipping)
3. Status and shipping labels display in Greek

## Risks Mitigated

| Risk | Mitigation |
|------|------------|
| Checkout silently breaks | Test verifies checkout page loads |
| Orders list empty | Test mocks API and verifies order appears |
| Order details missing data | Test checks product names, producer info, status |
| Wrong API called | Test explicitly verifies Laravel API, not Prisma |

---
Generated-by: Claude (Pass 62)
