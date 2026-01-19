# Admin Dashboard V1 — Information Architecture

**Created**: 2026-01-19
**Pass**: ADMIN-IA-01
**Commit**: `5c4b29b8`

> Comprehensive map of Admin Dashboard capabilities: what exists, what's missing, and V1 acceptance criteria.

---

## Overview

The Admin Dashboard provides back-office functionality for platform operators to manage orders, products, producers, users, and system settings.

**Entry Point**: `/admin` (requires admin role)

---

## Admin Pages Inventory

| Page | Route | Status | Backend API |
|------|-------|--------|-------------|
| Dashboard | `/admin` | FOUND | Direct Prisma |
| Orders | `/admin/orders` | FOUND | `/api/v1/admin/orders` |
| Order Detail | `/admin/orders/[id]` | FOUND | `/api/v1/admin/orders` |
| Products | `/admin/products` | FOUND | `/api/v1/products` |
| Product Moderation | `/admin/products/moderation` | FOUND | `/api/v1/admin/products/pending` |
| Producers | `/admin/producers` | FOUND | `/api/v1/producers` |
| Producer Images | `/admin/producers/images` | FOUND | Direct Prisma |
| Users | `/admin/users` | FOUND | Direct Prisma |
| Categories | `/admin/categories` | FOUND | Client-side |
| Analytics | `/admin/analytics` | FOUND | `/api/v1/admin/analytics/*` |
| Settings | `/admin/settings` | FOUND | Read-only env |
| Shipping Test | `/admin/shipping-test` | FOUND | `/api/v1/admin/shipping/*` |

---

## Section Breakdown

### 1. Dashboard (`/admin`)

**Status**: FOUND

**Current Capabilities**:
- KPI cards: Orders (7d), Revenue (7d), Pending count, Low stock count
- Recent orders table (last 10)
- Top products table (30d)

**Key Actions**:
- View dashboard metrics
- Quick links to orders

**Missing for V1**:
- None (meets PRD requirements)

**V1 Acceptance Criteria**:
- [x] Dashboard loads with KPIs
- [x] Orders (7d) count displayed
- [x] Revenue (7d) amount displayed
- [x] Pending orders count
- [x] Low stock alert count

---

### 2. Orders Management (`/admin/orders`)

**Status**: FOUND

**Current Capabilities**:
- Orders list with pagination
- Status filtering (via `DemoOrdersView` component)
- Order detail view (`/admin/orders/[id]`)
- Status update actions (Quick Actions component)
- Copy tracking link functionality

**Backend Routes**:
- `GET /api/v1/admin/orders` - List orders (Pass 61)
- `PATCH /api/v1/admin/orders/{order}/status` - Update status (Pass 25)

**Key Actions**:
- List all orders
- Filter by status
- View order details
- Update order status (pending → processing → shipped → delivered)
- Copy tracking link

**Missing for V1**:
- None

**V1 Acceptance Criteria**:
- [x] List all orders with pagination
- [x] Filter by status
- [x] View order details
- [x] Update order status
- [x] Email notification on status change (Pass 62)

---

### 3. Products Management (`/admin/products`)

**Status**: FOUND

**Current Capabilities**:
- Products list with status badges
- Product activation toggle
- Product moderation page (`/admin/products/moderation`)

**Backend Routes**:
- `GET /api/v1/admin/products/pending` - List pending products
- `PATCH /api/v1/admin/products/{product}/moderate` - Approve/reject

**Key Actions**:
- List all products
- Toggle product active status
- Moderate pending products (approve/reject)
- View rejection reason

**Missing for V1**:
- None

**V1 Acceptance Criteria**:
- [x] List all products
- [x] Toggle active status
- [x] Approve pending products
- [x] Reject with reason

---

### 4. Producers Management (`/admin/producers`)

**Status**: FOUND

**Current Capabilities**:
- Producers list with status badges
- Producer approval/rejection
- Producer images management page

**Key Actions**:
- List all producers
- Approve/reject producer applications
- Manage producer images

**Missing for V1**:
- Producer edit form (currently read-only)

**V1 Acceptance Criteria**:
- [x] List all producers
- [x] View producer details
- [x] Approve/reject producers
- [ ] Edit producer info (nice-to-have)

---

### 5. Users Management (`/admin/users`)

**Status**: FOUND

**Current Capabilities**:
- Admin users list (from `adminUser` table)
- Display: phone, role, status, created date

**Key Actions**:
- View admin users

**Missing for V1**:
- Consumer/Producer users list (currently shows AdminUser only)
- User activation/deactivation toggle
- User role management

**V1 Acceptance Criteria**:
- [x] List admin users
- [ ] List all users (consumers + producers)
- [ ] Toggle user active status
- [ ] Assign/change user roles

---

### 6. Categories Management (`/admin/categories`)

**Status**: FOUND

**Current Capabilities**:
- Categories list with CRUD
- Greek/English names
- Icon selection
- Sort order management
- Active/inactive toggle

**Key Actions**:
- Create category
- Edit category
- Delete category
- Reorder categories
- Toggle active status

**Missing for V1**:
- None

**V1 Acceptance Criteria**:
- [x] List categories
- [x] Create category
- [x] Edit category
- [x] Delete category
- [x] Toggle active status

---

### 7. Analytics (`/admin/analytics`)

**Status**: FOUND

**Current Capabilities**:
- Analytics dashboard (via `AnalyticsContent` component)

**Backend Routes**:
- `GET /api/v1/admin/analytics/sales`
- `GET /api/v1/admin/analytics/orders`
- `GET /api/v1/admin/analytics/products`
- `GET /api/v1/admin/analytics/producers`
- `GET /api/v1/admin/analytics/dashboard`

**Key Actions**:
- View sales analytics
- View order analytics
- View product analytics
- View producer analytics

**Missing for V1**:
- Date range filtering (nice-to-have)
- Export functionality (nice-to-have)

**V1 Acceptance Criteria**:
- [x] Sales overview
- [x] Orders overview
- [x] Products overview
- [x] Producers overview

---

### 8. Settings (`/admin/settings`)

**Status**: FOUND

**Current Capabilities**:
- Environment configuration display (read-only)
  - NODE_ENV
  - LOW_STOCK_THRESHOLD
  - API_BASE_URL

**Key Actions**:
- View environment settings

**Missing for V1**:
- Editable settings (nice-to-have)
- Feature flags management (nice-to-have)

**V1 Acceptance Criteria**:
- [x] Display environment info
- [ ] Editable settings (post-V1)

---

### 9. Shipping (`/admin/shipping-test`)

**Status**: FOUND

**Current Capabilities**:
- Shipping rates display
- Zone information
- Quote simulation

**Backend Routes**:
- `GET /api/v1/admin/shipping/rates`
- `GET /api/v1/admin/shipping/zones`
- `GET /api/v1/admin/shipping/simulate`

**Key Actions**:
- View shipping rates
- View zone configuration
- Simulate shipping quote

**Missing for V1**:
- Rate editing (post-V1)

**V1 Acceptance Criteria**:
- [x] View shipping rates
- [x] View zones
- [x] Simulate quotes

---

## PRD Cross-Reference

From `docs/PRODUCT/PRD-MUST-V1.md` Section 6 (Admin Panel):

| PRD Requirement | Status | Location |
|-----------------|--------|----------|
| Orders management | FOUND | `/admin/orders` |
| Products moderation | FOUND | `/admin/products/moderation` |
| Producers management | FOUND | `/admin/producers` |
| Users management | PARTIAL | `/admin/users` (admin only) |
| Categories management | FOUND | `/admin/categories` |

---

## V1 Readiness Summary

| Section | Status | Gap |
|---------|--------|-----|
| Dashboard | ✅ Ready | None |
| Orders | ✅ Ready | None |
| Products | ✅ Ready | None |
| Producers | ✅ Ready | None |
| Users | ⚠️ Partial | Only shows AdminUser, not all users |
| Categories | ✅ Ready | None |
| Analytics | ✅ Ready | None |
| Settings | ✅ Ready | Read-only OK for V1 |
| Shipping | ✅ Ready | None |

**Overall**: 8/9 sections ready, 1 partial (Users needs expansion post-V1)

---

## Recommended V1 Actions

### Must Fix (Before Launch)
- None identified

### Nice to Have (Post-V1)
1. **Users Page Enhancement**: Show all users (consumers + producers), not just AdminUser
2. **Producer Edit Form**: Allow editing producer details
3. **Settings Editability**: Make LOW_STOCK_THRESHOLD editable
4. **Date Range Filters**: Add to Analytics page
5. **Export Functionality**: CSV export for orders/analytics

---

## Backend API Coverage

| Admin Section | Backend Endpoints | Status |
|---------------|-------------------|--------|
| Orders | `GET /admin/orders`, `PATCH /admin/orders/{id}/status` | FOUND |
| Products | `GET /admin/products/pending`, `PATCH /admin/products/{id}/moderate` | FOUND |
| Analytics | `GET /admin/analytics/*` (5 endpoints) | FOUND |
| Shipping | `GET /admin/shipping/*` (3 endpoints) | FOUND |
| Users | None (uses Prisma directly) | PARTIAL |
| Categories | None (client-side) | OK |

---

_Lines: ~250 | Pass: ADMIN-IA-01 | Generated: 2026-01-19_
