# DUAL-DB Research — February 2026

## Executive Summary

The Dixis platform operates with **two completely separate PostgreSQL databases** that store products and producers independently. The **storefront** reads from Prisma/Neon DB, while the **producer dashboard** reads from Laravel/local DB. **Products created by producers never appear on the storefront** because they live in different databases with no sync mechanism.

**Recommendation**: Make **Laravel the single source of truth** (SSOT) for products, producers, and orders. The storefront should read from Laravel's public API instead of Prisma.

---

## Architecture: Two Separate Worlds

### Database A: Prisma (Neon PostgreSQL)

| Aspect | Details |
|--------|---------|
| **Host** | Neon cloud (connection string in `.env`) |
| **Used by** | Storefront pages (SSR), Next.js API routes, Admin panel |
| **Products** | 10 Greek products (seed data) |
| **Producers** | 2 producers: Malis Garden, Lemnos Honey Co |
| **Categories** | 13 Greek categories with emojis |
| **IDs** | CUIDs (e.g., `cmidw9n4e000ljv0b7b86iec2`) |
| **Orders** | Has Order/OrderItem models (legacy, being replaced) |
| **Auth** | AdminUser table (phone+OTP for admin panel) |

### Database B: Laravel (Local VPS PostgreSQL)

| Aspect | Details |
|--------|---------|
| **Host** | Local VPS (`127.0.0.1:5432`) |
| **Used by** | Producer dashboard, checkout/orders, auth (login/register) |
| **Products** | 7 English + 6 Greek products (seed data) |
| **Producers** | 3 producers: Green Farm Co., Cretan Honey, Mt. Olympus Dairy |
| **Categories** | 8 English categories (pivot table `product_category`) |
| **IDs** | Auto-increment integers |
| **Orders** | Full order system (Order, OrderItem, CheckoutSession, OrderShippingLine) |
| **Auth** | User table (email+password via Sanctum) |

### The Gap

```
Producer creates product → saved in Laravel DB
                              ↓
Customer visits /products → reads from Prisma DB → product NOT FOUND
```

---

## How Data Flows Today

### Storefront Product List (`/products`)

```
Browser GET /products
  → Next.js SSR (getServerApiUrl() = http://127.0.0.1:3000/api)
    → Next.js API route: /api/public/products/route.ts
      → prisma.product.findMany({ where: { isActive: true } })
        → Prisma/Neon DB → 10 Greek products
```

### Storefront Product Detail (`/products/[id]`)

```
Browser GET /products/cmidw9...
  → Next.js SSR (getServerApiUrl() = http://127.0.0.1:3000/api)
    → Next.js API route: /api/public/products/[id]/route.ts
      → prisma.product.findFirst({ where: { OR: [{id}, {slug}] } })
        → Prisma/Neon DB → single product
```

### Producer Dashboard (`/my/products`)

```
Browser GET /my/products
  → AuthGuard → apiClient.getProducerMe() → Laravel /api/v1/producer/me
  → apiClient.getProducerProducts() → Laravel /api/v1/producer/products
    → Laravel DB → 3 products (Green Farm Co.)
```

### Checkout/Orders

```
Browser POST /checkout
  → apiClient.createOrder() → Laravel POST /api/v1/public/orders
    → OrderController@store → Laravel DB
    → OrderItem.product_id → FK to Laravel Product table
```

### Producers List Page (`/producers`)

```
Browser GET /producers
  → Next.js SSR → fetch(getServerApiUrl() + '/producers')
    → Next.js API route → prisma.producer.findMany()
      → Prisma/Neon DB → 2 Greek producers
```

---

## nginx Routing Rules (Production)

```nginx
# Exact match → Next.js (Prisma)
location = /api/v1/public/products { proxy_pass http://127.0.0.1:3000/api/public/products; }

# Prefix matches → Next.js (Prisma)
location ^~ /api/public/     { proxy_pass http://127.0.0.1:3000; }
location ^~ /api/auth/       { proxy_pass http://127.0.0.1:3000; }
location ^~ /api/me/         { proxy_pass http://127.0.0.1:3000; }
location ^~ /api/producer/   { proxy_pass http://127.0.0.1:3000; }
location ^~ /api/admin/      { proxy_pass http://127.0.0.1:3000; }

# General catch-all → Laravel
location /api { ... fastcgi_pass php-fpm; }
```

**Critical issue**: The exact match `= /api/v1/public/products` sends the product list to Next.js/Prisma instead of Laravel. Meanwhile, Laravel has a perfectly good `GET /api/v1/public/products` endpoint (PublicProductController) that's being shadowed.

---

## Data Model Comparison

### Products

| Field | Prisma | Laravel | Notes |
|-------|--------|---------|-------|
| ID | CUID string | Auto-increment int | **Incompatible** |
| Name | `title` | `name` | Different field name |
| Slug | `slug` | `slug` | Same |
| Price | Decimal | `decimal:2` | Same concept |
| Unit | `unit` | `unit` | Same |
| Stock | `stock` (Int?) | `stock` (Int) | Same |
| Description | `description` | `description` | Same |
| Image | `imageUrl` | `image_url` | snake vs camel |
| Active | `isActive` | `is_active` | snake vs camel |
| Category | `category` (string) | pivot `product_category` | **Different approach** |
| Organic | - | `is_organic` | **Laravel only** |
| Seasonal | - | `is_seasonal` | **Laravel only** |
| Discount | - | `discount_price` | **Laravel only** |
| Weight | - | `weight_per_unit` | **Laravel only** |
| Approval | `approvalStatus` | `approval_status` | Both have it |
| Producer FK | `producerId` (CUID) | `producer_id` (int) | Different ID types |

### Producers

| Field | Prisma | Laravel | Notes |
|-------|--------|---------|-------|
| ID | CUID string | Auto-increment int | **Incompatible** |
| Name | `name` | `name` | Same |
| Slug | `slug` | `slug` | Same |
| Region | `region` | `location` | Different field name |
| Description | `description` | `description` | Same |
| Image | `imageUrl` | (via User?) | Different |
| Active | `isActive` | `is_active` | snake vs camel |
| Phone | `phone` | `phone` | Same |
| Email | `email` | `email` | Same |
| Tax ID | - | `tax_id`, `tax_office` | **Laravel only** |
| Business | - | `business_name` | **Laravel only** |
| Geo | - | `latitude`, `longitude` | **Laravel only** |
| Shipping | - | `uses_custom_shipping_rates`, `free_shipping_threshold_eur` | **Laravel only** |
| User FK | - | `user_id` (FK to User) | **Laravel only** |

### Categories

| Prisma (13 categories) | Laravel (8 categories) |
|------------------------|----------------------|
| olive-oil-olives: Ελαιολαδο & Ελιες | olive-oil-olives: Olive Oil & Olives |
| honey-bee: Μελι & Κυψελη | honey-preserves: Honey & Preserves |
| legumes: Οσπρια | - |
| grains-rice: Δημητριακα & Ρυζια | grains-cereals: Grains & Cereals |
| pasta: Ζυμαρικα | - |
| flours-bakery: Αλευρια & Αρτοποιια | - |
| nuts-dried: Ξηροι Καρποι | - |
| herbs-spices: Βοτανα & Μπαχαρικα | herbs-spices: Herbs & Spices |
| sweets-spreads: Γλυκα & Μαρμελαδες | - |
| sauces-preserves: Σαλτσες & Τουρσια | - |
| beverages: Ποτα & Αποσταγματα | wine-beverages: Wine & Beverages |
| dairy: Γαλακτοκομικα | dairy-products: Dairy Products |
| fruits-vegetables: Φρουτα & Λαχανικα | fruits: Fruits + vegetables: Vegetables |

---

## Orders: Already on Laravel

Orders are **fully managed by Laravel** as of recent passes:

- `Order`, `OrderItem`, `CheckoutSession`, `OrderShippingLine` — all Laravel models
- `OrderItem.product_id` → FK to Laravel `Product.id`
- Denormalized: `product_name`, `unit_price`, `product_unit` snapshots
- Checkout flow: `apiClient.createOrder()` → Laravel `POST /api/v1/public/orders`
- Multi-producer support via `CheckoutSession` grouping
- Stock decrement happens in Laravel transaction

**Prisma still has Order/OrderItem models** but they're legacy — the frontend checkout already calls Laravel.

---

## Recommendation: Laravel as SSOT

### Why Laravel

1. **Auth lives there**: User registration, login, password reset, Sanctum tokens
2. **Producer management**: Producer profiles, product CRUD, approval workflow
3. **Orders already there**: Full checkout with multi-producer support, stock management
4. **Richer data model**: `is_organic`, `is_seasonal`, `discount_price`, `weight_per_unit`, product images, category pivot table, producer geo/tax/shipping fields
5. **Public API exists**: `PublicProductController` with search, filtering, pagination, caching headers — currently shadowed by nginx
6. **Checkout references Laravel products**: `OrderItem.product_id` is FK to Laravel products — if storefront shows Prisma products, checkout would reference wrong IDs

### Why NOT Prisma

1. **No auth**: No User model, no login system
2. **Seed data only**: 10 hardcoded Greek products, never updated by users
3. **No product CRUD**: No API for producers to create/edit products
4. **Simpler model**: Missing organic, seasonal, discount, weight, images, etc.
5. **Orders migrating away**: Checkout already calls Laravel
6. **ID mismatch**: CUID IDs incompatible with Laravel integer FKs

---

## Implementation Plan

### Phase 1: Switch Storefront to Laravel Public API (PR ~200 LOC)

**Goal**: Make `/products` and `/products/[id]` read from Laravel instead of Prisma.

**Option A — nginx route fix (simplest)**:
Remove the exact match rule that sends `/api/v1/public/products` to Next.js. Let it fall through to Laravel's catch-all `/api` → PHP-FPM. The Laravel `PublicProductController` already handles this endpoint.

```nginx
# REMOVE this line:
location = /api/v1/public/products { proxy_pass http://127.0.0.1:3000/api/public/products; }

# The general /api catch-all will send it to Laravel automatically
```

**Option B — Change SSR fetch URL**:
Make `getServerApiUrl()` return the Laravel URL for public product endpoints. This requires updating `env.ts` or the storefront pages.

**Preferred: Option A** — single nginx config change, zero code changes.

**But also needed**: Update the storefront product pages to handle Laravel's response format (snake_case, different field names, different ID type).

**Changes needed in storefront pages**:
1. `/products` list page — update response mapping (`name` vs `title`, integer IDs, `is_active` vs `isActive`)
2. `/products/[id]` detail page — same field mapping + handle integer IDs in URLs
3. `/producers` list page — update response mapping
4. `/producers/[slug]` detail page — same

### Phase 2: Sync Categories (PR ~100 LOC)

Align Laravel categories with the 13 Greek categories from Prisma:
- Add missing categories to Laravel seeder (legumes, pasta, flours-bakery, nuts-dried, sweets-spreads, sauces-preserves)
- Add Greek names to Laravel categories
- The frontend `/api/categories` route (used by create/edit product forms) should read from Laravel instead of Prisma

### Phase 3: Migrate Seed Data (PR ~80 LOC)

- Add the 10 Greek products to Laravel's seeder (or create them via producer dashboard)
- Create matching producers in Laravel for Malis Garden and Lemnos Honey Co
- This ensures existing storefront content still appears after the switch

### Phase 4: Clean Up Prisma Product/Producer Models (future)

- Mark Prisma Product/Producer models as deprecated
- Remove Next.js API routes that duplicate Laravel functionality
- Keep Prisma for: AdminUser, AdminAuditLog, Category (if still needed), RateLimit, Event, Notification

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Storefront breaks during switch | High | Test on staging, keep Prisma routes as fallback |
| SEO: URLs change (CUID → int/slug) | Medium | Use slugs in URLs (both systems support slugs) |
| Category mismatch | Low | Align categories in Phase 2 before switching |
| Existing Prisma orders reference Prisma product IDs | Low | Orders already moving to Laravel; Prisma orders are legacy |
| Cart references break | Medium | Cart uses localStorage with product data; needs client-side update |

---

## Files Reference

### Storefront (reads from Prisma — needs to switch to Laravel)

| File | What it does |
|------|-------------|
| `frontend/src/app/(storefront)/products/page.tsx` | Product list (SSR) |
| `frontend/src/app/(storefront)/products/[id]/page.tsx` | Product detail (SSR) |
| `frontend/src/app/(storefront)/producers/page.tsx` | Producer list (SSR) |
| `frontend/src/app/(storefront)/producers/[slug]/page.tsx` | Producer detail (SSR) |
| `frontend/src/app/api/public/products/route.ts` | Next.js API → Prisma (to deprecate) |
| `frontend/src/app/api/public/products/[id]/route.ts` | Next.js API → Prisma (to deprecate) |

### Producer Dashboard (already uses Laravel — working)

| File | Status |
|------|--------|
| `frontend/src/app/my/products/page.tsx` | Fixed (AUTH-UNIFY-01) |
| `frontend/src/app/my/products/create/page.tsx` | Fixed (AUTH-UNIFY-02) |
| `frontend/src/app/my/products/[id]/edit/page.tsx` | Fixed (AUTH-UNIFY-02) |
| `frontend/src/lib/api.ts` | apiClient methods added |

### Laravel API (already exists — needs nginx unblocking)

| Endpoint | Controller | Purpose |
|----------|-----------|---------|
| `GET /api/v1/public/products` | PublicProductController@index | Product list with search/filter |
| `GET /api/v1/public/products/{id}` | PublicProductController@show | Product detail |
| `GET /api/v1/public/producers` | PublicProducerController@index | Producer list |
| `GET /api/v1/public/producers/{id}` | PublicProducerController@show | Producer detail |

### nginx Config

| File | Location |
|------|----------|
| `/etc/nginx/sites-enabled/dixis.gr` | Production VPS |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-11 | Laravel = SSOT for products/producers/orders | Auth, CRUD, orders all on Laravel; Prisma is seed-data-only |
| 2026-02-11 | Phase 1: nginx fix + storefront field mapping | Lowest risk, zero backend changes |
| 2026-02-11 | Keep Prisma for admin/audit/notifications | These features work and have no Laravel equivalent |
| 2026-02-11 | Phase 2: Category slug mapping (PR #2727) | Laravel English slugs → Prisma Greek slugs for CategoryStrip filtering |
| 2026-02-11 | Phase 3: Greek seed data (PR #2728) | 10 Greek products + 2 producers + 6 new categories seeded into Laravel |
| 2026-02-11 | Phase 4: Cleanup (PR #2729) | Deprecated old Prisma product routes, removed dead seed script, fixed PrismaClient leak |

---

## Phase 4 Audit: Remaining Prisma Usage

Prisma **cannot be fully removed** — it's still required for:

| Area | Models Used | Why |
|------|------------|-----|
| Admin Product CRUD | Product, Producer | Admin panel reads/writes products in Prisma for approval workflow |
| Order Processing | Product, Order, OrderItem | Checkout looks up products in Prisma to calculate totals |
| Shipping Calculation | Product | Weight-based shipping needs Prisma product data |
| Auth & Audit | AdminUser, AdminAuditLog, Producer | Phone-based admin auth, audit trail |
| Rate Limiting | RateLimit | OTP rate limiting |
| Notifications | Notification, Event | SMS/email queue |
| Categories | Category | `/api/categories` still reads from Prisma (13 Greek categories) |
| E2E Tests | Product, Producer | 20+ E2E tests query `/api/products` (Prisma/SQLite in CI) |

**What was cleaned up:**
- `/api/products/route.ts` — Fixed PrismaClient leak (was `new PrismaClient()`), added @deprecated
- `/api/products/[id]/route.ts` — Added @deprecated comment
- `scripts/seed/products.ts` — Removed (dead code, replaced by `prisma/seed.ts`)
- `package.json` — Removed dead `seed:products` script

**Future cleanup (not in Phase 4):**
- Move admin product CRUD to Laravel (eliminates Prisma Product model dependency)
- Move order product lookups to Laravel API (eliminates shipping/checkout Prisma dependency)
- Then Product/Producer models can be removed from Prisma schema
