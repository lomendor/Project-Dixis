# CI Cart/Checkout Failure Patterns (Last 7 Days)

Repo: lomendor/Project-Dixis
Generated: 2025-09-24 20:10:20Z

- Matches found: 677
- Keywords: cart, checkout, product-card, cart-item

## API failures (0)
- Representative failed runs: (none)

## UI rendering failures (551)
- Representative failed runs:
  - https://github.com/lomendor/Project-Dixis/actions/runs/17983676054
  - https://github.com/lomendor/Project-Dixis/actions/runs/17983676007
  - https://github.com/lomendor/Project-Dixis/actions/runs/17983675992

## Test selector issues (126)
- Representative failed runs:
  - https://github.com/lomendor/Project-Dixis/actions/runs/17983675992
  - https://github.com/lomendor/Project-Dixis/actions/runs/17983675720
  - https://github.com/lomendor/Project-Dixis/actions/runs/17981270044

## Recurring Error Signatures
- 42× — Timeout waiting for locator('[data-testid="product-card"]')
  - Example: - waiting for locator('[data-testid="product-card"]').first()
- 38× — frontend/tests/e2e/shipping-checkout-e2e.spec.ts#L0
- 36× — [smoke] › tests/e2e/shipping-checkout-e2e.spec.ts:82:7 › Shipping Integration E2E › shipping validation prevents checkout without postal code:
- 36× — 2) [smoke] › tests/e2e/shipping-checkout-e2e.spec.ts:82:7 › Shipping Integration E2E › shipping validation prevents checkout without postal code
- 32× — [smoke] › tests/e2e/shipping-checkout-e2e.spec.ts:116:7 › Shipping Integration E2E › shipping cost calculation for different zones:
- 32× — 3) [smoke] › tests/e2e/shipping-checkout-e2e.spec.ts:116:7 › Shipping Integration E2E › shipping cost calculation for different zones
- 22× — [smoke] › tests/e2e/shipping-checkout-e2e.spec.ts:16:7 › Shipping Integration E2E › complete shipping checkout flow:
- 22× — 1) [smoke] › tests/e2e/shipping-checkout-e2e.spec.ts:16:7 › Shipping Integration E2E › complete shipping checkout flow
- 14× — frontend/src/app/api/checkout/pay/route.ts#L155
- 14× — frontend/tests/e2e/shipping-checkout-e2e.spec.ts#L130
- 14× — 129 | const firstProduct = page.locator('[data-testid="product-card"]').first();
- 14× — 131 | await page.click('[data-testid="add-to-cart-btn"]');
- 14× — 132 | await page.goto('/cart');
- 14× — at /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/shipping-checkout-e2e.spec.ts:130:24
- 14× — frontend/tests/e2e/shipping-checkout-e2e.spec.ts#L97
- 14× — 96 | const firstProduct = page.locator('[data-testid="product-card"]').first();
- 14× — 98 | await page.click('[data-testid="add-to-cart-btn"]');
- 14× — 99 | await page.goto('/cart');
- 14× — at /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/shipping-checkout-e2e.spec.ts:97:24
- 14× — frontend/tests/e2e/shipping-checkout-e2e.spec.ts#L32
