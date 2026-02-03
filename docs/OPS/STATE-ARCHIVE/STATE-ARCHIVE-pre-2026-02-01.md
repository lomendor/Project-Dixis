# STATE Archive (pre-2026-02-01)

> Archived from `docs/OPS/STATE.md` to keep it under the line budget.

## 2026-01-31 — Pass-PRODUCER-STATUS-COPY-CLARITY-01: Fix misleading approval UI copy

**Status**: ✅ MERGED — PR #2561

**Branch**: `fix/producer-status-copy-clarity`

**Objective**: Remove confusion from UI that implied "producer approval" when system only has operational status.

**Root Cause**:
UI messaging used terms like "Αναμένεται Έγκριση" (Awaiting Approval) implying an admin approval gate. In reality:
- Producer `status` is an **operational state** (active/inactive/pending)
- There is NO admin approval gate for producers
- Product moderation (`approval_status`) exists separately on products, not producers

**Changes** (4 files, UI copy only):

| File | Change |
|------|--------|
| `frontend/src/lib/auth-helpers.ts` | Updated PRODUCER_STATUS_LABELS |
| `frontend/src/app/producer/onboarding/page.tsx` | Replaced approval messaging |
| `frontend/src/app/my/products/page.tsx` | Updated pending state copy |
| `frontend/src/hooks/useProducerAuth.ts` | Fixed redirect reason |

**Copy Changes**:
- "Εγκεκριμένος" → "Ενεργός" (Approved → Active)
- "Αναμένεται Έγκριση" → "Ολοκληρώστε το Προφίλ σας" (Awaiting Approval → Complete Your Profile)

**Scope**: UI copy only. No auth/ownership logic changes.

**Evidence**:
- PR: https://github.com/lomendor/Project-Dixis/pull/2561
- Cross-producer protection: `ProductPolicy::update()` already enforces ownership

---

## 2026-01-31 — Pass-TAXONOMY-AUDIT-01: Taxonomy seed slugs + guardrails

**Status**: ✅ MERGED — PR #2557 (commit `9f883231bfb0f1df5cc8aeff1075c303037ce68e`)

**Branch**: `fix/taxonomy-guardrails-2553`

**Objective**: Fix category slug mismatches in seeders and add taxonomy guardrail tests.

**Root Cause**:
Seeders looked up non-existent slugs:
- `dairy` instead of `dairy-products`
- `honey` instead of `honey-preserves`

This produced NULL category associations in the pivot table (products silently had no categories).

**Changes** (3 files, +232/-5):

| File | Change |
|------|--------|
| `backend/database/seeders/ProductSeeder.php` | Corrected slug lookups |
| `backend/database/seeders/GreekProductSeeder.php` | Canonical slug lookups + safe fallbacks |
| `backend/tests/Feature/TaxonomyGuardrailTest.php` | 8 tests documenting canonical slugs |

**Canonical Category Slugs**:
- `fruits`, `vegetables`, `herbs-spices`, `grains-cereals`
- `dairy-products`, `olive-oil-olives`, `wine-beverages`, `honey-preserves`

**Scope**: Seed/demo + tests only. No production data modifications.

**Evidence**:
- PR: https://github.com/lomendor/Project-Dixis/pull/2557
- Issue: #2553

---

## 2026-01-30 — Pass-PRODUCER-ORDERS-ITEMS-SHAPE-01: Fix order_items snake_case crash

**Status**: ✅ MERGED & DEPLOYED — PR #2549 (commit `6c1b2a97`)

**Branch**: `fix/producer-orders-order-items-shape`

**Objective**: Fix crash on `/producer/orders` due to API returning `order_items` (snake_case) while frontend expected `orderItems` (camelCase).

**Root Cause**:
Backend `ProducerOrderController` returns orders with Laravel's default snake_case JSON serialization (`order_items`), but frontend TypeScript types and UI code expected camelCase (`orderItems`). This caused:
```
TypeError: Cannot read properties of undefined (reading 'length')
```
...which triggered the error boundary.

**Fix**:
- Added `ProducerOrderRaw` interface accepting both snake/camelCase
- Normalized in API layer: `getProducerOrders`, `getProducerOrder`, `updateProducerOrderStatus`
- Added defensive fallback in UI: `(order.orderItems ?? [])`
- Added regression test with snake_case mock data

**Changes** (3 files, +123/-5):

| File | Change |
|------|--------|
| `frontend/src/lib/api.ts` | ProducerOrderRaw + normalization in API methods |
| `frontend/src/app/producer/orders/page.tsx` | Defensive `?? []` fallback |
| `frontend/tests/e2e/producer-orders-management.spec.ts` | Snake_case regression test |

**DoD**:
- [x] Build passes
- [x] TypeScript type-check passes
- [x] E2E regression test added (snake_case order_items mock)
- [x] CI all checks pass
- [x] Deployed to production
- [x] Production proof: /producer/orders works as Producer User

**Evidence**:
- PR: https://github.com/lomendor/Project-Dixis/pull/2549
- Deploy Frontend: run 21532035372 ✅
- VPS bundle: `page-31850167b0476c26.js`
- Production proof: Orders render with "Προϊόντα (3)" count ✅

---

## 2026-01-30 — Pass-HYDRATION-PRODUCER-ORDERS-01: Fix React #418 on Producer Orders

**Status**: ✅ MERGED & DEPLOYED — PR #2548 (commit `f6324107`)

**Branch**: `fix/producer-orders-hydration`

**Objective**: Fix React hydration error #418 on `/producer/orders` page causing error boundary display.

**Root Cause**:
`toLocaleDateString('el-GR', ...)` in `OrderCard` component produced different output:
- Server (SSR): UTC timezone
- Client: User's local timezone (e.g., Europe/Athens)
- Mismatch triggered React #418, caught by error boundary showing "Σφάλμα στην Περιοχή Παραγωγού"

**Fix**:
- Added `mounted` state guard to defer date rendering until after hydration
- Used semantic `<time>` element with `dateTime` attribute
- Added `suppressHydrationWarning` as safety belt
- Changed `toLocaleDateString` → `toLocaleString` (more inclusive)

**Changes** (2 files, +75/-20):

| File | Change |
|------|--------|
| `frontend/src/app/producer/orders/page.tsx` | Mounted guard + `<time>` element |
| `frontend/tests/e2e/producer-orders-management.spec.ts` | Hydration regression test |

**DoD**:
- [x] Build passes
- [x] TypeScript type-check passes
- [x] E2E regression test added (checks for error boundary + console #418)
- [x] CI all checks pass
- [x] Deployed to production
- [x] VPS commit matches PR

**Evidence**:
- PR: https://github.com/lomendor/Project-Dixis/pull/2548
- Deploy Backend: run 21531117405 ✅
- Deploy Frontend: run 21531118848 ✅
- VPS commit: `f6324107 fix(frontend): resolve React hydration error #418 on producer orders page (#2548)`

**Security Cleanup**: Revoked 4 debug tokens for user_id=10 created during investigation.
