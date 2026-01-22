# RUNBOOK-V1-QA: Production QA Execution Guide

**Version**: 2.0
**Last Updated**: 2026-01-22
**Pass ID**: V1-QA-RUNBOOK-AND-E2E-PLAN-01

---

## Overview

This runbook defines the 4 critical V1 flows that must pass for production readiness.

| Flow | Description | Automation Status |
|------|-------------|-------------------|
| A | Guest checkout (COD) | CI/Local E2E |
| B | Auth checkout (Card) | CI/Local E2E (test mode) |
| C | Producer: add product | CI/Local E2E |
| D | Admin: update order status | CI/Local E2E |

---

## Preconditions

### Environment Variables

```bash
# For authenticated tests
QA_EMAIL=consumer@example.com
QA_PASSWORD=password

# Production base URL
PROD_URL=https://dixis.gr
```

### Test Accounts (Seeded)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Consumer | consumer@example.com | password | For Flow B |
| Producer | producer@example.com | password | For Flow C |
| Admin | admin@example.com | password | For Flow D |

### Pre-flight Checks

```bash
# Run before any QA execution
./scripts/prod-facts.sh
./scripts/prod-qa-v1.sh

# Expected: ALL PASS (6/6)
```

---

## Flow A: Guest Checkout (COD)

**Goal**: Verify anonymous users can complete order with cash-on-delivery.

### Manual Steps

1. Open https://dixis.gr/products
2. Add any product to cart
3. Proceed to checkout
4. Fill shipping details:
   - Name: QA Guest
   - Email: qa-guest@test.dixis.gr
   - Address: QA Street 1, Athens 10000
   - Phone: 6900000000
5. Select "Αντικαταβολή (COD)"
6. Submit order

### Expected Results

- [ ] Order created with status `pending`
- [ ] Order number format: `ORD-XXXXXX`
- [ ] Payment method: `COD`
- [ ] Confirmation page shown

### Evidence Capture

```
Order #XX | ORD-0000XX | pending | COD | €XX.XX
```

### E2E Coverage

| Test File | Coverage |
|-----------|----------|
| `cart-checkout-m0.spec.ts` | Cart → checkout flow |
| `checkout/atomic.spec.ts` | Atomic checkout validation |
| `storefront/checkout.spec.ts` | Full checkout UI flow |

---

## Flow B: Auth User Checkout (Card Payment)

**Goal**: Verify logged-in users can complete card payment.

### Safety Note

**Production**: Use Stripe test cards only. Real charges not tested.
**CI/Local**: Uses test mode with seeded data.

### Manual Steps

1. Login at https://dixis.gr/auth/login
2. Add product to cart
3. Proceed to checkout
4. Select "Πληρωμή με Κάρτα"
5. Use test card: `4242 4242 4242 4242`
6. Complete payment

### Expected Results

- [ ] Payment Intent created (pi_xxx...)
- [ ] Order status: `pending_payment` → `paid`
- [ ] Stripe webhook received

### Evidence Capture

```
Order #XX | pi_XXXXXXX | paid | €XX.XX
```

### E2E Coverage

| Test File | Coverage |
|-----------|----------|
| `auth-cart-flow.spec.ts` | Authenticated cart |
| `cart-auth-integration.spec.ts` | Auth + cart sync |
| `checkout/atomic.spec.ts` | Payment flow (mocked) |

### Constraint

Full Stripe integration testing requires:
- Test mode API keys
- Webhook endpoint verification
- Not suitable for production E2E (creates real payment intents)

**Alternative Proof**: API smoke test via `scripts/prod-qa-v1.sh` verifies endpoints respond correctly.

---

## Flow C: Producer Add Product

**Goal**: Verify producers can add products that become publicly visible.

### Manual Steps

1. Login as producer@example.com
2. Navigate to /producer/products
3. Click "Add Product"
4. Fill product details:
   - Name: QA Test Product
   - Price: 10.00
   - Description: Test
   - Category: (any)
5. Save product

### Expected Results

- [ ] Product created with unique ID
- [ ] Status: `available`
- [ ] Visible in public products API

### Evidence Capture

```
Product #XX | "QA Test Product" | €10.00 | available
```

### E2E Coverage

| Test File | Coverage |
|-----------|----------|
| `producer-product-crud.spec.ts` | Full CRUD operations |
| `producer-dashboard.spec.ts` | Dashboard access |
| `admin-product-approval.spec.ts` | Approval workflow |

### Rollback

```bash
# Delete test product via API
curl -X DELETE "https://dixis.gr/api/v1/products/{id}" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Flow D: Admin Update Order Status

**Goal**: Verify admins can update order status.

### Manual Steps

1. Login as admin@example.com
2. Navigate to /admin/orders
3. Select an order (e.g., from Flow A)
4. Change status: `pending` → `processing`
5. Save

### Expected Results

- [ ] Status updated successfully
- [ ] `updated_at` timestamp changes
- [ ] Email notification triggered (code path verified)

### Evidence Capture

```
Order #XX | pending → processing | 2026-01-22T14:XX:XXZ
```

### E2E Coverage

| Test File | Coverage |
|-----------|----------|
| `admin/dashboard.spec.ts` | Admin access |
| `admin-order-detail.spec.ts` | Order detail view |
| `pass-58-producer-order-status.spec.ts` | Status transitions |
| `admin/order-quick-actions.spec.ts` | Quick status updates |

---

## Post-QA Checklist

After completing all flows:

- [ ] All 4 flows PASS
- [ ] Evidence recorded (order IDs, product IDs, timestamps)
- [ ] No 500 errors in logs
- [ ] Working tree clean after scripts

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Re-login, check token |
| 500 Error | Check backend logs |
| Stripe fails | Use test card 4242... |
| Product not visible | Check status = available |

### Debug Commands

```bash
# Backend health
curl https://dixis.gr/api/healthz

# Products API
curl https://dixis.gr/api/v1/public/products | jq '.data | length'

# Full QA script
./scripts/prod-qa-v1.sh
```

---

## Related Documents

| Document | Path |
|----------|------|
| Detailed Runbook | `docs/PRODUCT/QA-V1-RUNBOOK.md` |
| E2E Automation Plan | `docs/OPS/E2E-V1-AUTOMATION-PLAN.md` |
| Prod QA Script | `scripts/prod-qa-v1.sh` |
| Prod Facts Script | `scripts/prod-facts.sh` |

---

_RUNBOOK-V1-QA v2.0 | 2026-01-22_
