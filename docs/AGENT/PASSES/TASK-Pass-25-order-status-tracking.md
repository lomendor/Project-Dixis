# Pass 25: Order Status Tracking (Admin + Consumer View)

**Date**: 2025-12-23
**Scope**: Admin can update order status, consumers see status + history/timeline
**Type**: Minimal viable slice with E2E proof

---

## Definition of Done (DoD)

### 1. Status Model ✅/❌
- [ ] Order model has `status` field (enum or string)
- [ ] Allowed states: `placed` (or `pending`), `confirmed`, `shipped`, `delivered`, `cancelled`
- [ ] Order model has `updated_at` timestamp (for status change tracking)
- [ ] Backwards compatible: existing orders default to initial state

### 2. Admin Status Update (Backend) ✅/❌
- [ ] API endpoint: `POST /api/v1/admin/orders/{id}/status` (admin-only)
- [ ] Request body: `{ "status": "confirmed", "note": "..." }` (note optional)
- [ ] Validation: only allowed transitions (no jumping from placed → delivered without intermediate steps unless explicitly allowed)
- [ ] Audit: record `updated_by` (admin user_id) + `updated_at` timestamp
- [ ] Optional: `order_status_history` table for full timeline (if not exists, use updated_at + current status)

### 3. Admin Status Update (Frontend) ✅/❌
- [ ] Admin order detail page at `/admin/orders/{id}` (or create if not exists)
- [ ] Status dropdown with allowed transitions
- [ ] Optional note field
- [ ] Save button calls API endpoint
- [ ] Success toast notification
- [ ] Non-admin cannot access page (AuthGuard or 403)

### 4. Consumer Status View ✅/❌
- [ ] Order detail page `/orders/{id}` or `/order/{id}` shows current status
- [ ] Status displayed as chip/badge with color coding
- [ ] Timeline/history section showing status changes (if history table exists)
- [ ] If no history table: show current status + last updated timestamp

### 5. Backend Tests ✅/❌
- [ ] Test: Admin can update order status (placed → confirmed)
- [ ] Test: Non-admin cannot update order status (403)
- [ ] Test: Invalid status transition rejected (422)
- [ ] Test: Status change updates `updated_at` timestamp
- [ ] Minimum: 2 tests (can have more)

### 6. E2E Tests (Playwright) ✅/❌
- [ ] Test: Admin updates order status, customer sees updated status
- [ ] Flow: Create order → Admin login → Update status → Customer login → View order → Status visible
- [ ] Test: Non-admin cannot access admin order management page

### 7. Email Notifications (Optional - assess if already hooked) ✅/❌
- [ ] Check if email system exists (Mail facade, queues)
- [ ] If exists and simple: add status change notification
- [ ] If complex or missing: SKIP and note in risks

### 8. PROD Smoke ✅/❌
- [ ] Order detail page shows status field (verified via curl or smoke test after deployment)

---

## Implementation Plan

### Phase A: Data Model Audit
1. Check existing `orders` table schema for `status` field
2. Check if `order_status_history` or similar tracking table exists
3. Identify default/initial status value
4. If missing: create migration for status field + history table (optional)

### Phase B: Backend API
1. Create or extend `AdminOrderController`
2. Add route: `POST /api/v1/admin/orders/{id}/status` (admin middleware)
3. Add validation: status enum, optional note
4. Add policy: `OrderPolicy::updateStatus()` (admin-only)
5. Update Order model: status transition method
6. If history exists: log status change to history table

### Phase C: Admin Frontend
1. Create or extend admin order detail page: `/admin/orders/{id}`
2. Add status dropdown (populated with valid transitions)
3. Add optional note textarea
4. Wire up API call
5. Add AuthGuard (admin-only)

### Phase D: Consumer Frontend
1. Extend consumer order detail page: `/orders/{id}` or `/order/{id}`
2. Display current status as styled chip
3. If history exists: render timeline component
4. If no history: show "Last updated: {timestamp}"

### Phase E: Tests
1. Backend tests: `tests/Feature/AdminOrderStatusTest.php`
2. E2E test: `tests/e2e/order-status-tracking.spec.ts`
3. Run tests locally and verify PASS

### Phase F: Docs
1. Update STATE.md: Pass 25 → WIP → CLOSED (when DoD met)
2. Update AGENT-STATE.md: Pass 25 → WIP → DONE
3. Create SUMMARY/Pass-25.md with proof + risks

---

## Acceptance Criteria (from STATE.md)

- Consumer sees order status on `/orders/{id}` page ✅
- Backend supports status transitions (POST /api/v1/orders/{id}/status) ✅
- Email sent to consumer on status change (OPTIONAL - assess complexity)
- Backend tests: 2+ tests ✅
- E2E test: 1+ test ✅
- PROD smoke: Order detail page shows status field ✅

---

## Risks & Mitigation

**Risk 1**: Order status field might not exist or use different enum values
- **Mitigation**: Audit first, adapt to existing schema if present

**Risk 2**: Multiple order detail pages (consumer vs admin)
- **Mitigation**: Identify existing pages first, extend rather than create new

**Risk 3**: Email system might not exist or be complex
- **Mitigation**: Assess quickly, SKIP if not trivial

**Risk 4**: No order status history table
- **Mitigation**: Use simplified approach (current status + updated_at), note in docs

---

## Files to Touch (Predicted)

**Backend**:
- `backend/database/migrations/YYYY_MM_DD_add_order_status_tracking.php` (if needed)
- `backend/app/Models/Order.php` (add status transitions if needed)
- `backend/app/Http/Controllers/Api/Admin/AdminOrderController.php` (new or extend)
- `backend/app/Policies/OrderPolicy.php` (add updateStatus method)
- `backend/routes/api.php` (add admin order status route)
- `backend/tests/Feature/AdminOrderStatusTest.php` (new)

**Frontend**:
- `frontend/src/app/admin/orders/[id]/page.tsx` (new or extend)
- `frontend/src/app/(storefront)/orders/[id]/page.tsx` or `/order/[id]/page.tsx` (extend)
- `frontend/tests/e2e/order-status-tracking.spec.ts` (new)

**Docs**:
- `docs/OPS/STATE.md`
- `docs/AGENT-STATE.md`
- `docs/AGENT/PASSES/SUMMARY-Pass-25.md`

---

**Status**: Ready to implement
**Next**: Start with data model audit (check orders.status field)
