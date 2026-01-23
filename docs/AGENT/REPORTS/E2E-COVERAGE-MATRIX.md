# E2E Test Coverage Matrix

**Created**: 2026-01-23
**Pass**: E2E-TEST-COVERAGE-AUDIT-01
**Total Specs**: 260 files (~30K lines)

---

## Quick Stats

| Category | Count | Description |
|----------|-------|-------------|
| Admin | 51 | Admin dashboard, orders, moderation |
| Cart | 20 | Cart operations, totals, sync |
| Checkout | 19 | Checkout flow, payments |
| Pass (regression) | 17 | Pass-specific regression tests |
| Customer | 15 | Customer order lookup, confirmation |
| Products | 14 | Product listing, API, mobile |
| API | 9 | Direct API endpoint tests |
| Shipping | 8 | Shipping calculations, zones |
| Auth | 7 | Authentication flows |
| Producer | 6 | Producer dashboard, orders |
| Orders | 6 | Order management, tracking |
| Smoke | 5 | Quick health checks |

---

## Coverage by Flow

### 1. Guest Flow (No Auth)

| Area | Spec Files | Prod-Safe | Tags |
|------|-----------|-----------|------|
| Homepage | `smoke/homepage.spec.ts` | ✅ | smoke |
| Products listing | `products.page.smoke.spec.ts`, `products-*.spec.ts` | ✅ | smoke |
| Product detail | `pdp-*.spec.ts`, `product-*.spec.ts` | ✅ | — |
| Cart operations | `cart-*.smoke.spec.ts`, `cart-add-checkout.smoke.spec.ts` | ✅ | smoke |
| Header nav (guest) | `header-nav.spec.ts` | ✅ | @smoke |
| Guest checkout | `guest-checkout.spec.ts`, `checkout-smoke.spec.ts` | ✅ | @smoke |

### 2. Consumer Flow (Logged-in Customer)

| Area | Spec Files | Prod-Safe | Tags |
|------|-----------|-----------|------|
| Auth login | `auth-functional-flow.spec.ts`, `auth-ux.spec.ts` | ⚠️ CI | — |
| Header nav (consumer) | `header-nav.spec.ts` | ✅ | @smoke |
| My Orders | `account-orders.spec.ts`, `orders-lookup.spec.ts` | ✅ | — |
| Order tracking | `order-track.spec.ts`, `order-status-tracking.spec.ts` | ✅ | — |
| Checkout (user) | `checkout-happy-path.spec.ts`, `checkout-mvp.spec.ts` | ⚠️ CI | — |
| Cart persistence | `cart-auth-integration.spec.ts`, `cart-sync.spec.ts` | ⚠️ CI | — |

### 3. Producer Flow

| Area | Spec Files | Prod-Safe | Tags |
|------|-----------|-----------|------|
| Dashboard access | `dashboard-visibility-smoke.spec.ts` | ✅ | @smoke |
| Producer dashboard | `producer-dashboard.spec.ts` | ✅ | @smoke |
| Producer orders | `producer-orders-management.spec.ts`, `pass-56-producer-orders.spec.ts` | ✅ | — |
| Product CRUD | `producer-product-crud.spec.ts` | ⚠️ CI | — |
| Analytics | `producer-analytics.spec.ts` | ⚠️ CI | — |

### 4. Admin Flow

| Area | Spec Files | Prod-Safe | Tags |
|------|-----------|-----------|------|
| Dashboard access | `dashboard-visibility-smoke.spec.ts` | ✅ | @smoke |
| Admin dashboard | `pass-61-admin-dashboard.spec.ts` | ✅ | — |
| Orders management | `admin-orders-*.spec.ts` (20+ files) | ⚠️ CI | — |
| Product moderation | `admin-moderation-queue.spec.ts`, `admin-product-approval.spec.ts` | ⚠️ CI | — |
| Producer approval | `admin-producer-approval.spec.ts` | ⚠️ CI | — |
| Categories | `admin-categories.spec.ts` | ⚠️ CI | — |
| Users | `admin-users.spec.ts` | ⚠️ CI | @smoke |

### 5. Payment Flow

| Area | Spec Files | Prod-Safe | Tags |
|------|-----------|-----------|------|
| COD payment | `cod-payment-method.spec.ts` | ⚠️ CI | — |
| Card payment | `card-payment-smoke.spec.ts`, `card-payment-real-auth.spec.ts` | ⚠️ CI | @smoke |
| Viva Wallet | `viva-payment-flow.spec.ts`, `viva-webhook.spec.ts` | ⚠️ CI | — |
| Payment confirmation | `checkout-payment-confirmation.spec.ts` | ⚠️ CI | — |

---

## Critical Path Coverage

### V1 Core Flows — E2E Covered

| Flow | Status | Key Specs |
|------|--------|-----------|
| Guest browse products | ✅ Covered | `products.page.smoke.spec.ts` |
| Guest add to cart | ✅ Covered | `cart-add-checkout.smoke.spec.ts` |
| Guest checkout (COD) | ✅ Covered | `guest-checkout.spec.ts` |
| User checkout (Card) | ✅ Covered | `card-payment-smoke.spec.ts` |
| Order confirmation | ✅ Covered | `confirmation-*.spec.ts` |
| Order lookup | ✅ Covered | `customer-order-lookup.spec.ts` |
| Header navigation | ✅ Covered | `header-nav.spec.ts` (25 tests) |
| Producer dashboard | ✅ Covered | `dashboard-visibility-smoke.spec.ts` |
| Admin dashboard | ✅ Covered | `dashboard-visibility-smoke.spec.ts` |

### V1 Role Entry Points — E2E Covered

| Role | Dashboard Entry | Evidence |
|------|-----------------|----------|
| Guest | N/A | `header-nav.spec.ts` |
| Consumer | `/account/orders` | `header-nav.spec.ts`, `account-orders.spec.ts` |
| Producer | `/producer/dashboard` | `header-nav.spec.ts`, `dashboard-visibility-smoke.spec.ts` |
| Admin | `/admin` | `header-nav.spec.ts`, `dashboard-visibility-smoke.spec.ts` |

---

## Gaps / Next (Not Implemented — For Future)

| Gap ID | Area | Description | Priority |
|--------|------|-------------|----------|
| GAP-01 | Mobile | No dedicated mobile checkout E2E | P2 |
| GAP-02 | i18n | Limited EN locale coverage | P3 |
| GAP-03 | Email | No E2E for email receipt content verification | P3 |
| GAP-04 | Error states | Limited checkout error handling E2E | P2 |
| GAP-05 | Auth edge cases | Session expiry mid-checkout not tested | P3 |
| GAP-06 | Multi-producer | No multi-producer cart rejection E2E | P3 |
| GAP-07 | Inventory | No stock depletion E2E | P4 |
| GAP-08 | Shipping zones | Limited zone-specific E2E | P3 |
| GAP-09 | Admin bulk actions | No bulk order update E2E | P4 |
| GAP-10 | Performance | No E2E performance regression tests | P4 |

---

## How to Run

### Run All E2E (CI mode)
```bash
cd frontend
npm run test:e2e
```

### Run Smoke Tests Only
```bash
cd frontend
npx playwright test --grep "@smoke"
```

### Run Against Production
```bash
cd frontend
CI=true BASE_URL=https://dixis.gr npx playwright test header-nav.spec.ts --reporter=line
```

### Run Specific Category
```bash
# Admin tests
npx playwright test admin-*.spec.ts

# Checkout tests
npx playwright test checkout-*.spec.ts

# Cart tests
npx playwright test cart-*.spec.ts
```

### Run with UI (debug)
```bash
npx playwright test header-nav.spec.ts --ui
```

### Generate Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## Prod-Safe vs CI-Only Legend

| Label | Meaning |
|-------|---------|
| ✅ Prod-Safe | Can run against `BASE_URL=https://dixis.gr` safely (read-only, no mutations) |
| ⚠️ CI | Requires local/CI environment (creates data, mutations) |

---

## Test Infrastructure

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Main Playwright config |
| `tests/e2e/global-setup.ci.ts` | CI global setup (mock auth) |
| `tests/e2e/fixtures/` | Test fixtures and helpers |
| `.env.test` | Test environment variables |

---

_Pass: E2E-TEST-COVERAGE-AUDIT-01 | 2026-01-23_
