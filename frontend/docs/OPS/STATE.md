
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

## Pass 114.2 — Orders PR Finalizer ✅

**Date**: 2025-10-06
**Action**: Rebase feat/pass114-orders-mvp onto main, resolve conflicts, retrigger CI

### Completed
- ✅ **Rebase onto main**: Clean rebase, duplicate commits auto-dropped
- ✅ **Conflict Resolution**: All Dixis rules enforced
- ✅ **CI Retriggered**: Empty commit to trigger workflow
- ✅ **Auto-merge Armed**: PR #392 ready for merge
- ✅ **Mergeable Status**: MERGEABLE (was CONFLICTING)

### Rebase Process

**Rebased commits**:
- Dropped 2 duplicate commits from PR #391 (already in main)
- Preserved 5 commits:
  1. `c8bcd3b` - feat(orders): Orders MVP implementation
  2. `bb2c529` - docs(ops): record Pass 114
  3. `0f9171a` - chore(orders): status normalization + redirects
  4. `1bf49c8` - docs(ops): record Pass 114.1
  5. `f07d024` - docs(ops): unified 114.1 into PR #392

**Conflict Resolution**: None needed - clean rebase

### Verified Dixis Rules

**Checkout Route** (frontend/src/app/api/checkout/route.ts):
- ✅ Shared Prisma client: `import { prisma } from '@/lib/db/client'`
- ✅ Atomic guard: `updateMany({ where: { stock: { gte: qty } }})`
- ✅ 409 error: `{ status: 409 }` for oversell
- ✅ OrderItem.status: 'PENDING' (uppercase)
- ✅ Transaction safety: All operations in `$transaction`

**Path Structure**:
- ✅ /my/orders: Producer orders inbox (canonical UI)
- ✅ /my/products: Producer products CRUD (canonical UI)
- ✅ /producer/orders: Redirect to /my/orders
- ✅ /producer/products: Redirect to /my/products

**Tests**:
- ✅ frontend/tests/orders/orders-mvp.spec.ts (canonical location)

### CI Trigger

**Issue**: CI was skipped after force-push
**Solution**: Created empty commit `8ac9f7d` to trigger workflow
**Result**: CI running, auto-merge armed

### PR #392 Final Status

**Mergeable**: MERGEABLE ✅
**State**: OPEN (waiting for CI checks)
**Auto-merge**: ENABLED (squash merge)
**Checks**: 
- 1 SKIPPED (expected)
- 1 SUCCESS
- Others PENDING

### Next Steps
- CI checks will complete automatically
- Auto-merge will trigger when all checks pass
- PR #392 will be squashed and merged to main

## Pass AG1 — Agent Docs & Context Hygiene (2025-10-07)

**Στόχος**: Δημιουργία `docs/AGENT` δομής για καλύτερη διαχείριση context και ομαλή συνέχεια σε νέα chats.

**Υλοποίηση**:
- ✅ Δομή `docs/AGENT/{SYSTEM,SOPs,TASKS,COMMANDS,SUMMARY}`
- ✅ README.md με οδηγίες για agents
- ✅ SYSTEM docs: architecture.md, env.md (registry)
- ✅ SOPs: SOP-Feature-Pass.md, SOP-Context-Hygiene.md
- ✅ COMMANDS/update-doc.md με init/after-pass modes
- ✅ Templates: Pass-000-Template.md, Pass-000-TLDR.md
- ✅ Helper scripts (.mjs): scan-routes.mjs, scan-prisma.mjs
- ✅ npm scripts: `agent:routes`, `agent:schema`, `agent:docs`
- ✅ Auto-generated: routes.md, db-schema.md

**Αρχεία**:
- docs/AGENT/README.md
- docs/AGENT/SYSTEM/{architecture,env,routes,db-schema}.md
- docs/AGENT/SOPs/{SOP-Feature-Pass,SOP-Context-Hygiene}.md
- docs/AGENT/COMMANDS/update-doc.md
- docs/AGENT/TASKS/Pass-000-Template.md
- docs/AGENT/SUMMARY/Pass-000-TLDR.md
- scripts/{scan-routes,scan-prisma}.mjs
- frontend/package.json (npm scripts)

**PR**: #410 (merged)

**Επόμενα**: Χρήση AGENT docs σε επόμενους passes για μείωση context bloat.


## Pass AG1.2 — Scanners fixed & docs regenerated (2025-10-07)

**Στόχος**: Διόρθωση scanners για σωστή έξοδο σε `frontend/docs/AGENT/SYSTEM/`

**Υλοποίηση**:
- ✅ Scanners γράφουν πάντα σε `frontend/docs/AGENT/SYSTEM/` (absolute paths)
- ✅ Αναγέννηση `routes.md` (30+ routes, non-empty)
- ✅ Αναγέννηση `db-schema.md` (Prisma schema)
- ✅ npm scripts verified: `agent:routes`, `agent:schema`, `agent:docs`

**Αλλαγές**:
- scripts/scan-routes.mjs: Χρήση `path.join('frontend','docs','AGENT','SYSTEM','routes.md')`
- scripts/scan-prisma.mjs: Χρήση `path.join('frontend','docs','AGENT','SYSTEM','db-schema.md')`
- Logs: Εμφανίζουν count routes & bytes

**Επόμενα**: Scanners λειτουργούν σωστά από οποιοδήποτε directory.

## Pass 129 — Checkout polish (Shipping + Payment abstraction w/ COD) (2025-10-07)

**Στόχος**: Προσθήκη υπολογισμού μεταφορικών και payment abstraction με COD fallback.

**Υλοποίηση**:
- ✅ Shipping calculator: `lib/checkout/shipping.ts`
  - Flat fee: `SHIPPING_FLAT_EUR` (default 3.5€)
  - Free over threshold: `SHIPPING_FREE_OVER_EUR` (default 35€)
- ✅ Payment abstraction: `lib/payments/provider.ts`
  - COD fallback (Stripe to be added later)
  - `createPaymentIntent()` returns COD by default
- ✅ Quote API: `/api/checkout/quote`
  - POST with `{ subtotal }` → returns `{ subtotal, shipping, total }`
- ✅ Checkout route updated:
  - Imports `computeShipping` and `createPaymentIntent`
  - Calculates subtotal → shipping → total
  - Stores in order.meta (best-effort)
  - Creates COD payment intent
- ✅ ShippingSummary component: EL-first cost breakdown
- ✅ E2E tests: below/above threshold scenarios
- ✅ ENV: `SHIPPING_FLAT_EUR`, `SHIPPING_FREE_OVER_EUR`

**Αρχεία**:
- frontend/src/lib/checkout/shipping.ts
- frontend/src/lib/payments/provider.ts
- frontend/src/app/api/checkout/quote/route.ts
- frontend/src/app/api/checkout/route.ts (updated)
- frontend/src/components/ShippingSummary.tsx
- frontend/tests/checkout/shipping-fee.spec.ts
- .env.example

**Επόμενα**: Stripe/Viva integration σε επόμενο pass.

## Pass 130 — Admin Orders Dashboard (2025-10-07)

**Στόχος**: Admin UI για διαχείριση παραγγελιών με status transitions.

**Υλοποίηση**:
- ✅ `/admin/orders` - Λίστα παραγγελιών
  - Φίλτρα: Κατάσταση (PENDING/PAID/PACKING/SHIPPED/DELIVERED/CANCELLED)
  - Αναζήτηση: ID, όνομα, τηλέφωνο
  - Πίνακας με στοιχεία παραγγελίας
  
- ✅ `/admin/orders/[id]` - Λεπτομέρειες παραγγελίας
  - Πλήρη στοιχεία παραγγελίας και πελάτη
  - Λίστα προϊόντων με τιμές
  - Διεύθυνση αποστολής
  - Actions για αλλαγή κατάστασης
  
- ✅ API: `POST /api/admin/orders/[id]/status`
  - Admin-only (με fallback σε session check)
  - Safe transitions:
    - PENDING → PACKING/CANCELLED
    - PAID → PACKING/CANCELLED
    - PACKING → SHIPPED/CANCELLED
    - SHIPPED → DELIVERED
  - Validation: Απορρίπτει invalid transitions
  
- ✅ Email notifications (graceful no-op):
  - Ενημέρωση πελάτη σε αλλαγή status
  - Χρήση sendMailSafe() από Pass 128R
  
- ✅ E2E tests: Admin orders smoke tests

**Αρχεία**:
- frontend/src/app/api/admin/orders/[id]/status/route.ts
- frontend/src/app/admin/orders/page.tsx
- frontend/src/app/admin/orders/[id]/page.tsx
- frontend/tests/admin/orders-status.spec.ts

**UI Features**:
- EL-first interface
- Status badges με χρώματα
- Responsive table design
- Server actions για status changes

**Επόμενα**: Admin analytics dashboard, bulk actions.

## Pass 131 — Admin Orders Utilities (CSV export + pagination + print view) + e2e
- **CSV Export API**: `/api/admin/orders.csv` με φίλτρα (status, q) που επιστρέφει `text/csv; charset=utf-8` με BOM για Excel
  - Header row: id, createdAt, status, buyerName, buyerPhone, totalEUR
  - Proper CSV escaping για quotes και newlines
  - Filename: `orders-YYYY-MM-DD.csv`
- **Pagination** στο `/admin/orders`:
  - ENV: `ADMIN_ORDERS_PAGE_SIZE=20` (default)
  - Query params: `page`, `pageSize` (max 200)
  - UI controls: Προηγούμενη/Επόμενη με disabled states
  - Display: "Σελίδα X από Y (Z συνολικά)"
  - CSV link preserves filters
- **Print View**: `/admin/orders/[id]/print`
  - Full order details (items, totals, shipping address)
  - Print-friendly styling με `@media print`
  - EL-first με Greek date/currency formatting
  - Print button + back link (hidden on print)
  - Link από detail page: 🖨 Εκτύπωση
- **E2E Tests**:
  - CSV: Επιστρέφει 200, BOM + header row, valid structure
  - Print: Φορτώνει σελίδα, εμφανίζει order info, print button visible
- **Files**:
  - `frontend/src/app/api/admin/orders.csv/route.ts` (CSV API)
  - `frontend/src/app/admin/orders/page.tsx` (pagination + CSV link)
  - `frontend/src/app/admin/orders/[id]/print/page.tsx` (print view)
  - `frontend/tests/admin/orders-export-print.spec.ts` (e2e)
  - `.env.example` (ADMIN_ORDERS_PAGE_SIZE)
- No schema changes, no new packages

## Pass 132 — Admin Dashboard (KPIs + daily revenue + top products)
- **Stats API**: `/api/admin/stats` (server-side compute, no schema changes)
  - KPIs: totalOrders, revenueTotal, avgOrder, ordersToday
  - Status breakdown: PENDING/PAID/PACKING/SHIPPED/DELIVERED/CANCELLED counts
  - Last 14 days: Daily order count and revenue
  - Top 10 products: By quantity sold (30-day window)
- **Dashboard Page**: `/admin/dashboard`
  - 4 KPI cards with responsive grid layout
  - Status breakdown table
  - Daily revenue/orders table (14 days)
  - Top products table with ranking
  - EL-first UI with Greek formatting (dates, currency)
- **E2E Tests**:
  - Stats API: Validates response structure, KPIs, arrays
  - Dashboard: Page loads, KPI cards visible, sections present
- **Files**:
  - `frontend/src/app/api/admin/stats/route.ts` (stats API)
  - `frontend/src/app/admin/dashboard/page.tsx` (dashboard page)
  - `frontend/tests/admin/dashboard.spec.ts` (e2e tests)
- No schema changes, no chart libraries (plain tables)

## Pass 133 — Admin Guard Hardening
- `requireAdmin()` με ENV allowlist (`ADMIN_PHONES`), permissive αν λείπει (dev/CI)
- Graceful fallback: αν το ENV δεν είναι ρυθμισμένο, ο guard δεν μπλοκάρει (non-breaking για CI/dev)
- Σε production **πρέπει** να οριστεί το `ADMIN_PHONES` με comma-separated E.164 phones
- Helper: `isAdminRequest()` για συνθήκες στα RSC
- Ενημέρωση `.env.example` και δημιουργία `frontend/docs/AGENT/SYSTEM/env.md`
- **Files**:
  - `frontend/src/lib/auth/admin.ts` (hardened guard)
  - `frontend/docs/AGENT/SYSTEM/env.md` (env documentation)
  - `.env.example` (ADMIN_PHONES)

## Pass 134 — Emails (Order Confirmation + Status Update)
- **Mailer**: Safe SMTP με graceful fallback (noop αν λείπουν envs)
- **Templates**: Ελληνικά HTML + text για confirmation & status update
- **Checkout hook**: Αυτόματη αποστολή επιβεβαίωσης μετά την παραγγελία
- **Admin status hook**: Αυτόματη αποστολή ενημέρωσης σε αλλαγή κατάστασης
- **Admin preview**: `/admin/emails/preview?kind=confirm|status&id=<orderId>`
- **Dev mailbox**: `SMTP_DEV_MAILBOX=1` γράφει σε `frontend/.tmp/last-mail.json`
- **ENV**: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_DEV_MAILBOX, DEV_MAIL_TO
- **Files**:
  - `frontend/src/lib/mail/mailer.ts` (safe SMTP + render helpers)
  - `frontend/src/emails/order-confirmation.ts` (EL template)
  - `frontend/src/emails/order-status-update.ts` (EL template)
  - `frontend/src/app/api/checkout/route.ts` (confirmation hook)
  - `frontend/src/app/api/admin/orders/[id]/status/route.ts` (status hook)
  - `frontend/src/app/admin/emails/preview/page.tsx` (preview page)
  - `frontend/docs/AGENT/SYSTEM/env.md` (SMTP docs)
  - `.env.example` (SMTP config)
- Dependency: nodemailer
## Pass 135 — Producer Portal v1 (Products CRUD + Orders)
- **Producer Guard**: `requireProducer()` με ENV allowlist (`PRODUCER_PHONES`), permissive αν λείπει (dev/CI)
  - Λειτουργεί όπως το `requireAdmin()` με allowlist τηλεφώνων
  - Best-effort ownership: Χρήση `ownerId` στο schema αν υπάρχει
- **Product Pages**: `/me/products` CRUD με Server Actions & Zod validation
  - List: `/me/products` — αναζήτηση, φίλτρα (active status), responsive table
  - Create: `/me/products/new` — φόρμα με πεδία: title, category, price, unit, stock, isActive, description
  - Edit: `/me/products/[id]` — επεξεργασία + soft delete (isActive toggle)
  - Server Actions: createProduct, updateProduct, deactivate (no new API routes)
  - Zod schema: Validation για όλα τα πεδία (min length, number coercion, etc.)
- **Orders Page**: `/me/orders` — παραγγελίες που περιέχουν προϊόντα του παραγωγού
  - Best-effort filtering: Προσπαθεί `ownerId` relation, fallback σε όλες τις παραγγελίες (dev)
  - Εμφανίζει: order ID, ημερομηνία, κατάσταση, items του παραγωγού, συνολικό ποσό
  - EL-first UI: Greek locale για dates, currency formatting
- **ENV**: PRODUCER_PHONES — comma-separated E.164 phones με πρόσβαση στο `/me/*`
- **Files**:
  - `frontend/src/lib/auth/producer.ts` (producer guard)
  - `frontend/src/app/me/products/page.tsx` (product list)
  - `frontend/src/app/me/products/new/page.tsx` (create product)
  - `frontend/src/app/me/products/[id]/page.tsx` (edit product)
  - `frontend/src/app/me/orders/page.tsx` (orders list)
  - `frontend/docs/AGENT/SYSTEM/env.md` (PRODUCER_PHONES docs)
  - `.env.example` (PRODUCER_PHONES)
- E2E test: Producer creates product → edits → toggles active → checkout → `/me/orders` verification
- No schema changes, no new dependencies


## Pass 136 — Producer Ownership Hardening
- **Helper**: `resolveProducerIdStrict()` — no fallback, strict mapping via userId or phone
- **Strict Filtering**: `/me/products` & `/me/orders` scoped αυστηρά ανά producerId
  - No "first producer" fallback — shows error message if no mapping found
  - List page: filters by producerId, shows CTA if unmapped
  - Create page: requires producerId, throws error if unmapped
  - Edit page: scopes to producerId (cannot edit other producers' products)
  - Orders page: shows only orders containing producer's products
- **Types Cleanup**: Removed `as any` from create operations, using `Prisma.ProductUncheckedCreateInput`
- **Redirects**: `/producer/{products,orders,onboarding}` → 301 to `/me/*` pages
- **E2E Isolation**: `tests/producer/isolation.spec.ts` — Producer A cannot see/edit Producer B data
- **Files**:
  - `frontend/src/lib/auth/resolve-producer.ts` (strict resolver)
  - `frontend/src/app/me/products/page.tsx` (hardened list)
  - `frontend/src/app/me/products/new/page.tsx` (typed create, no fallback)
  - `frontend/src/app/me/products/[id]/page.tsx` (scoped edit)
  - `frontend/src/app/me/orders/page.tsx` (strict filtering)
  - `frontend/src/app/producer/{products,orders,onboarding}/page.tsx` (redirects)
  - `frontend/tests/producer/isolation.spec.ts` (e2e test)
- No schema changes, multi-tenant safety enforced

## Pass 137 — Inventory Guards
- **Checkout**: Atomic stock decrement with oversell protection (Prisma $transaction)
  - Uses `decrementStockAtomic()` helper inside transaction
  - Throws StockError if insufficient stock → returns 400 with Greek error message
  - Low stock warnings when stock < threshold (ENV: LOW_STOCK_THRESHOLD)
  - Optional admin email notification (DEV_MAIL_TO) for low stock
- **Admin CANCELLED**: Automatic restock of items
  - Restocks items when order status changes to CANCELLED (one-time only)
  - Transaction-safe increment of product stock
  - Logs restock activity
- **E2E Tests**: `tests/checkout/stock.spec.ts`
  - Test 1: Successful checkout decrements stock
  - Test 2: Oversell blocked (qty > stock returns 400)
  - Test 3: Cancel → restock items
- **Files**:
  - `frontend/src/lib/inventory/stock.ts` (atomic ops helper)
  - `frontend/src/app/api/checkout/route.ts` (integrated atomic decrement)
  - `frontend/src/app/api/admin/orders/[id]/status/route.ts` (restock on cancel)
  - `frontend/tests/checkout/stock.spec.ts` (e2e tests)
  - `.env.example` (LOW_STOCK_THRESHOLD)
- No schema changes, inventory safety enforced

## Pass 138 — Storefront v1
- **Customer Pages**: EL-first public storefront with full checkout flow
  - `/` (Home): Featured products, category links, welcome message
  - `/products`: List with search, category filters, pagination (24/page), stock indicators
  - `/products/[id]`: Detail page with Add to Cart (qty ≤ stock, disabled if stock=0)
  - `/cart`: Cart summary with quantity management, subtotal display
  - `/checkout`: Shipping form + COD payment, calls existing `/api/checkout`
  - `/checkout/confirmation`: Success page with orderId display
- **Cart System**: Client-side localStorage with React Context
  - `CartProvider`: React Context for global cart state
  - Cart utilities: addItem, setQty, removeItem, clearCart (stock safety enforced)
  - Persists across page refreshes, serializes to checkout API
- **Stock Safety**: Client-side validation prevents qty > stock
  - AddToCartButton enforces maxQty limits
  - Cart page enforces stock limits on quantity changes
  - Products show "Εξαντλημένο" badge when stock=0
- **E2E Tests**: `tests/storefront/browse.spec.ts`
  - Full flow: Browse → Add to cart → Checkout COD → Confirmation
  - Search and filter products
  - Cart quantity management
  - Empty cart redirects
- **Files**:
  - `frontend/src/lib/cart/cart.ts` (cart utilities)
  - `frontend/src/components/CartProvider.tsx` (React Context)
  - `frontend/src/app/layout.tsx` (CartProvider wired)
  - `frontend/src/app/(storefront)/page.tsx` (home page)
  - `frontend/src/app/(storefront)/products/page.tsx` (product list)
  - `frontend/src/app/(storefront)/products/[id]/page.tsx` (product detail)
  - `frontend/src/app/(storefront)/products/[id]/AddToCartButton.tsx` (add to cart)
  - `frontend/src/app/(storefront)/cart/page.tsx` (cart page)
  - `frontend/src/app/(storefront)/checkout/page.tsx` (checkout page)
  - `frontend/src/app/(storefront)/checkout/confirmation/page.tsx` (confirmation)
  - `frontend/tests/storefront/browse.spec.ts` (e2e tests)
- No schema changes, no new packages, integrates with existing checkout API

## Pass 139 — Checkout Hardening
- **Server Validation**: Comprehensive Zod validation in `/api/checkout`
  - Items validation: non-empty array, productId required, qty ≥1
  - Shipping validation: all required fields (name, phone, line1, city, postal)
  - Email validation: optional but must be valid format if provided
  - Payment method: COD only (literal validation)
  - Error responses: 400 with `{error, field?}` structure in Greek
- **Confirm Page**: `/checkout/confirm/[id]` (EL-first)
  - Displays order ID, date, status, total
  - Shows shipping address
  - Info box with next steps (email, COD payment, updates)
  - Links to home and continue shopping
  - Dynamic rendering to fetch order details
- **Client Redirect**: Checkout now redirects to `/checkout/confirm/[orderId]`
  - No more alert messages
  - Cart cleared on successful checkout
  - Clean URL structure with order ID
- **E2E Tests**: `tests/storefront/checkout-hardening.spec.ts`
  - Test 1: Empty cart blocked (400)
  - Test 2: Missing shipping data blocked (400)
  - Test 3: Invalid quantity blocked (400)
  - Test 4: Invalid email blocked (400)
  - Test 5: Happy path redirects to confirm page
- **Files**:
  - `frontend/src/app/api/checkout/route.ts` (Zod validation)
  - `frontend/src/app/checkout/confirm/[id]/page.tsx` (confirm page)
  - `frontend/src/app/checkout/page.tsx` (redirect update)
  - `frontend/tests/storefront/checkout-hardening.spec.ts` (e2e tests)
  - `frontend/docs/OPS/STATE.md` (Pass 139 docs)
- No schema changes, Zod already installed

## Pass 140 — Admin Orders v1
- **Admin Orders List** (`/admin/orders`):
  - Filters: status, search (ID/name/phone), date range (from–to)
  - Pagination: 20 items per page (configurable via ENV)
  - CSV export link with filters
  - Security: `requireAdmin()` guard
  - Responsive table with status badges
- **Order Detail Page** (`/admin/orders/[id]`):
  - Full order information display
  - Customer details and shipping address
  - Order items with prices and totals
  - Status transition buttons with server actions
  - Valid transitions: PENDING → PAID/PACKING/CANCELLED, PAID → PACKING/CANCELLED, PACKING → SHIPPED/CANCELLED, SHIPPED → DELIVERED
  - Calls existing `/api/admin/orders/[id]/status` API
  - Print view link
- **Status Management**:
  - Server actions for status changes
  - Automatic revalidation of pages
  - CANCELLED status triggers restock (via existing inventory/stock.ts)
  - Status change emails sent (via existing mailer)
- **E2E Tests**: `tests/admin/orders.spec.ts`
  - Test 1: Create order → admin changes PENDING → PACKING → CANCELLED
  - Test 2: Filter orders by status
  - Test 3: Search orders by name/phone/ID
  - Test 4: Filter orders by date range
  - Validates restock and email flows
- **Files**:
  - `frontend/src/app/admin/orders/page.tsx` (list with date filters)
  - `frontend/src/app/admin/orders/[id]/page.tsx` (already existed from Pass 130)
  - `frontend/tests/admin/orders.spec.ts` (e2e tests)
  - `frontend/docs/OPS/STATE.md` (Pass 140 docs)
- No schema changes, uses existing API routes and email/restock infrastructure

## Pass 141 — CI Workflow (GitHub Actions + Playwright)
- **CI Workflow** (`.github/workflows/ci.yml`):
  - Already comprehensive with backend + frontend + e2e jobs
  - Added ENV variables for E2E tests:
    - `OTP_BYPASS="000000"` — bypass OTP for test authentication
    - `ADMIN_PHONES="+306900000084"` — admin test phone
    - `PRODUCER_PHONES="+306900000021,+306900000022"` — producer test phones
    - `LOW_STOCK_THRESHOLD="5"` — low stock alert threshold
    - `BASE_URL="http://127.0.0.1:3000"` — frontend URL
    - `PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"` — Playwright base URL
  - E2E job runs full stack: backend + frontend + Playwright tests
  - Artifacts uploaded: playwright-report/ and test-results/ (7-day retention)
- **Playwright Config** (`frontend/playwright.config.ts`):
  - Already configured with webServer (npm run dev)
  - Has CI-specific configuration with isCI checks
  - Multiple projects for different test types
  - Global setup for auth
- **npm Scripts** (`frontend/package.json`):
  - Already has `test:e2e: "playwright test"`
  - Has `start: "next start"` and `start:ci: "next start -p 3000"`
  - Has `build: "next build"`
  - No modifications needed
- **Files**:
  - `.github/workflows/ci.yml` (updated with ENV vars)
  - `frontend/playwright.config.ts` (no changes, verified)
  - `frontend/package.json` (no changes, verified)
  - `frontend/docs/OPS/STATE.md` (Pass 141 docs)
- No schema changes, no new dependencies, ENV configuration only

## Pass 142 — Product Images (imageUrl field + UI thumbnails)
- **Prisma Schema**: `imageUrl String?` field already exists in Product model (optional)
- **Producer Portal Forms**:
  - `/me/products/new`: Added imageUrl input field with URL validation
  - `/me/products/[id]`: Added imageUrl input field with URL validation
  - Zod schema validates URL format and transforms empty string to undefined
- **Storefront Pages** (already had imageUrl support):
  - `/products` list: Shows thumbnails for products with images (h-48 container)
  - `/products/[id]` detail: Shows hero image (h-96 container) with fallback "Χωρίς εικόνα"
  - Images use `object-cover` for proper aspect ratio handling
- **E2E Tests** (`frontend/tests/storefront/images.spec.ts`):
  - Test 1: Product with imageUrl shows hero image on detail page
  - Test 2: Product without imageUrl shows fallback text
  - Test 3: Products list shows thumbnails for products with images
  - All tests use producer authentication with OTP bypass
- **Files**:
  - `frontend/src/app/me/products/new/page.tsx` (added imageUrl field)
  - `frontend/src/app/me/products/[id]/page.tsx` (added imageUrl field)
  - `frontend/src/app/products/page.tsx` (verified imageUrl support exists)
  - `frontend/src/app/products/[id]/page.tsx` (verified imageUrl support exists)
  - `frontend/tests/storefront/images.spec.ts` (e2e tests)
  - `frontend/docs/OPS/STATE.md` (Pass 142 docs)
- No schema migration needed (field already exists), no new dependencies

## Pass 143 — Product Image Upload (local file storage)
- **Upload API** (`POST /api/upload`):
  - Accepts FormData with `file` field
  - Validates: max 5MB, image types only (png, jpg, webp, gif)
  - Saves to `public/uploads/<uuid>.<ext>`
  - Returns `{ url: "/uploads/<uuid>.<ext>" }`
  - Uses Node.js fs/promises for file operations
- **ImageUploadField Component** (`frontend/src/components/ImageUploadField.tsx`):
  - Client component with file input
  - Uploads to `/api/upload` on file select
  - Shows loading state and error messages
  - Displays image preview after upload
  - Auto-fills corresponding `imageUrl` input field in form
- **Producer Portal Integration**:
  - `/me/products/new`: Added ImageUploadField below URL input
  - `/me/products/[id]`: Added ImageUploadField below URL input
  - Both forms keep text URL input for manual entry or external URLs
  - Upload component updates hidden input programmatically
- **E2E Tests** (`frontend/tests/producer/upload.spec.ts`):
  - Test 1: Upload image → create product → verify hero image on detail page
  - Test 2: Validate file size limit (5MB check)
  - Test 3: Validate image type (reject non-images)
  - All tests use producer authentication with OTP bypass
- **Files**:
  - `frontend/src/app/api/upload/route.ts` (upload API)
  - `frontend/src/components/ImageUploadField.tsx` (upload component)
  - `frontend/src/app/me/products/new/page.tsx` (integrated upload)
  - `frontend/src/app/me/products/[id]/page.tsx` (integrated upload)
  - `frontend/public/uploads/.gitkeep` (upload directory)
  - `frontend/public/placeholder.png` (test fixture)
  - `frontend/tests/producer/upload.spec.ts` (e2e tests)
  - `frontend/docs/OPS/STATE.md` (Pass 143 docs)
- No schema changes, no new dependencies, local file storage only

## Pass 144 — Customer Emails v1 (Order Confirmation + Dev Mailbox)
- **Email Template** (`frontend/src/lib/mail/templates/orderConfirmation.ts`):
  - Greek-first subject: "Dixis — Επιβεβαίωση Παραγγελίας #<orderId>"
  - HTML email with order details: items table, total, shipping address
  - Formatted with Greek locale (currency, layout)
  - Thank you message and next steps
- **Dev Mailbox System**:
  - `frontend/src/lib/mail/devMailbox.ts`: Filesystem-based email storage
  - Saves emails to `frontend/.tmp/dev-mailbox/` with timestamps
  - Functions: put(), list(), latestFor(email)
  - Only active when `SMTP_DEV_MAILBOX=1`
- **Updated Mailer** (`frontend/src/lib/mail/mailer.ts`):
  - Integrated dev mailbox into sendMailSafe()
  - Routes emails to dev mailbox when SMTP_DEV_MAILBOX=1
  - Returns success with 'dev_mailbox' reason
  - Falls back to SMTP or no-op otherwise
- **Dev Mailbox API** (`/api/dev/mailbox`):
  - GET endpoint for retrieving emails from dev mailbox
  - Query param `?to=email` returns latest email for that address
  - Without param, returns list of last 20 emails
  - Protected: only works when SMTP_DEV_MAILBOX=1 (403 otherwise)
- **Checkout Integration**:
  - Sends confirmation email after successful order creation
  - Only if customer provides email in shipping form
  - Uses new orderConfirmation template
  - Graceful error handling (logs warning, doesn't fail checkout)
  - Fetches full order with items for email content
- **E2E Tests** (`frontend/tests/checkout/email.spec.ts`):
  - Test 1: Checkout with email → verify email in dev mailbox with order ID
  - Test 2: Checkout without email → no crash (safe no-op)
  - Both tests use producer auth and create test products
  - Dev mailbox check validates subject and content
- **Files**:
  - `frontend/src/lib/mail/templates/orderConfirmation.ts` (email template)
  - `frontend/src/lib/mail/devMailbox.ts` (dev mailbox system)
  - `frontend/src/lib/mail/mailer.ts` (updated with dev mailbox)
  - `frontend/src/app/api/dev/mailbox/route.ts` (dev API)
  - `frontend/src/app/api/checkout/route.ts` (integrated email sending)
  - `frontend/tests/checkout/email.spec.ts` (e2e tests)
  - `frontend/docs/OPS/STATE.md` (Pass 144 docs)
  - `.env.example` (SMTP_DEV_MAILBOX already documented)
- No schema changes, no new dependencies, dev-friendly testing

