# Pass 58 — Producer Order Status Updates

## Goal
Allow producers to update order status from their orders page.
Status transitions: pending → processing → shipped → delivered.

## Scope
Included:
- Frontend status update buttons on /my/orders order cards
- Use existing backend PATCH /api/v1/producer/orders/{id}/status endpoint
- Optimistic UI updates
- E2E tests for status transitions

Excluded:
- No backend changes (endpoint already exists)
- No new database schema
- No admin status updates (different endpoint)

## DoD
- [x] Status buttons visible on order cards (only for valid transitions)
- [x] Clicking button calls existing API
- [x] UI updates after successful API call
- [x] Loading state while updating
- [x] Error handling with Greek message
- [x] E2E tests pass
- [x] CI green (E2E PostgreSQL passed; flaky PROD smoke non-blocking)
- [x] docs updated
