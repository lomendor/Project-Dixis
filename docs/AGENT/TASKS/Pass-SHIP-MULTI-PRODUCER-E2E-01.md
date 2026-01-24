# Tasks: Pass-SHIP-MULTI-PRODUCER-E2E-01

**Date**: 2026-01-24
**Status**: COMPLETE
**PR**: #2445

---

## Goal

Make E2E multi-producer tests robust for both local and production environments.

---

## Tasks Completed

| Task | Status |
|------|--------|
| Fix API endpoint for production (/api/v1/public/products) | ✅ |
| Add fallback locator selectors for add-to-cart buttons | ✅ |
| Handle both local and production cart page variants | ✅ |
| Verify tests pass against dixis.gr | ✅ |
| Create PR with auto-merge | ✅ |

---

## Code Changes

### frontend/tests/e2e/multi-producer-cart.spec.ts

1. **API Endpoint Fix**
   - Added `fetchProducts()` helper that tries `/api/v1/public/products` first (production), then falls back to `/api/products` (local)

2. **Locator Robustness**
   - Add-to-cart buttons now use multiple fallback selectors:
     ```typescript
     page.getByTestId('add-to-cart')
       .or(page.getByTestId('add-to-cart-button'))
       .or(page.locator('button:has-text("Προσθήκη")'))
     ```

3. **Cart Page Flexibility**
   - Checkout button selector handles multiple variants
   - Shipping fields are optional (filled only if visible)

---

## Verification

Production test run (https://dixis.gr):
```
Running 3 tests using 1 worker
📦 Testing with products from producers: 1, 4
✅ MP1: Multi-producer cart verified - both products added
✅ MP2: Multi-producer cart checkout button accessible
✅ MP3: No conflict modal for multi-producer cart
3 passed (17.5s)
```

---

_Pass-SHIP-MULTI-PRODUCER-E2E-01 | 2026-01-24_
