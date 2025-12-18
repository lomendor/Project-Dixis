# Next 3 Passes (Execution Plan)

**Last Updated:** 2025-12-18
**Status:** Planning
**Goal:** Close ownership + authorization gaps identified in OWNERSHIP-FLOWS.md

## Pass 1: Backend Authorization for Producer Product CRUD

**Objective:** Ensure producers can only edit their own products, admins can edit all.

### Acceptance Criteria
- ✅ Producer **cannot** edit products belonging to other producers (returns 403)
- ✅ Producer **can** edit products where `product.producer_id = current_producer.id`
- ✅ Admin **can** edit all products regardless of `producer_id`
- ✅ API endpoints return proper error messages for unauthorized attempts

### Implementation Files
- `backend/app/Policies/ProductPolicy.php` - Authorization rules
- `backend/app/Http/Controllers/Api/ProducerController.php` - Producer API
- `backend/app/Http/Controllers/Api/Admin/ProductController.php` - Admin API

### Tests Required
- **Feature test**: Producer attempts to edit another producer's product → 403
- **Feature test**: Producer edits own product → 200
- **Feature test**: Admin edits any product → 200

### Success Metric
Backend tests pass with 100% coverage for ownership checks.

---

## Pass 2: Producer Dashboard Lists Only Own Products

**Objective:** Ensure `/my/products` shows only products owned by authenticated producer.

### Acceptance Criteria
- ✅ GET `/api/me/products` returns only products where `product.producer_id = current_producer.id`
- ✅ Frontend `/my/products` page displays only owned products
- ✅ Product count matches backend filter
- ✅ Attempting to access other producer's product details returns 404 or redirects

### Implementation Files
- `frontend/src/app/my/products/page.tsx` - Producer dashboard
- `frontend/src/app/api/me/products/route.ts` - API route handler
- `backend/app/Http/Controllers/Api/ProducerController.php` - Backend scoping

### Tests Required
- **E2E test**: Login as Producer A, verify only Producer A's products visible
- **E2E test**: Login as Producer B, verify different product list
- **API snapshot**: `/api/me/products` returns scoped results

### Success Metric
Playwright test with two producer accounts shows distinct product lists.

---

## Pass 3: Producer-Product Linkage Completeness

**Objective:** Ensure every product has visible producer reference across all endpoints.

### Acceptance Criteria
- ✅ Every product in `/api/v1/public/products` includes `producer.name`
- ✅ Storefront `/products` page displays `producerName` for all products
- ✅ Product detail page `/products/[id]` shows producer information
- ✅ Admin dashboard `/admin/products` shows producer column

### Implementation Files
- `backend/app/Http/Resources/ProductResource.php` - API serialization
- `frontend/src/app/(storefront)/products/page.tsx` - Product list
- `frontend/src/app/(storefront)/products/[id]/page.tsx` - Product detail
- `frontend/src/app/admin/products/page.tsx` - Admin view

### Tests Required
- **API test**: All products in public API have `producer` object
- **E2E test**: Storefront product cards display producer names
- **Visual regression**: Screenshot product detail page with producer info

### Success Metric
Zero products without producer reference in production API response.

---

## Execution Order

1. **Pass 1 first** (backend authorization) - establishes security foundation
2. **Pass 2 second** (dashboard scoping) - implements user-facing ownership
3. **Pass 3 last** (linkage completeness) - polish and visibility

Each pass should be:
- ≤300 LOC changes
- Single PR with clear AC
- Green CI before merge
- Evidence links in PR description

---

## Known Gaps (from OWNERSHIP-FLOWS.md)

### To Address
- ⚠️ Product creation from admin panel may not auto-set `producer_id` correctly
- ⚠️ Some admin endpoints may lack full authorization checks
- ⚠️ Guest checkout not implemented (`user_id` nullable but flow incomplete)

### Future Work (not in these 3 passes)
- Producer approval workflow polish
- Order fulfillment status updates
- Multi-producer order splitting logic

---

## Related Documentation

- [OWNERSHIP-FLOWS.md](../PRODUCT/OWNERSHIP-FLOWS.md) - Complete ownership specification
- [CAPABILITIES.md](../PRODUCT/CAPABILITIES.md) - Feature status matrix
