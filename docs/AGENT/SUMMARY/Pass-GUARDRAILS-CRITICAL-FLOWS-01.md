# Summary: Pass-GUARDRAILS-CRITICAL-FLOWS-01

**Date**: 2026-01-25
**Status**: COMPLETE
**PR**: #2484

---

## TL;DR

Added automated guardrails to catch checkout regressions before users see broken flows. Includes prod-sanity workflow, golden-path E2E tests, and shipping/VAT spec documentation.

---

## Problem

Despite `curl` checks returning HTTP 200, production checkout flows had broken data:

**Order #103 Evidence** (2026-01-25):
- 3 items from 2 different producers (Green Farm Co. + Test Producer B)
- `is_multi_producer: false` ← Should be true
- `shipping_lines: []` ← Should have per-producer breakdown
- `shipping_total: "0.00"` ← Should be €7.00 (2 × €3.50)
- `tax_amount: "0.00"` ← Should have VAT calculated

**Root Cause**: Order #103 was created before multi-producer checkout was enabled (before PR #2444). The old `OrderController@store` code path doesn't populate `shipping_lines` or set `is_multi_producer`.

---

## Solution

### GUARDRAIL #1: prod-sanity-orders.yml

**Trigger**: Daily cron (06:00 UTC) + manual
**Checks**:
1. `/api/healthz` returns 200
2. `/api/v1/public/orders` returns valid JSON (not 500)
3. Recent order has valid structure (shipping, total, items)

**Non-mutating**: Safe for production (no order creation)

### GUARDRAIL #2: checkout-golden-path.spec.ts

**Tests**:
- GP1: Single-producer COD checkout + shipping verification
- GP2: Multi-producer COD checkout + shipping_lines verification
- GP3: Order data structure validation via API

**Tag**: `@smoke` for CI/preview runs

### Documentation: SHIPPING-AND-TAXES-MVP.md

- Shipping rules: €3.50 per producer, free if subtotal >= €35
- VAT rules: 24% standard, 13% food (inclusive)
- Email timing: COD immediate, CARD after confirmation

---

## Evidence

| Before | After |
|--------|-------|
| Only curl 200 checks | Data structure verification |
| No E2E for multi-producer shipping | GP2 test verifies shipping_lines |
| No shipping spec | SHIPPING-AND-TAXES-MVP.md |

**Files Added**:
- `.github/workflows/prod-sanity-orders.yml` (76 lines)
- `frontend/tests/e2e/checkout-golden-path.spec.ts` (199 lines)
- `docs/PRODUCT/SHIPPING-AND-TAXES-MVP.md` (132 lines)
- `docs/AGENT/TASKS/Pass-GUARDRAILS-CRITICAL-FLOWS-01.md` (updated)

---

## Prevention

These guardrails will now catch:
1. Orders API returning 500 (workflow fails)
2. Orders with missing shipping data (workflow warns)
3. Multi-producer checkout creating incorrect data (E2E test logs warnings)

---

_Pass-GUARDRAILS-CRITICAL-FLOWS-01 | 2026-01-25 | COMPLETE_
