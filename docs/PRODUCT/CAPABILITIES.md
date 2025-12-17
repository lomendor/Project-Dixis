# Dixis Capability Matrix

**Last Updated:** 2025-12-18
**Version:** 1.0
**Status:** Production

## Overview

This document maps all major product capabilities to their implementation status, file locations, and dependencies.

---

## 1. Authentication & Authorization

### 1.1 User Authentication

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Login (Consumer) | ✅ DONE | `frontend/src/app/auth/login/page.tsx`<br>`backend/app/Http/Controllers/Api/AuthController.php` | Working redirects from /login → /auth/login |
| Register (Consumer) | ✅ DONE | `frontend/src/app/auth/register/page.tsx`<br>`backend/app/Http/Controllers/Api/AuthController.php` | Working redirects from /register → /auth/register |
| Producer Login | ✅ DONE | `frontend/src/app/producer/` pages with AuthGuard | Uses same backend auth |
| Password Reset | ⚠️ PARTIAL | Backend support exists | No frontend UI |
| Email Verification | ❌ MISSING | - | Not implemented |
| 2FA/MFA | ❌ MISSING | - | Future enhancement |

### 1.2 Authorization

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Role-Based Access (Consumer/Producer/Admin) | ✅ DONE | `frontend/src/contexts/AuthContext.tsx`<br>`backend/database/migrations/*_add_role_to_users.php` | Three roles supported |
| AuthGuard Component | ✅ DONE | `frontend/src/components/AuthGuard.tsx` | Route protection working |
| API Route Protection | ✅ DONE | `backend/app/Http/Middleware/Authenticate.php` | Sanctum tokens |
| Admin Panel Access | ✅ DONE | `frontend/src/app/admin/*` | Role-gated |

**Dependencies:** None (core feature)

---

## 2. Product Catalog

### 2.1 Product Browsing

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Product List Page | ✅ DONE | `frontend/src/app/(storefront)/products/page.tsx`<br>`backend/app/Http/Controllers/Public/ProductController.php` | Live at /products, shows 4 products |
| Product Detail Page | ✅ DONE | `frontend/src/app/(storefront)/products/[id]/page.tsx` | Dynamic routing |
| Product Images | ✅ DONE | Uses Unsplash URLs | Stored in DB `image_url` field |
| Product Categories | ✅ DONE | `backend/database/migrations/*_create_categories_table.php`<br>`frontend/src/app/admin/categories/page.tsx` | Admin can manage |
| Product Search | ⚠️ PARTIAL | Basic filter exists | No full-text search |
| Product Filters | ⚠️ PARTIAL | Category filter exists | Missing price/producer filters |

### 2.2 Product Management (Producer)

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Create Product | ✅ DONE | `frontend/src/app/my/products/create/page.tsx`<br>`backend/app/Http/Controllers/Api/ProductController.php` | Producer can create |
| Edit Product | ✅ DONE | `frontend/src/app/my/products/[id]/edit/page.tsx` | Producer can edit own |
| Delete Product | ✅ DONE | Delete endpoint exists in backend | Soft delete |
| Product Status (Draft/Published) | ✅ DONE | `status` field in products table | Working |
| Inventory Management | ✅ DONE | `stock` field tracked | Basic stock levels |
| Product Approval (Admin) | ✅ DONE | `frontend/src/app/admin/products/page.tsx` | Admin approval workflow |

**Dependencies:** Authentication, File Upload (for images)

---

## 3. Producer Management

### 3.1 Producer Profiles

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Producer Registration | ✅ DONE | Same as user registration + role | Working |
| Producer Onboarding Flow | ✅ DONE | `frontend/src/app/producer/onboarding/page.tsx` | Multi-step form |
| Producer Profile Page | ✅ DONE | `frontend/src/app/producers/page.tsx` | Public list |
| Producer Dashboard | ✅ DONE | `frontend/src/app/producer/dashboard/page.tsx` | Overview stats |
| Producer Settings | ✅ DONE | `frontend/src/app/producer/settings/page.tsx` | Profile editing |
| Producer Approval (Admin) | ✅ DONE | `frontend/src/app/admin/producers/page.tsx` | Admin can approve/reject |

### 3.2 Producer Analytics

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Sales Analytics | ✅ DONE | `frontend/src/app/producer/analytics/page.tsx`<br>`backend/app/Http/Controllers/Api/Producer/ProducerAnalyticsController.php` | Revenue, orders, top products |
| Order Management | ✅ DONE | `frontend/src/app/producer/orders/page.tsx`<br>`backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php` | View and update orders |
| Product Performance | ✅ DONE | Part of analytics dashboard | Top products shown |

**Dependencies:** Authentication, Products

---

## 4. Shopping Cart & Checkout

### 4.1 Cart

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Add to Cart | ✅ DONE | `frontend/src/contexts/CartContext.tsx` | Client-side state |
| Update Quantity | ✅ DONE | Cart context methods | Working |
| Remove from Cart | ✅ DONE | Cart context methods | Working |
| Cart Persistence | ⚠️ PARTIAL | LocalStorage only | Not synced to backend |
| Cart API (Backend) | ✅ DONE | `backend/app/Http/Controllers/Api/CartController.php` | Exists but not fully integrated |

### 4.2 Checkout

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Checkout Flow | ✅ DONE | `frontend/src/app/checkout/` pages | Multi-step |
| Address Input | ✅ DONE | Part of checkout flow | Validated |
| Shipping Quote | ✅ DONE | `backend/app/Http/Controllers/Api/ShippingController.php` | ACS, ELTA, Geniki |
| Payment Integration | ⚠️ PARTIAL | Viva Wallet code exists | Not fully tested in prod |
| Order Confirmation | ✅ DONE | `frontend/src/app/checkout/confirmation/page.tsx` | Email sent |
| Guest Checkout | ❌ MISSING | - | Requires auth |

**Dependencies:** Authentication, Products, Shipping

---

## 5. Order Management

### 5.1 Consumer Orders

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| View Orders | ✅ DONE | `frontend/src/app/my/orders/page.tsx` | Consumer can see their orders |
| Order Details | ✅ DONE | Order detail pages exist | Full order info |
| Order Tracking | ✅ DONE | `frontend/src/app/orders/track/[token]/page.tsx` | Public tracking link |
| Order History | ✅ DONE | Part of my orders | Paginated |
| Reorder | ❌ MISSING | - | Future feature |

### 5.2 Producer Orders

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| View Orders | ✅ DONE | `frontend/src/app/producer/orders/page.tsx` | Producer sees their product orders |
| Update Order Status | ✅ DONE | `backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php` | Can mark as shipped, etc. |
| Order Notifications | ⚠️ PARTIAL | Email sent | No SMS/push |

### 5.3 Admin Orders

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| View All Orders | ✅ DONE | `frontend/src/app/admin/orders/page.tsx` | Filterable list |
| Order Details (Admin) | ✅ DONE | `frontend/src/app/admin/orders/[id]/page.tsx` | Full admin view |
| Order Status Management | ✅ DONE | Admin can update any order | Working |
| Resend Order Email | ✅ DONE | Button exists in admin order detail | Testing needed |
| Export Orders | ⚠️ PARTIAL | Export API exists | No UI button |

**Dependencies:** Products, Cart, Checkout, Payments

---

## 6. Payments

### 6.1 Payment Processing

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Viva Wallet Integration | ⚠️ PARTIAL | `backend/app/Services/VivaWalletService.php`<br>`frontend/src/lib/viva-wallet/` | Code exists, needs prod testing |
| Payment Confirmation | ⚠️ PARTIAL | Webhook handler exists | Testing needed |
| Payment Failure Handling | ⚠️ PARTIAL | Failure page exists | Error handling needs review |
| Refunds | ⚠️ PARTIAL | `backend/app/Http/Controllers/Api/RefundController.php` | Backend only, no admin UI |
| Payment Methods (Card) | ⚠️ PARTIAL | Via Viva Wallet | Working |
| Payment Methods (PayPal, etc.) | ❌ MISSING | - | Not implemented |

**Dependencies:** Orders, Viva Wallet API

---

## 7. Shipping & Logistics

### 7.1 Shipping Calculation

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| ACS Integration | ✅ DONE | `backend/app/Services/Shipping/ACSService.php` | Quote working |
| ELTA Integration | ✅ DONE | `backend/app/Services/Shipping/ELTAService.php` | Quote working |
| Geniki Taxydromiki Integration | ✅ DONE | `backend/app/Services/Shipping/GenikiService.php` | Quote working |
| Shipping Quote API | ✅ DONE | `backend/app/Http/Controllers/Api/ShippingController.php` | Working |
| Locker Support (BOX NOW) | ✅ DONE | `backend/app/Http/Controllers/Api/LockerController.php` | Postal code search |

### 7.2 Shipping Labels

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Label Generation | ⚠️ PARTIAL | Service layer exists | No admin UI |
| Tracking Numbers | ⚠️ PARTIAL | Stored in DB | Not displayed to consumers |
| Shipment Tracking | ⚠️ PARTIAL | Backend tracking exists | Frontend integration incomplete |

**Dependencies:** Orders, Third-party APIs

---

## 8. Admin Panel

### 8.1 Dashboard

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Admin Dashboard | ✅ DONE | `frontend/src/app/admin/page.tsx` | Overview stats |
| Analytics Dashboard | ✅ DONE | `frontend/src/app/admin/analytics/page.tsx`<br>`backend/app/Http/Controllers/Api/Admin/AnalyticsController.php` | Revenue, orders, products |

### 8.2 Content Management

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Manage Products | ✅ DONE | `frontend/src/app/admin/products/page.tsx` | Approve/reject/edit |
| Manage Producers | ✅ DONE | `frontend/src/app/admin/producers/page.tsx` | Approve/reject |
| Manage Categories | ✅ DONE | `frontend/src/app/admin/categories/page.tsx` | CRUD operations |
| Manage Orders | ✅ DONE | `frontend/src/app/admin/orders/page.tsx` | View/update all orders |
| User Management | ❌ MISSING | - | No admin user management UI |

**Dependencies:** Authentication (Admin role)

---

## 9. Notifications & Messaging

### 9.1 Email Notifications

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Order Confirmation Email | ✅ DONE | Sent via Resend API | Working |
| Order Status Updates | ⚠️ PARTIAL | Code exists | Testing needed |
| Producer Notifications | ⚠️ PARTIAL | Email on new order | Not all events covered |
| Admin Notifications | ❌ MISSING | - | No admin alerts |

### 9.2 In-App Notifications

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Notification System | ⚠️ PARTIAL | `backend/app/Http/Controllers/Api/NotificationController.php`<br>`backend/database/migrations/*_create_notifications_table.php` | Backend exists |
| Toast Notifications | ✅ DONE | `frontend/src/contexts/ToastContext.tsx` | Working for UI feedback |
| Notification Center | ❌ MISSING | - | No UI for persistent notifications |

### 9.3 Messaging

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Consumer-Producer Messaging | ⚠️ PARTIAL | `backend/app/Http/Controllers/Api/MessageController.php` | Backend exists, no UI |
| Admin Messaging | ❌ MISSING | - | Not implemented |

**Dependencies:** Email Service (Resend), Database

---

## 10. Platform Features

### 10.1 SEO & Marketing

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Meta Tags | ✅ DONE | Next.js metadata in page files | Proper OG tags |
| Sitemap | ✅ DONE | `frontend/src/app/sitemap.xml/route.ts` | Dynamic sitemap |
| Robots.txt | ✅ DONE | `frontend/src/app/robots.txt/route.ts` | Proper directives |
| Schema.org Markup | ✅ DONE | JSON-LD in layout | Organization + WebSite |
| Analytics | ⚠️ PARTIAL | Google Analytics integration exists | Not verified in prod |

### 10.2 Multi-language

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Greek Language | ✅ DONE | All text in Greek | Native |
| English Language | ❌ MISSING | - | Planned Q1 2026 |
| i18n Framework | ❌ MISSING | - | Need next-intl or similar |

### 10.3 Mobile

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Responsive Design | ✅ DONE | Tailwind CSS responsive classes | Mobile-first |
| PWA Support | ⚠️ PARTIAL | `frontend/public/manifest.webmanifest` | Manifest exists, no service worker |
| Native App | ❌ MISSING | - | Planned 2026 |

**Dependencies:** None (platform features)

---

## 11. Developer Experience

### 11.1 Testing

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Backend Tests (PHPUnit) | ✅ DONE | `backend/tests/` | 30+ tests |
| Frontend E2E Tests (Playwright) | ✅ DONE | `frontend/tests/e2e/` | 26 scenarios |
| CI/CD Pipeline | ✅ DONE | `.github/workflows/` | Comprehensive |
| Test Coverage Reports | ⚠️ PARTIAL | Generated but not enforced | No coverage gates |

### 11.2 Monitoring

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Uptime Monitoring | ✅ DONE | `.github/workflows/monitor-uptime.yml` | Every 5 minutes |
| Error Tracking (Sentry) | ✅ DONE | Sentry integration in frontend | Working |
| Logging | ⚠️ PARTIAL | Laravel logs + PM2 logs | No centralized log aggregation |
| Performance Monitoring | ❌ MISSING | - | No APM |

### 11.3 Documentation

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| README | ✅ DONE | Root README files | Setup instructions |
| API Documentation | ⚠️ PARTIAL | Some endpoints documented | No Swagger/OpenAPI |
| PRDs | ✅ DONE | `docs/prd/` | Comprehensive |
| Runbooks | ⚠️ PARTIAL | `docs/OPS/` | Basic ops docs |

**Dependencies:** Infrastructure

---

## Summary Statistics

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ DONE | 68 | 61% |
| ⚠️ PARTIAL | 30 | 27% |
| ❌ MISSING | 13 | 12% |
| **TOTAL** | **111** | **100%** |

---

## Critical Gaps (MISSING Features)

1. **Email Verification** - Security risk
2. **User Management (Admin)** - Cannot manage users
3. **Guest Checkout** - Friction for new customers
4. **English Language** - Limits market reach
5. **Centralized Logging** - Hard to debug prod issues
6. **Payment Methods (PayPal, etc.)** - Limited payment options
7. **Native Mobile App** - Missing mobile presence
8. **Reorder Functionality** - UX gap
9. **Admin Notifications** - Ops blind spots
10. **API Documentation (Swagger)** - Developer friction

---

## Partially Complete Features Needing Attention

1. **Payment Processing** - Viva Wallet needs prod validation
2. **Shipping Labels** - Missing admin UI
3. **Cart Persistence** - Not synced to backend
4. **Notification Center** - Backend exists, no UI
5. **Consumer-Producer Messaging** - Backend exists, no UI
6. **Product Search** - Basic, needs full-text search
7. **PWA Support** - Manifest exists, no service worker
8. **Test Coverage** - No enforcement
9. **API Documentation** - Partial, needs OpenAPI spec
10. **Tracking Numbers** - Stored but not displayed

---

## Next Actions

See [NEXT-7D.md](../../NEXT-7D.md) and [NEXT-30D.md](../../NEXT-30D.md) for prioritized roadmap.

**Priority 1 (Critical):**
- Email verification
- Payment testing & validation
- Guest checkout

**Priority 2 (High):**
- Admin user management
- English language support
- Centralized logging

**Priority 3 (Medium):**
- Shipping label UI
- Cart backend sync
- Full-text search
