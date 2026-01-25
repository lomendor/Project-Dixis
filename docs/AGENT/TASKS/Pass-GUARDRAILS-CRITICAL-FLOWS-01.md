# Tasks: Pass-GUARDRAILS-CRITICAL-FLOWS-01

**Date**: 2026-01-25
**Status**: IN PROGRESS
**Goal**: Establish guardrails to catch checkout regressions BEFORE users see broken flows

---

## Evidence Pack

### Observable Production State (2026-01-25 21:40 UTC)

**Order #103** (most recent multi-producer order):
```json
{
  "id": 103,
  "items": [
    {"product_name": "Organic Tomatoes", "producer": {"id": 1, "name": "Green Farm Co."}},
    {"product_name": "Test Product from Producer B", "producer": {"id": 4, "name": "Test Producer B"}},
    {"product_name": "QA Flow C Product 1769084338", "producer": {"id": 1, "name": "Green Farm Co."}}
  ],
  "is_multi_producer": false,        // ❌ WRONG - should be true (2 producers)
  "shipping_lines": [],              // ❌ WRONG - should have per-producer breakdown
  "shipping_total": "0.00",          // ❌ WRONG - should be €7.00 (2 × €3.50)
  "shipping_amount": "3.50",         // ❌ WRONG - only counts single producer
  "tax_amount": "0.00",              // ❌ WRONG - €24.49 subtotal should have VAT
  "subtotal": "24.49",
  "total": "27.99"
}
```

### Analysis: Why Curl 200 ≠ Working Checkout

| Check | Result | Reality |
|-------|--------|---------|
| `curl /api/healthz` | ✅ 200 | Backend running |
| `curl /api/v1/public/orders` | ✅ 200 | Endpoint responds |
| Multi-producer detection | ❌ | `is_multi_producer: false` for 2-producer order |
| Per-producer shipping | ❌ | `shipping_lines: []` empty |
| Shipping calculation | ❌ | €3.50 instead of €7.00 |
| VAT calculation | ❌ | €0 instead of 24% |

### Root Cause Hypothesis

The code in `CheckoutService.php` calculates per-producer shipping, but:
1. Order #103 was created via `OrderController@store` **before** the HOTFIX was removed (before PR #2444)
2. The old code path doesn't populate `shipping_lines` or `is_multi_producer`
3. Orders created AFTER multi-producer was enabled (PR #2444+) should use `CheckoutService`

**Verification needed**: Are NEW multi-producer orders (created after Jan 24) correctly populated?

---

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Bootstrap - read STATE.md, NEXT-7D.md, AGENT/README.md | DONE |
| 2 | Run prod-facts.sh and capture output | DONE |
| 3 | Document evidence of broken checkout flow | DONE |
| 4 | GUARDRAIL #1: prod-sanity workflow (non-mutating) | TODO |
| 5 | GUARDRAIL #2: checkout-golden-path E2E test | TODO |
| 6 | Create shipping/VAT spec document | TODO |
| 7 | PR #1: prod-sanity workflow + docs | TODO |
| 8 | PR #2: Playwright checkout tests | TODO |
| 9 | Update STATE.md | TODO |
| 10 | Create SUMMARY doc | TODO |

---

## GUARDRAIL #1: Prod-Sanity Workflow

**File**: `.github/workflows/prod-sanity.yml`
**Trigger**: Manual + daily cron
**Actions**: Non-mutating checks only (NO order creation)

Checks:
1. `/api/healthz` returns 200 + `"status":"ok"`
2. `/api/v1/public/products` returns 200 + `"data"` array with items
3. `/api/v1/public/orders` returns 200 + valid JSON (NOT 500)
4. Recent order (if any) has valid structure:
   - `shipping_amount` >= 0
   - `tax_amount` >= 0 (or explicitly 0 for exempt items)
   - `is_multi_producer` matches actual producer count in items

---

## GUARDRAIL #2: Checkout E2E Test

**File**: `frontend/tests/e2e/checkout-golden-path.spec.ts`
**Tag**: `@smoke` (runs on every PR preview)

Test scenarios:
1. **COD Single Producer**: Add 1 item → checkout → verify order created
2. **COD Multi-Producer**: Add items from 2 producers → checkout → verify `shipping_lines` populated
3. **Shipping Calculation**: Verify €3.50 per producer (or free if subtotal >= €35)
4. **VAT Calculation**: Verify 24% VAT included

---

## Shipping & VAT Spec Reference

### Shipping Rules (current implementation)
- Flat rate: €3.50 per producer shipment
- Free shipping: If producer subtotal >= €35
- Multi-producer: Each producer shipped separately

### VAT Rules (expected)
- Standard rate: 24% (Greek VAT)
- Included in prices (not added on top)
- Display: Show VAT amount in order summary

---

_Pass-GUARDRAILS-CRITICAL-FLOWS-01 | 2026-01-25_
