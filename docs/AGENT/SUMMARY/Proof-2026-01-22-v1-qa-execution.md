# Proof: V1 QA Execution (2026-01-22)

**Date**: 2026-01-22 11:44 UTC
**Type**: QA Execution
**Runbook**: `docs/PRODUCT/QA-V1-RUNBOOK.md`

---

## Pre-flight Status

| Check | Result |
|-------|--------|
| prod-facts.sh | ALL 5 CHECKS PASS |
| API healthz | `{"status":"ok"}` |
| Products API | Returns data |
| Homepage TTFB | 183ms median |
| Products TTFB | 185ms median |
| API TTFB | 257ms median |

---

## Flows to Execute

### Flow A: Guest Checkout (COD)

**Pass Criteria:**
- Order created with status `pending`
- Order number format `ORD-XXXXXX`
- Payment method: `COD`

**Evidence to Capture:**
- Order ID
- Order number
- Total amount
- Timestamp

**Status**: ✅ PASS

---

### Flow B: Auth User Checkout (Card)

**Pass Criteria:**
- User authenticated
- Order created with payment_method `card`
- Payment Intent ID created (`pi_xxx...`)
- client_secret returned

**Evidence to Capture:**
- User ID
- Order ID
- Payment Intent ID
- Amount (cents)

**Status**: PENDING

---

### Flow C: Producer Flow

**Pass Criteria:**
- Producer login successful
- Product created with unique ID
- Product status: `available`
- Product visible in public API

**Evidence to Capture:**
- Product ID
- Product name
- Producer ID/name
- Public visibility confirmed

**Status**: PENDING

---

### Flow D: Admin Flow

**Pass Criteria:**
- Admin login successful
- Orders list accessible
- Order status update succeeds
- `updated_at` timestamp changes

**Evidence to Capture:**
- Order ID updated
- Old status → New status
- Updated timestamp

**Status**: PENDING

---

## Execution Evidence

### Flow A: Guest Checkout (COD)

**Result**: ✅ PASS
**Executed**: 2026-01-22T11:53:25Z

| Field | Value |
|-------|-------|
| Order ID | 99 |
| Order Number | ORD-000099 |
| Status | pending |
| Payment Method | COD |
| Total | €19.99 EUR |
| Created At | 2026-01-22T11:53:26.000000Z |

**API Calls**:
```bash
# Get product
curl -sf "https://dixis.gr/api/v1/public/products" | jq '.data[0]'

# Create order
curl -sf -X POST "https://dixis.gr/api/v1/public/orders" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":10,"quantity":1}],"currency":"EUR","shipping_method":"HOME","payment_method":"COD","shipping_address":{...}}'

# Verify order
curl -sf "https://dixis.gr/api/v1/public/orders/99"
```

**Response snippet** (no PII):
```json
{
  "data": {
    "id": 99,
    "order_number": "ORD-000099",
    "status": "pending",
    "payment_method": "COD",
    "total": "19.99",
    "currency": "EUR"
  }
}
```

### Flow B: Auth User Checkout (Card)

```
(to be filled)
```

### Flow C: Producer Flow

```
(to be filled)
```

### Flow D: Admin Flow

```
(to be filled)
```

---

## Blockers

(none identified)

---

## Summary

| Flow | Status | Evidence |
|------|--------|----------|
| A. Guest COD | ✅ PASS | Order #99, ORD-000099, €19.99 |
| B. Auth Card | PENDING | - |
| C. Producer | PENDING | - |
| D. Admin | PENDING | - |

---

_Execution: 2026-01-22 | Runbook: QA-V1-RUNBOOK.md v1.0_
