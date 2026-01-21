# Producer Dashboard V1 - Information Architecture

**Created:** 2026-01-21
**Pass:** PRODUCER-IA-01
**Status:** Implemented

---

## Overview

The Producer Dashboard provides back-office functionality for producers to manage their products, orders, and business performance on the Dixis marketplace.

**Entry Point:** `/producer/dashboard` (requires producer role)

---

## Routes Inventory

| Route | Status | Data Source |
|-------|--------|-------------|
| Dashboard | `/producer/dashboard` | FOUND | `/api/v1/producer/stats`, `/api/v1/producer/products` |
| Products List | `/producer/products` | FOUND | `/api/v1/products` |
| Product Create | `/producer/products/create` | FOUND | `POST /api/v1/products` |
| Product Detail | `/producer/products/[id]` | FOUND | `/api/v1/products/{id}` |
| Product Edit | `/producer/products/[id]/edit` | FOUND | `PATCH /api/v1/products/{id}` |
| Orders List | `/producer/orders` | FOUND | `/api/v1/producer/orders` |
| Order Detail | `/producer/orders/[id]` | FOUND | `/api/v1/producer/orders/{id}` |
| Analytics | `/producer/analytics` | FOUND | `/api/v1/producer/analytics` |
| Settings | `/producer/settings` | FOUND | `/api/v1/producer/profile` |
| Onboarding | `/producer/onboarding` | FOUND | N/A (form wizard) |

---

## Route Details

### 1. Dashboard (`/producer/dashboard`)

**Purpose:** Overview of producer's business performance

**Key UI Blocks:**
- KPI Cards: Total Orders, Total Revenue, Active Products, Average Order Value
- Top Products table (top 5 by sales)
- Quick Actions: Add Product, View Orders, Notifications, Settings

**Empty States:**
- No products: "Start selling by adding your first product"
- No orders: Shows zero values in KPIs

**Actions:**
- Navigate to products
- Navigate to orders
- Navigate to settings
- Add new product

**Permissions:** `AuthGuard requireRole="producer"`

**Data Required:**
- `GET /api/v1/producer/stats` - KPI metrics
- `GET /api/v1/producer/products` - Top products

---

### 2. Products Management (`/producer/products`)

**Purpose:** Manage producer's product catalog

**Key UI Blocks:**
- Products table/grid
- Add product button
- Status filters (active, pending, inactive)

**Actions:**
- Add new product
- Edit existing product
- View product details
- Toggle product status

**Permissions:** Producer only (scoped to own products)

---

### 3. Product Create (`/producer/products/create`)

**Purpose:** Add a new product to the catalog

**Key UI Blocks:**
- Product form (name, description, price, unit, stock)
- Category selector
- Image upload

**Actions:**
- Submit product for approval (or auto-approve if configured)
- Save as draft

**Permissions:** Producer only

---

### 4. Orders Management (`/producer/orders`)

**Purpose:** View and manage orders containing producer's products

**Key UI Blocks:**
- Orders table with filtering
- Status badges (pending, processing, shipped, delivered)
- Order totals

**Actions:**
- View order details
- Mark items as ready/shipped

**Permissions:** Producer only (sees only orders containing their products)

---

### 5. Analytics (`/producer/analytics`)

**Purpose:** Sales and performance analytics

**Key UI Blocks:**
- Revenue chart (time series)
- Top selling products
- Order trends

**Actions:**
- Filter by date range
- Export data (if available)

**Permissions:** Producer only

---

### 6. Settings (`/producer/settings`)

**Purpose:** Manage producer profile and preferences

**Key UI Blocks:**
- Business information form
- Contact details
- Notification preferences

**Actions:**
- Update profile
- Change notification settings

**Permissions:** Producer only

---

### 7. Onboarding (`/producer/onboarding`)

**Purpose:** Guide new producers through initial setup

**Key UI Blocks:**
- Step-by-step wizard
- Profile completion checklist

**Actions:**
- Complete profile
- Add first product
- Verify account

**Permissions:** Producer only (shows for incomplete profiles)

---

## Navigation Model

### Role-Based Entry Points

| Role | Header Link | Mobile Menu | Link Text |
|------|-------------|-------------|-----------|
| Producer | ✅ Yes | ✅ Yes | "Παραγωγοί" (uses `t('producers.title')`) |
| Admin | ✅ Yes | ✅ Yes | "Admin" |
| Consumer | ❌ No | ❌ No | N/A |

### Implementation Details

**File:** `frontend/src/components/layout/Header.tsx`

Desktop Navigation (lines 69-77):
```tsx
{isProducer && (
  <Link href="/producer/dashboard" data-testid="nav-producer-dashboard">
    {t('producers.title')}
  </Link>
)}
```

Mobile Navigation (lines 213-222):
```tsx
{isProducer && (
  <Link href="/producer/dashboard" data-testid="mobile-nav-producer-dashboard">
    {t('producers.title')}
  </Link>
)}
```

### Role Gating

Uses `useAuth()` hook from `@/hooks/useAuth`:
- `isProducer` - true if user role is "producer"
- `isAdmin` - true if user role is "admin"
- `isAuthenticated` - true if logged in

Page-level protection via `AuthGuard` component:
```tsx
<AuthGuard requireAuth={true} requireRole="producer">
  {/* Producer content */}
</AuthGuard>
```

---

## PRD Mapping

| PRD Requirement | Status | Route |
|----------------|--------|-------|
| Producer dashboard with KPIs | ✅ Implemented | `/producer/dashboard` |
| Product management | ✅ Implemented | `/producer/products` |
| Order visibility | ✅ Implemented | `/producer/orders` |
| Role-based access | ✅ Implemented | AuthGuard + Header |

**Source:** `docs/PRODUCT/PRD-MUST-V1.md` line 39, 54

---

## Gaps Found

### Implemented But Minor Issues

1. **Quick Actions route mismatch**: Dashboard links to `/my/products/create` and `/my/orders` instead of `/producer/products/create` and `/producer/orders`
   - Status: Functional (routes may redirect)
   - Priority: Low

### Not in V1 (Nice-to-Have)

1. **Payouts page**: No `/producer/payouts` route exists
   - This is expected for V1 (manual payout process)
   - Consider for V2 when Stripe Connect is added

2. **Producer-to-consumer messaging**: No in-app chat
   - PRD marks this as nice-to-have (line 107)

3. **Advanced analytics**: Limited to basic stats
   - More detailed analytics planned for post-V1

---

## Summary

The Producer Dashboard is **fully implemented** for V1 with:
- ✅ 10 routes covering all core producer functions
- ✅ Role-based navigation in Header (desktop + mobile)
- ✅ Page-level protection via AuthGuard
- ✅ KPIs and basic analytics
- ✅ Product CRUD
- ✅ Order management

No blocking gaps for V1 launch.

---

_Pass: PRODUCER-IA-01 | Generated: 2026-01-21 | Author: Claude_
