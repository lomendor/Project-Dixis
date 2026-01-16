# PRD Must-Have V1 — Dixis Marketplace

**Created**: 2026-01-17
**Pass**: PRD-AUDIT-STRUCTURE-01

> Defines what MUST ship for V1 vs what's OUT OF SCOPE.

---

## V1 Must-Have (10 Items)

These are non-negotiable for V1 launch:

### 1. Product Catalog
- [x] Browse products with pagination
- [x] Full-text search (PostgreSQL FTS)
- [x] Category filtering
- [x] Product detail page with images, price, description

### 2. Shopping Cart
- [x] Add/remove products
- [x] Quantity adjustment
- [x] Persist in localStorage
- [ ] TBD: Backend sync for logged-in users

### 3. Checkout Flow
- [x] Guest checkout (no account required)
- [x] Shipping form (name, phone, email, address)
- [x] COD payment method
- [ ] BLOCKED: Card payments (needs Stripe keys)

### 4. Order Management (Consumer)
- [x] Order confirmation page
- [x] My Orders list (authenticated)
- [x] Order detail view
- [x] Order tracking (token-based)

### 5. Producer Portal
- [x] Producer dashboard with KPIs
- [x] Product CRUD (create, edit, list)
- [x] Orders list with status filters
- [x] Order status updates (pending → shipped → delivered)

### 6. Admin Panel
- [x] Orders management
- [x] Products moderation
- [x] Producers management
- [x] Users management
- [x] Categories management

### 7. Authentication
- [x] Consumer login/register
- [x] Producer login
- [x] Role-based access (consumer, producer, admin)
- [ ] BLOCKED: Email verification (needs SMTP)

### 8. i18n (Internationalization)
- [x] Greek (default)
- [x] English
- [x] Language switcher in header
- [x] Cookie-based locale persistence

### 9. Notifications
- [x] Notification bell in header
- [x] Notification dropdown (latest 5)
- [x] Notifications page (/account/notifications)
- [ ] BLOCKED: Email notifications (needs SMTP)

### 10. E2E Test Coverage
- [x] @smoke tests for all core flows
- [x] CI gate (PR blocks on test failure)
- [x] Nightly regression suite

---

## Out of Scope (V1)

These are explicitly NOT in V1:

### Payment Methods
- PayPal integration
- Apple Pay / Google Pay
- Installment payments

### Mobile
- Native iOS/Android app
- PWA service worker (manifest exists, no offline support)

### Advanced Features
- Product recommendations
- Wishlist / Favorites
- Product reviews/ratings
- Discount codes / Coupons
- Loyalty program

### Shipping
- Real-time courier tracking integration
- Multi-warehouse support
- International shipping

### Analytics
- User behavior tracking (GA, Mixpanel)
- APM / Performance monitoring
- A/B testing framework

### Messaging
- In-app chat (consumer ↔ producer)
- Admin messaging system

### Content
- Blog / Content pages
- SEO optimization tools

---

## Blocked Items (Need Credentials)

| Item | Blocker | Pass |
|------|---------|------|
| Card Payments | Stripe API keys | Pass 52 |
| Email Verification | SMTP/Resend keys | Pass 60 |
| Email Notifications | SMTP/Resend keys | Pass 60 |

---

## V1 Readiness Checklist

| Category | Status |
|----------|--------|
| Core Storefront | ✅ Ready |
| Checkout (COD) | ✅ Ready |
| Checkout (Card) | ⏳ Blocked |
| Producer Portal | ✅ Ready |
| Admin Panel | ✅ Ready |
| Auth (Basic) | ✅ Ready |
| Auth (Email Verify) | ⏳ Blocked |
| i18n | ✅ Ready |
| Notifications (UI) | ✅ Ready |
| Notifications (Email) | ⏳ Blocked |
| E2E Tests | ✅ Ready |

**V1 Launch Status**: 🟡 READY (with COD only, pending credentials for full payment/email)

---

_Lines: ~130 | Last Updated: 2026-01-17_
