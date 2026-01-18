# Pass 56: Single Producer Cart (Option A)

**Status**: DONE
**Closed**: 2025-01-12
**PRs**: #2181 (feature), #2182 (docs), #2183 (PROD verification)

## TL;DR

MVP shipping simplification: cart allows products from **one producer only**. When user tries to add product from different producer, a Greek modal offers 3 options: complete current order, empty cart & add new product, or cancel.

## Problem

Multi-producer carts require complex shipping aggregation (each producer ships from different location). For MVP, this complexity is deferred.

## Solution

Client-side guard in Zustand cart store:

1. **`cart.ts`**: Added `producerId`/`producerName` to CartItem type
   - `add()` returns `AddResult` with conflict detection
   - `forceAdd()` clears cart and adds new item

2. **`ProducerConflictModal.tsx`**: Greek UI modal
   - "Διαφορετικός Παραγωγός" (Different Producer)
   - "Ολοκλήρωσε την παραγγελία σου" → /checkout
   - "Άδειασε το καλάθι" → forceAdd()
   - "Ακύρωση" → close modal

3. **`AddToCartButton.tsx`**: Handles conflict state
4. **`ProductCard.tsx`**: Passes `producerId`
5. **`demoProducts.ts`**: All 18 have `producerId`

## Evidence

### E2E Tests (7 tests, all pass)

```
BEFORE: Cart had "Extra Virgin Olive Oil" (producer 1)
AFTER:  Cart has "Test Product from Producer B" (producer 4)
```

### PROD Data Setup

Added Test Producer B (id=4) with 1 product for conflict testing.

### Console Errors (Stripe page)

`Cannot find module './en'` is Stripe's code, not ours. **IGNORE**.

## Risks

| Risk | Mitigation |
|------|------------|
| Client-only guard | TODO: Server-side guard at checkout API |

## Verify on PROD

1. https://dixis.gr/products
2. Add "Green Farm Co." product
3. Add "Test Product from Producer B"
4. Modal appears → click "Άδειασε το καλάθι"
5. Cart has only new product ✓

---
Generated-by: Claude (Pass 56 Single Producer Cart)
