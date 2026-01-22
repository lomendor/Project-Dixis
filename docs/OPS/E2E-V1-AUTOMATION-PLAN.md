# E2E V1 Automation Plan

**Created**: 2026-01-22
**Pass ID**: V1-QA-RUNBOOK-AND-E2E-PLAN-01

---

## Executive Summary

Existing E2E test coverage is **extensive** (355 test files). This document maps existing tests to V1 flows and identifies minimal gaps.

---

## Existing Test Inventory

### Test Directories

| Directory | Files | Purpose |
|-----------|-------|---------|
| `e2e/` | 252 | Main E2E tests |
| `storefront/` | 13 | Customer-facing pages |
| `checkout/` | 6 | Checkout-specific |
| `admin/` | 14 | Admin dashboard |
| `smoke/` | 3 | Quick smoke tests |
| `security/` | 3 | Security scoping |

### V1 Flow Coverage Matrix

| Flow | Existing Tests | Coverage |
|------|----------------|----------|
| **A: Guest COD** | `cart-checkout-m0.spec.ts`, `storefront/checkout.spec.ts`, `checkout/atomic.spec.ts` | **COMPLETE** |
| **B: Auth Card** | `auth-cart-flow.spec.ts`, `cart-auth-integration.spec.ts` | **PARTIAL** (Stripe mocked) |
| **C: Producer** | `producer-product-crud.spec.ts`, `producer-dashboard.spec.ts` | **COMPLETE** |
| **D: Admin** | `admin/dashboard.spec.ts`, `admin-order-detail.spec.ts`, `pass-58-producer-order-status.spec.ts` | **COMPLETE** |

---

## Gap Analysis

### Flow A: Guest Checkout (COD) - NO GAPS

Existing tests cover:
- Cart add/remove
- Checkout form validation
- COD payment selection
- Order confirmation

### Flow B: Auth Card Payment - STRIPE MOCKED

**Gap**: Real Stripe integration not tested in E2E.

**Reason**: E2E tests use mocked payment responses to avoid:
- Creating real payment intents
- Requiring Stripe test mode webhooks
- Flaky network-dependent tests

**Mitigation**:
1. `scripts/prod-qa-v1.sh` verifies payment endpoints respond
2. Manual Stripe dashboard verification for production
3. Stripe webhook logs confirm integration works

**Recommendation**: Keep Stripe mocked in CI. Use manual verification for production card payments.

### Flow C: Producer Product - NO GAPS

Existing tests cover:
- Producer login
- Product CRUD operations
- Visibility verification
- Admin approval flow

### Flow D: Admin Order Status - NO GAPS

Existing tests cover:
- Admin dashboard access
- Order list/detail views
- Status transitions
- Quick actions

---

## Recommended Actions

### Immediate (This Pass)

1. **No new E2E tests required** - Coverage is sufficient
2. **Document existing test mapping** - Done in this plan
3. **Create runbook** - Done in `RUNBOOK-V1-QA.md`

### Future (Post-V1)

| Priority | Action | Effort |
|----------|--------|--------|
| Low | Add Stripe webhook integration test (staging only) | 2-4h |
| Low | Add email delivery verification test | 2-4h |
| Medium | Create V1-specific test tag/suite | 1-2h |

---

## CI/CD Integration

### Current Workflow

```yaml
# .github/workflows/ci.yml
- name: E2E (PostgreSQL)
  run: pnpm -C frontend test:e2e
```

### Test Execution

```bash
# Run all E2E tests (CI)
pnpm -C frontend test:e2e

# Run specific flow tests (local)
pnpm -C frontend test:e2e --grep "checkout"
pnpm -C frontend test:e2e --grep "producer"
pnpm -C frontend test:e2e --grep "admin"
```

---

## Key Test Files for V1 Flows

### Flow A Tests

```
frontend/tests/e2e/cart-checkout-m0.spec.ts
frontend/tests/storefront/checkout.spec.ts
frontend/tests/checkout/atomic.spec.ts
frontend/tests/e2e/cart-add-checkout.smoke.spec.ts
```

### Flow B Tests

```
frontend/tests/e2e/auth-cart-flow.spec.ts
frontend/tests/e2e/cart-auth-integration.spec.ts
frontend/tests/e2e/cart-sync.spec.ts
```

### Flow C Tests

```
frontend/tests/e2e/producer-product-crud.spec.ts
frontend/tests/e2e/producer-dashboard.spec.ts
frontend/tests/e2e/admin-product-approval.spec.ts
frontend/tests/e2e/producer-product-ownership.spec.ts
```

### Flow D Tests

```
frontend/tests/admin/dashboard.spec.ts
frontend/tests/e2e/admin-order-detail.spec.ts
frontend/tests/e2e/pass-58-producer-order-status.spec.ts
frontend/tests/admin/order-quick-actions.spec.ts
```

---

## Conclusion

**V1 E2E coverage is SUFFICIENT.** No new tests required for this pass.

The combination of:
1. Existing E2E tests (355 files)
2. Manual runbook (`RUNBOOK-V1-QA.md`)
3. Curl-based scripts (`prod-qa-v1.sh`, `prod-facts.sh`)

Provides comprehensive V1 QA coverage.

---

_E2E-V1-AUTOMATION-PLAN v1.0 | 2026-01-22_
