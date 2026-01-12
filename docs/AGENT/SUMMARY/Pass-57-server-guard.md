# Pass 57: Server-Side Multi-Producer Guard

**Status**: ✅ DONE
**Closed**: 2026-01-12
**PRs**: #2185 (feature, merged), #2187 (test fix)

## TL;DR

Defense in depth: server-side validation rejects orders with products from multiple producers, even if client-side guard is bypassed.

## Problem

Pass 56 implemented client-side single-producer cart enforcement. However, client-side guards can be bypassed via API manipulation. Server-side validation is required for defense in depth.

## Solution

Added validation in `OrderController.php` store() method:

```php
// Pass 57: Server-side guard - one producer per order (MVP)
$producerIds = collect($productData)
    ->pluck('product.producer_id')
    ->filter()
    ->unique();

if ($producerIds->count() > 1) {
    abort(422, json_encode([
        'error' => 'MULTI_PRODUCER_CART_NOT_ALLOWED',
        'message' => 'Το καλάθι περιέχει προϊόντα από διαφορετικούς παραγωγούς...',
        'producer_ids' => $producerIds->values()->toArray(),
    ]));
}
```

### Response Format

- HTTP Status: `422 Unprocessable Entity`
- Error Code: `MULTI_PRODUCER_CART_NOT_ALLOWED`
- Message: Greek text explaining MVP limitation
- Payload: Array of detected producer IDs

## Files Changed

| File | Change |
|------|--------|
| `backend/app/Http/Controllers/Api/V1/OrderController.php` | Added multi-producer validation after product loading |
| `frontend/tests/e2e/pass-57-server-guard.spec.ts` | E2E tests for API validation |

## E2E Test Coverage

3 tests in `pass-57-server-guard.spec.ts`:

1. **Rejects multi-producer orders**: POST with products from producers 1 & 4 → 422
2. **Accepts single-producer orders**: POST with products from producer 1 only → NOT 422
3. **Returns correct error code**: Response contains `MULTI_PRODUCER_CART_NOT_ALLOWED`

## PROD Verification (2026-01-12)

**curl test**:
```bash
curl -X POST https://dixis.gr/api/v1/public/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":1},{"product_id":6,"quantity":1}],...}'
# Result: HTTP 422, MULTI_PRODUCER_CART_NOT_ALLOWED ✓
```

**E2E tests**:
```
API_BASE_URL=https://dixis.gr/api/v1 npx playwright test pass-57-server-guard.spec.ts
Running 3 tests using 1 worker
  3 passed (1.2s) ✓
```

## Integration with Pass 56

| Layer | Guard | Behavior |
|-------|-------|----------|
| Client (Pass 56) | Zustand cart store | Modal asks user to resolve conflict |
| Server (Pass 57) | OrderController | Returns 422 if validation fails |

---
Generated-by: Claude (Pass 57 Server-Side Guard)
