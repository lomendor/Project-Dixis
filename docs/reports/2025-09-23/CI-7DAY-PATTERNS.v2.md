# CI Failure Patterns — last 7 days (v2) (2025-09-23)

Noise excluded: Setup PHP/Node/Runner Image steps.

## Summary
| Bucket | Count |
| --- | --- |
| Analyzed runs | 200 |
| Failures | 116 |
| Jobs with failures (unique) | 8 |
| ESLint 'Unexpected any' (occurrences) | 174 |
| ESLint affected files (distinct) | 10 |
| FE-API timeouts (runs) | 1 |
| FE-API port mismatch (runs) | 0 |
| FE-API HTTP 404/500 (runs) | 2 |

## Top Failing Jobs (counts)
| Job | Fails |
| --- | --- |
| .github/workflows/backend-ci.yml | 30 |
| .github/workflows/frontend-e2e.yml | 29 |
| .github/workflows/fe-api-integration.yml | 15 |
| frontend-ci | 14 |
| CI Pipeline | 12 |
| Pull Request Quality Gates | 9 |
| FE-API Integration | 6 |
| Nightly Quality Checks | 1 |

## Top files with ESLint 'Unexpected any'
| File | Count |
| --- | --- |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/app/api/checkout/pay/route.ts | 12 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/components/cart/CartSummary.tsx | 12 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/lib/analytics.ts | 12 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/lib/api/checkout.ts | 12 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/auth-cart-flow.spec.ts | 9 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/pr-pp03-d-checkout-edge-cases.spec.ts | 9 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/app/admin/components/PriceStockEditor.tsx | 6 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/app/api/producer/products/route.ts | 6 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/components/SEOHead.tsx | 6 |
| /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/lib/checkout/shippingRetry.ts | 6 |

## FE-API failure breakdown
- Timeouts: 1
- Port mismatch: 0
- HTTP 404/500: 2
- Unknown: 3

**Notes:** No port mismatch signatures detected; a port fix likely has minimal impact currently. Observed 1 timeout run — likely test startup/wait conditions. Detected 2 runs with HTTP 4xx/5xx responses (route handling or backend issues). 

## Failing checks index (representative runs)

**.github/workflows/backend-ci.yml** — 30 fails
- https://github.com/lomendor/Project-Dixis/actions/runs/17942746896
- https://github.com/lomendor/Project-Dixis/actions/runs/17942531050
- https://github.com/lomendor/Project-Dixis/actions/runs/17942343694
- https://github.com/lomendor/Project-Dixis/actions/runs/17941146704
- https://github.com/lomendor/Project-Dixis/actions/runs/17941069169

**.github/workflows/frontend-e2e.yml** — 29 fails
- https://github.com/lomendor/Project-Dixis/actions/runs/17942747203
- https://github.com/lomendor/Project-Dixis/actions/runs/17942530774
- https://github.com/lomendor/Project-Dixis/actions/runs/17942343308
- https://github.com/lomendor/Project-Dixis/actions/runs/17941146858
- https://github.com/lomendor/Project-Dixis/actions/runs/17941069370

**.github/workflows/fe-api-integration.yml** — 15 fails
- https://github.com/lomendor/Project-Dixis/actions/runs/17942747076
- https://github.com/lomendor/Project-Dixis/actions/runs/17942530902
- https://github.com/lomendor/Project-Dixis/actions/runs/17942343494
- https://github.com/lomendor/Project-Dixis/actions/runs/17941146998
- https://github.com/lomendor/Project-Dixis/actions/runs/17941068966
