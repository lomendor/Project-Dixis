
## Pass 111 — PostgreSQL CI/CD consolidation ✅
- **Database Provider**: Already using PostgreSQL in Prisma schema (provider = "postgresql")
- **CI Credentials Aligned**: Updated workflow Postgres service to use `postgres:postgres` (matches .env.example)
- **DATABASE_URL**: Set at job level in workflow for CI consistency
- **.env.example Updated**: Standardized to `postgresql://postgres:postgres@127.0.0.1:5432/dixis?schema=public`
- **CI Script Enhanced**: Added Prisma migrate deploy + seed before tests (conditional on DATABASE_URL)
- **Wait Script Created**: `scripts/db/wait-for-postgres.sh` for healthcheck (60s timeout)
- **Migrations**: Existing PostgreSQL migrations verified (20251005000000_init, add_producer_image)
- **Seed Script**: Already exists at `frontend/prisma/seed.ts` with db:seed npm script

### Technical Notes
- Postgres service: `postgres:16-alpine` with pg_isready healthcheck
- Migration strategy: `prisma migrate deploy` (production-safe, no prompts)
- Seed: Idempotent upserts for demo producers (3 initial records)
- All infrastructure already PostgreSQL-ready from previous passes

## Pass 112 — DB hardener (Postgres) ✅
- **Prisma Schema Enhanced**: 
  - Added Product, Order, OrderItem models with full relations
  - All models have `createdAt` and `updatedAt` fields
  - Performance indexes: Product(producerId,createdAt), Order(buyerPhone,createdAt), OrderItem(orderId),(producerId,status)
  
- **Safe Checkout Transaction**:
  - Created `/api/checkout` route with Prisma `$transaction`
  - Oversell protection: validates stock before decrement
  - Returns 409 Conflict when insufficient stock
  - Atomic operations prevent race conditions

- **Playwright Tests**:
  - `tests/orders/checkout-stock.spec.ts` with 2 test scenarios
  - Test 1: Oversell blocked (409), successful order decrements stock
  - Test 2: Concurrent orders cannot oversell (transaction isolation)

### Technical Implementation
- **Transaction Safety**: All stock checks and decrements in single `$transaction`
- **Oversell Guard**: Pre-validates stock availability before any updates
- **Error Handling**: OVERSALE exception → 409 HTTP status with Greek message
- **Data Integrity**: Cascade deletes, restrict on product deletion if ordered

### Database Schema
```prisma
Product: id, producerId, title, price, stock, createdAt, updatedAt
Order: id, buyerPhone, buyerName, shipping*, total, status, createdAt, updatedAt
OrderItem: id, orderId, productId, producerId, qty, price, status, createdAt, updatedAt
```

### Indexes Strategy
- **Product**: (producerId, createdAt) for producer dashboard, (category) for filtering
- **Order**: (buyerPhone, createdAt) for user orders, (status, createdAt) for admin
- **OrderItem**: (orderId) for order details, (producerId, status) for producer fulfillment

## Pass 113.2 — Public Catalog ✅

**Date**: 2025-10-06
**PR**: #391
**Branch**: feat/pass1132-public-catalog

### Completed
- ✅ **/products**: Public product list page with search/filters/pagination
- ✅ **/product/[id]**: Product detail page with add-to-cart functionality
- ✅ **Active-Only Display**: Only shows `isActive: true` products
- ✅ **Greek-First UI**: All user-facing text in Greek with accessibility labels
- ✅ **Playwright E2E Tests**: Comprehensive catalog workflow coverage

### Implementation Details

**Public Product List** (frontend/src/app/products/page.tsx):
- Server-side rendering with Prisma queries
- Filters: `q` (title search), `category`, `region` (producer)
- Pagination: 24 items per page with navigation controls
- Security: WHERE clause filters `isActive: true` only
- Responsive grid layout with Tailwind
- "Εξαντλήθηκε" badge for out-of-stock items (stock=0)

**Product Detail Page** (frontend/src/app/product/[id]/page.tsx):
- Server-side rendering with producer data included
- Full product info: title, price, unit, stock, description, image
- Add to cart form with quantity input
- Disabled state when stock=0 with "Εξαντλήθηκε" badge
- Producer information display (name, region)
- Redirects to /products if product not found or inactive

**E2E Test Suite** (frontend/tests/catalog/catalog-basic.spec.ts):
1. Catalog shows only active products (archived products hidden)
2. Product detail page loads with add-to-cart button visible
3. Products list accessible without authentication

### Technical Implementation
- **Security**: Server-side `isActive: true` filtering prevents archived product leaks
- **Performance**: Prisma select optimization, pagination with skip/take
- **Accessibility**: aria-labels, semantic HTML, htmlFor attributes
- **Greek-First**: All placeholders, labels, buttons, messages in Greek
- **Stock Management**: Quantity input capped at available stock, disabled when stock=0

### Files Changed
- frontend/src/app/products/page.tsx (created, 158 LOC)
- frontend/src/app/product/[id]/page.tsx (created, 123 LOC)
- frontend/tests/catalog/catalog-basic.spec.ts (created, 183 LOC)

### Next Steps
- Monitor PR #391 CI status
- Continue with cart integration enhancements
- Consider implementing category/region filter dropdowns (vs text inputs)

## Pass 114 — Orders MVP ✅

**Date**: 2025-10-06
**PR**: #392
**Branch**: feat/pass114-orders-mvp

### Completed
- ✅ **Checkout Enhancement**: /api/checkout now creates Order + OrderItems with product snapshots
- ✅ **Producer Orders Inbox**: /my/orders with status-based tabs and actions
- ✅ **Status Flow**: PENDING → ACCEPTED → FULFILLED with server actions
- ✅ **E2E Tests**: Complete order workflow + oversell protection validation

### Schema Changes

**OrderItem Model** (frontend/prisma/schema.prisma):
- Added `titleSnap` (String?) - Product title snapshot at order time
- Added `priceSnap` (Float?) - Product price snapshot at order time
- Migration: `20251006000000_add_orderitem_snapshots`

**Purpose**: Historical tracking of product details at time of purchase, independent of current product data.

### Checkout API Enhancement

**Order Creation Flow** (frontend/src/app/api/checkout/route.ts):
1. Validate stock for all items (throw 'OVERSALE' if insufficient)
2. Fetch product data including `title` for snapshots
3. Create Order record with buyer/shipping details
4. Create OrderItems with:
   - `titleSnap`: Product title at order time
   - `priceSnap`: Product price at order time
   - `producerId`: For producer order filtering
   - `status`: 'pending' (lowercase)
5. Atomic stock decrement with race condition protection
6. Returns `orderId` in response

**Oversell Protection**: Maintained 409 Conflict response for insufficient stock.

### Producer Orders Inbox

**Page** (frontend/src/app/my/orders/page.tsx):
- **Tabs**: PENDING, ACCEPTED, REJECTED, FULFILLED (Greek labels)
- **Filtering**: Server-side query by `status` field (lowercase)
- **Display**: Shows titleSnap, priceSnap, qty, orderId, createdAt
- **Actions**:
  - PENDING tab: "Αποδοχή" (Accept), "Απόρριψη" (Reject)
  - ACCEPTED tab: "Ολοκλήρωση" (Fulfill)
  - REJECTED/FULFILLED: No actions (terminal states)

**Server Actions** (frontend/src/app/my/orders/actions/actions.ts):
- `setOrderItemStatus(id, next)`: Handles status transitions
- **Validation Rules**:
  ```
  PENDING → [ACCEPTED, REJECTED]
  ACCEPTED → [FULFILLED, REJECTED]
  REJECTED → [] (terminal)
  FULFILLED → [] (terminal)
  ```
- Blocks invalid transitions with Greek error message
- Revalidates `/my/orders` path after updates

### E2E Test Coverage

**Test Suite** (frontend/tests/orders/orders-mvp.spec.ts):

**Test 1 - Full Order Flow**:
1. Create producer + product (stock=3)
2. Checkout 2 items via API
3. Navigate to /my/orders?tab=PENDING
4. Verify order visible, click "Αποδοχή"
5. Navigate to /my/orders?tab=ACCEPTED
6. Verify order visible, click "Ολοκλήρωση"
7. Navigate to /my/orders?tab=FULFILLED
8. Verify order visible (complete flow)

**Test 2 - Oversell Protection**:
1. Create producer + product (stock=1)
2. Attempt checkout of 2 items
3. Verify 409 status code
4. Verify error message contains "Ανεπαρκές απόθεμα"

### Technical Implementation

**Status Values**: Lowercase in database (`pending`, `accepted`, `rejected`, `fulfilled`)
**UI Display**: Uppercase for comparisons, Greek labels via EL map
**Database Queries**: Direct Prisma with server components (no API overhead)
**Form Actions**: Server actions with inline `'use server'` directive
**Path Revalidation**: Automatic cache invalidation after mutations

### Files Changed
- frontend/prisma/schema.prisma (modified, +2 fields)
- frontend/prisma/migrations/20251006000000_add_orderitem_snapshots/migration.sql (created)
- frontend/src/app/api/checkout/route.ts (modified, +snapshots)
- frontend/src/app/my/orders/page.tsx (created, 138 LOC)
- frontend/src/app/my/orders/actions/actions.ts (created, 47 LOC)
- frontend/tests/orders/orders-mvp.spec.ts (created, 237 LOC)

### Next Steps
- Monitor PR #392 CI status
- Consider adding order-level status aggregation (all items fulfilled → order fulfilled)
- Implement buyer-side order history (/account/orders)
- Add email notifications for status changes

## Pass 114.1 — Orders finisher ✅

**Date**: 2025-10-06
**PR**: #393
**Branch**: chore/pass1141-orders-fixups

### Completed
- ✅ **Status Normalization**: Changed OrderItem status to uppercase 'PENDING'
- ✅ **Producer Redirects**: Added /producer/orders → /my/orders
- ✅ **Tests Path**: Moved orders E2E to canonical location

### Status Normalization

**Issue**: OrderItem created with lowercase 'pending', but UI tabs compare uppercase
**Fix** (frontend/src/app/api/checkout/route.ts):
- Changed `status: 'pending'` → `status: 'PENDING'`
- **Impact**: /my/orders?tab=PENDING now correctly shows new orders
- Matches server actions validation which expects uppercase

**Why uppercase**:
- UI tab filtering uses uppercase constants (PENDING/ACCEPTED/REJECTED/FULFILLED)
- Server actions ALLOWED map uses uppercase keys
- Consistency across checkout → display → actions flow

### Producer Path Redirects

**Created** (frontend/src/app/producer/orders/page.tsx):
```tsx
import { redirect } from 'next/navigation';
export default function Page() { redirect('/my/orders'); }
```

**Verified** (frontend/src/app/producer/products/page.tsx):
- Already redirects to /my/products
- Both producer paths now consolidated under /my/*

**Why redirects**:
- Backward compatibility with old URLs
- Canonical paths: /my/products, /my/orders (producer-owned resources)
- Cleaner URL structure for authenticated users

### Tests Path Canonicalization

**Moved**: 
- FROM: `tests/orders/orders-mvp.spec.ts` (repo root)
- TO: `frontend/tests/orders/orders-mvp.spec.ts` (canonical)

**Why canonical path**:
- Consistency with other E2E tests (tests/catalog/, tests/admin/)
- Frontend-specific tests live under frontend/
- Easier to run subset: `cd frontend && npx playwright test tests/orders`

### Files Changed
- frontend/src/app/api/checkout/route.ts (modified, status: 'PENDING')
- frontend/src/app/producer/orders/page.tsx (created, redirect)
- tests/orders/orders-mvp.spec.ts → frontend/tests/orders/orders-mvp.spec.ts (moved)

### Next Steps
- Monitor PR #393 CI status
- Verify /my/orders?tab=PENDING shows orders after checkout
- Consider adding /producer/* legacy notice (deprecation warning)

## Pass 114.1 → Unified into Orders MVP ✅

**Date**: 2025-10-06
**Action**: Cherry-picked Pass 114.1 into feat/pass114-orders-mvp (PR #392)

### Completed
- ✅ **Cherry-pick**: Unified fixup commits into PR #392
- ✅ **PR #393 Closed**: Marked as superseded by #392
- ✅ **Status normalized**: OrderItem uses 'PENDING' (uppercase)
- ✅ **Redirects in place**: /producer/orders → /my/orders
- ✅ **Tests path canonical**: frontend/tests/orders/

### Unification Process

**Cherry-picked commits**:
1. `d1e6cae` - chore(orders): normalize status to PENDING; add producer→my redirects; move orders e2e
2. `8d56a14` - docs(ops): record Pass 114.1 completion

**Result**: PR #392 now contains complete Orders MVP with all fixups integrated.

### Final State

**PR #392** (feat/pass114-orders-mvp):
- Orders MVP implementation with snapshots
- Status normalization (PENDING uppercase)
- Producer path redirects (/producer/* → /my/*)
- Tests in canonical location (frontend/tests/orders/)
- Armed for auto-merge

**PR #393** (chore/pass1141-orders-fixups):
- Closed as superseded
- All changes integrated into #392

### Technical Details

**Status values**:
- OrderItem.status: 'PENDING' (uppercase, matches UI tabs)
- Order.status: 'pending' (lowercase, legacy field)
- UI filtering uses OrderItem.status exclusively

**Paths consolidated**:
- /my/orders: Producer orders inbox (canonical)
- /my/products: Producer products CRUD (canonical)
- /producer/orders: Redirect to /my/orders
- /producer/products: Redirect to /my/products

### Next Steps
- Monitor PR #392 CI completion
- Verify auto-merge triggers after CI passes
- Confirm /my/orders?tab=PENDING shows new orders
