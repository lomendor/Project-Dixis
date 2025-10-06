
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
