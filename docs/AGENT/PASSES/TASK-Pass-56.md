# Pass 56 — Producer Orders Split-Brain Fix

## Problem
Producer orders page `/my/orders` uses **Prisma** to read orders while checkout creates orders in **Laravel PostgreSQL**. This is the same split-brain issue fixed in Pass 39/44 for consumers.

Result: Producers see "Δεν υπάρχουν εγγραφές" (no records) even when they have orders.

## Goal
- Switch producer orders page from Prisma to Laravel API
- Use existing `GET /api/v1/producer/orders` endpoint (already implemented)
- Align status values with Laravel (pending/confirmed/processing/shipped/delivered)

## Scope
- **Included**:
  - Rewrite `/my/orders/page.tsx` as Client Component calling Laravel API
  - Use `apiClient.getProducerOrders()` (already exists in `frontend/src/lib/api.ts`)
  - Map Laravel statuses to Greek labels
  - Remove Prisma dependency for producer orders

- **Excluded**:
  - Order status updates by producers (already in ProducerOrderController)
  - CSV export (not in backend API yet - defer to future pass)
  - New backend endpoints (API already complete)

## DoD
- [ ] CI green (required checks)
- [ ] Producer orders page fetches from Laravel API
- [ ] Orders show correct data (product name, quantity, price, status)
- [ ] Status filter works with Laravel status values
- [ ] E2E: At least 2 tests (page loads, API called)
- [ ] STATE updated
- [ ] SUMMARY updated (≤2000 tokens)

## Technical Notes
- Backend already has: `GET /api/v1/producer/orders` with status filter
- API client already has: `apiClient.getProducerOrders(status)`
- Status values differ: Prisma (PENDING/ACCEPTED/REJECTED/FULFILLED) vs Laravel (pending/processing/shipped/delivered)
- Page must be Client Component ('use client') for auth token handling
