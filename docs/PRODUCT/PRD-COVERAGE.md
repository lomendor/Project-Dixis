# PRD-COVERAGE — Canonical PRD→Pass Mapping

**Created**: 2026-01-18 (Pass PROC-04)
**Purpose**: Single source of truth for which Pass implemented which PRD feature

---

## Summary

| Metric | Value |
|--------|-------|
| Total PRD Features | 111 |
| ✅ DONE | 78 (70%) |
| ⚠️ PARTIAL | 23 (21%) |
| ❌ MISSING | 10 (9%) |
| **Health Score** | **91%** |

---

## Credentials Status (2026-01-18)

| System | Status | Notes |
|--------|--------|-------|
| **Stripe** | ✅ ENABLED | All keys present (secret, public, webhook) |
| **Resend** | ✅ ENABLED | Email working on production |

**Important**: Card Payments and Email features are now UNBLOCKED.

---

## PRD→Pass Mapping Table

### Authentication & Authorization

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| User Registration | ✅ DONE | (baseline) | |
| Login/Logout | ✅ DONE | (baseline) | |
| Password Reset | ✅ DONE | EMAIL-AUTH-01 | |
| Role-Based Access | ✅ DONE | (baseline) | Consumer, Producer, Admin |
| Session Management | ✅ DONE | (baseline) | Sanctum tokens |
| Profile Management | ✅ DONE | (baseline) | |
| Account Settings | ✅ DONE | (baseline) | |
| OAuth (Google) | ⚠️ PARTIAL | — | Backend ready, frontend missing |
| **Email Verification** | ❌ MISSING | — | **NOW UNBLOCKED** (Resend enabled) |
| Admin Auth Guard | ✅ DONE | ADMIN-USERS-01 | `requireAdmin()` |

### Product Catalog

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| Product Listing | ✅ DONE | (baseline) | |
| Product Details | ✅ DONE | (baseline) | |
| Categories | ✅ DONE | (baseline) | |
| Category Filtering | ✅ DONE | (baseline) | |
| Price Filtering | ✅ DONE | (baseline) | |
| Producer Filtering | ✅ DONE | (baseline) | |
| Availability Status | ✅ DONE | (baseline) | |
| Product Images | ✅ DONE | (baseline) | |
| Pagination | ✅ DONE | (baseline) | |
| **Full-Text Search** | ✅ DONE | SEARCH-FTS-01 | PostgreSQL FTS + ranking |
| Sort Options | ✅ DONE | (baseline) | |
| Product Attributes | ⚠️ PARTIAL | — | Basic attrs only |

### Producer Management

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| Producer Registration | ✅ DONE | (baseline) | |
| Producer Profile | ✅ DONE | (baseline) | |
| Producer Dashboard | ✅ DONE | PRODUCER-DASHBOARD-01 | i18n + notifications link |
| Product CRUD | ✅ DONE | (baseline) | |
| Inventory Management | ✅ DONE | (baseline) | |
| Order Management | ✅ DONE | (baseline) | |
| Sales Analytics | ✅ DONE | (baseline) | Basic stats |
| Producer Settings | ✅ DONE | (baseline) | |
| Store Customization | ✅ DONE | (baseline) | |

### Shopping Cart & Checkout

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| Add to Cart | ✅ DONE | (baseline) | |
| Cart View | ✅ DONE | (baseline) | |
| Cart Quantity | ✅ DONE | (baseline) | |
| Remove from Cart | ✅ DONE | (baseline) | |
| Cart Persistence | ⚠️ PARTIAL | — | LocalStorage only, not synced |
| Checkout Flow | ✅ DONE | EN-LANGUAGE-02 | i18n complete |
| **Guest Checkout** | ✅ DONE | GUEST-CHECKOUT-01 | |
| Shipping Address | ✅ DONE | (baseline) | |
| Order Summary | ✅ DONE | EN-LANGUAGE-02 | |
| Order Confirmation | ✅ DONE | EN-LANGUAGE-02 | i18n complete |

### Order Management

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| Order Creation | ✅ DONE | (baseline) | |
| Order History | ✅ DONE | (baseline) | |
| Order Details | ✅ DONE | (baseline) | |
| Order Status | ✅ DONE | EN-LANGUAGE-02 | i18n complete |
| Order Cancellation | ✅ DONE | (baseline) | |
| Producer Order View | ✅ DONE | EN-LANGUAGE-02 | i18n complete |
| Order Filtering | ✅ DONE | (baseline) | |
| Order Search | ✅ DONE | (baseline) | |
| Status Updates | ✅ DONE | (baseline) | |
| Reorder | ❌ MISSING | — | UX gap |
| Order Notes | ⚠️ PARTIAL | — | Basic notes only |

### Payments

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| COD (Cash on Delivery) | ✅ DONE | (baseline) | |
| **Card Payments** | ⚠️ PARTIAL | PAYMENTS-STRIPE-ELEMENTS-01 | Stripe wired, **NOW UNBLOCKED** |
| Payment Status | ⚠️ PARTIAL | — | Basic tracking |
| Refunds | ⚠️ PARTIAL | — | Manual only |
| Payment History | ⚠️ PARTIAL | — | Basic |
| PayPal/Other | ❌ MISSING | — | Not V1 |

### Shipping & Logistics

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| Shipping Zones | ✅ DONE | (baseline) | |
| Shipping Rates | ✅ DONE | (baseline) | |
| Pickup Option | ✅ DONE | (baseline) | |
| Address Validation | ✅ DONE | (baseline) | |
| Shipping Labels | ⚠️ PARTIAL | — | Service exists, no admin UI |
| Tracking Numbers | ⚠️ PARTIAL | — | Stored, not displayed |
| Courier Integration | ⚠️ PARTIAL | — | Basic |
| Delivery Estimates | ✅ DONE | (baseline) | |

### Admin Panel

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| Admin Dashboard | ✅ DONE | (baseline) | |
| **User Management** | ✅ DONE | ADMIN-USERS-01 | `/admin/users` |
| Producer Management | ✅ DONE | (baseline) | |
| Product Management | ✅ DONE | (baseline) | |
| Order Management | ✅ DONE | (baseline) | |
| Category Management | ✅ DONE | (baseline) | |
| System Settings | ✅ DONE | (baseline) | |

### Notifications & Messaging

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| **Notification Bell** | ✅ DONE | NOTIFICATIONS-01 | With unread count |
| **Notification Page** | ✅ DONE | NOTIFICATIONS-01 | `/account/notifications` |
| Mark as Read | ✅ DONE | NOTIFICATIONS-01 | Single + all |
| In-App Notifications | ✅ DONE | NOTIFICATIONS-01 | |
| Email Notifications | ❌ MISSING | — | **NOW UNBLOCKED** |
| Order Status Emails | ❌ MISSING | — | **NOW UNBLOCKED** |
| Admin Notifications | ❌ MISSING | — | **NOW UNBLOCKED** |
| Push Notifications | ⚠️ PARTIAL | — | PWA manifest exists |
| Admin Messaging | ❌ MISSING | — | |

### Platform Features (i18n, PWA, etc.)

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| Greek Language | ✅ DONE | (baseline) | Default |
| **English Language** | ✅ DONE | EN-LANGUAGE-01 | Full translations |
| **Language Switcher** | ✅ DONE | EN-LANGUAGE-01 | Header EL/EN |
| **Locale Persistence** | ✅ DONE | EN-LANGUAGE-01 | Cookie-based |
| Responsive Design | ✅ DONE | (baseline) | Mobile-first |
| SEO Basics | ✅ DONE | (baseline) | Meta tags |
| Error Pages | ✅ DONE | (baseline) | 404, 500 |
| Loading States | ✅ DONE | (baseline) | |
| PWA Support | ⚠️ PARTIAL | — | Manifest only |

### Developer Experience

| PRD Feature | Status | Implementing Pass | Notes |
|-------------|--------|-------------------|-------|
| E2E Tests | ✅ DONE | (baseline) + many passes | Playwright |
| Backend Tests | ✅ DONE | (baseline) | PHPUnit |
| CI/CD Pipeline | ✅ DONE | (baseline) | GitHub Actions |
| Health Endpoints | ✅ DONE | Pass 52, Pass 60 | `/api/health`, `/api/healthz` |
| API Documentation | ⚠️ PARTIAL | — | No OpenAPI spec |
| Centralized Logging | ❌ MISSING | — | |
| APM | ❌ MISSING | — | |
| Feature Flags | ⚠️ PARTIAL | — | Basic env vars |
| Seed Data | ✅ DONE | (baseline) | |
| Dev Setup Docs | ⚠️ PARTIAL | — | README exists |

---

## Top 5 Unblocked Execution Passes

Now that Stripe and Resend credentials are ENABLED:

| Priority | Pass ID | Feature | Effort |
|----------|---------|---------|--------|
| 1 | **EMAIL-VERIFY-01** | Email verification flow | Medium |
| 2 | **ORDER-NOTIFY-01** | Order status email notifications | Medium |
| 3 | **CARD-SMOKE-02** | Card payment E2E smoke on production | Small |
| 4 | **ADMIN-ORDERS-01** | Admin order management improvements | Medium |
| 5 | **CART-SYNC-01** | Cart persistence to backend | Medium |

---

## References

- [PRD-AUDIT.md](./PRD-AUDIT.md) — Gap analysis with health score
- [PRD-MUST-V1.md](./PRD-MUST-V1.md) — V1 must-haves and out of scope
- [CAPABILITIES.md](./CAPABILITIES.md) — Detailed feature matrix
- [AGENT-STATE.md](../AGENT-STATE.md) — Current WIP and NEXT
- [STATE.md](../OPS/STATE.md) — Operational state

---

_Generated: 2026-01-18 | Pass: PROC-04_
