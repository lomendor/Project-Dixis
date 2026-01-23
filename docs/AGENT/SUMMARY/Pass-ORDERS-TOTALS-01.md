# Summary: Pass-ORDERS-TOTALS-01

**Status**: VERIFIED (No bug)
**Date**: 2026-01-23
**PR**: #2420

---

## TL;DR

Investigated "€26.99 pattern" in Orders UI. **No bug found.** The pattern is explained by QA tests using same test product (€19.99 + €5 shipping + €2 tax = €26.99). Real orders have 10+ unique totals.

---

## Result

| Check | Status |
|-------|--------|
| Totals calculated correctly | ✅ subtotal + tax + shipping = total |
| Data is real (not hardcoded) | ✅ 10 unique totals across 15 orders |
| List/Detail totals match | ✅ Verified via API |
| Frontend mapping correct | ✅ Uses safeMoney(order.total_amount) |

---

## Evidence

### API Data Sample
```
Order #102: subtotal=19.99 + tax=2.00 + shipping=5.00 = total=26.99 ✅
Order #98:  subtotal=9.99  + tax=1.00 + shipping=5.00 = total=15.99 ✅
Order #97:  subtotal=12.50 + tax=0.00 + shipping=0.00 = total=12.50 ✅
```

### Diversity Check
```
Unique totals found: €7.48, €8.85, €9.99, €12.50, €15.99, €18.20, €19.98, €19.99, €26.98, €26.99
Count: 10 unique values (proves real data)
```

### Test Proof Command
```bash
CI=true BASE_URL=https://dixis.gr npx playwright test order-totals-regression.spec.ts
```
**Result**: 5 passed (2.4s)

### PR
https://github.com/lomendor/Project-Dixis/pull/2420

---

## Risks / Next

| Risk | Status |
|------|--------|
| None | Data is correct, tests added for regression |

### Why €26.99 Appears Often

QA automated tests (`V1-QA-EXECUTE-01`) create orders with:
- Same test product: "QA V1 Product" @ €19.99
- Standard shipping: €5.00
- Standard tax: €2.00
- **Total: €26.99**

This is expected behavior for repeated QA test runs.

---

_Pass-ORDERS-TOTALS-01 | 2026-01-23_
