# Shipping & Taxes MVP Specification

**Created**: 2026-01-25 (Pass-GUARDRAILS-CRITICAL-FLOWS-01)
**Status**: ACTIVE

---

## Overview

This document defines the shipping and tax calculation rules for the Dixis marketplace MVP. These rules are implemented in `backend/app/Services/CheckoutService.php`.

---

## Shipping Rules

### Single-Producer Orders

| Rule | Value |
|------|-------|
| Flat rate | €3.50 per order |
| Free threshold | €35.00 subtotal |
| Method | HOME delivery (Courier) |

**Logic**:
```
IF subtotal >= €35.00 THEN shipping = €0.00
ELSE shipping = €3.50
```

### Multi-Producer Orders

| Rule | Value |
|------|-------|
| Flat rate | €3.50 **per producer shipment** |
| Free threshold | €35.00 **per producer subtotal** |
| Method | Separate shipment per producer |

**Logic** (per producer):
```
FOR EACH producer IN order:
  IF producer_subtotal >= €35.00 THEN producer_shipping = €0.00
  ELSE producer_shipping = €3.50

total_shipping = SUM(producer_shipping)
```

### Data Structure

**Single-producer order**:
```json
{
  "is_multi_producer": false,
  "shipping_amount": "3.50",
  "shipping_lines": []
}
```

**Multi-producer order** (2 producers, both under €35):
```json
{
  "is_multi_producer": true,
  "shipping_amount": "7.00",
  "shipping_total": "7.00",
  "shipping_lines": [
    {
      "producer_id": 1,
      "producer_name": "Green Farm Co.",
      "subtotal": "24.49",
      "shipping_cost": "3.50",
      "free_shipping_applied": false
    },
    {
      "producer_id": 4,
      "producer_name": "Test Producer B",
      "subtotal": "5.00",
      "shipping_cost": "3.50",
      "free_shipping_applied": false
    }
  ]
}
```

---

## Tax Rules (VAT)

### Greek VAT Rate

| Category | Rate |
|----------|------|
| Standard | 24% |
| Reduced (food) | 13% |

### Current Implementation

**MVP simplification**: All prices are displayed **inclusive of VAT** (gross prices).

| Field | Description |
|-------|-------------|
| `subtotal` | Sum of item prices (VAT included) |
| `tax_amount` | Calculated VAT component (for display) |
| `total_amount` | Same as subtotal + shipping |

**Calculation**:
```
// For 24% VAT (standard rate):
net_price = gross_price / 1.24
vat_amount = gross_price - net_price

// For 13% VAT (reduced rate, food):
net_price = gross_price / 1.13
vat_amount = gross_price - net_price
```

### Known Issue

**Order #103 observation** (2026-01-25):
- `tax_amount: "0.00"` despite €24.49 subtotal
- This may indicate VAT calculation is not running, or products are marked as VAT-exempt

**Expected behavior**:
- Food products at 13%: €24.49 → VAT = €2.82
- Standard products at 24%: €24.49 → VAT = €4.73

---

## Email Timing Rules

### Cash on Delivery (COD)

| Event | Action |
|-------|--------|
| Order created | Send confirmation email immediately |
| Delivery completed | Send delivery confirmation |

### Card Payment (Stripe)

| Event | Action |
|-------|--------|
| Order created | **DO NOT** send email |
| Payment confirmed | Send confirmation email |
| Multi-producer | Send email for ALL child orders after parent payment confirmed |

**Implementation**: `PaymentController@confirmPayment` and `StripeWebhookController@handlePaymentIntentSucceeded`

---

## Verification Checklist

Before deployment, verify:

- [ ] `POST /api/v1/public/orders` returns 200 (not 500)
- [ ] Single-producer order has `shipping_amount >= 0`
- [ ] Multi-producer order has `shipping_lines` populated
- [ ] Multi-producer order has `is_multi_producer: true`
- [ ] `shipping_total` = sum of `shipping_lines[].shipping_cost`
- [ ] COD orders trigger email at creation
- [ ] CARD orders trigger email only after payment confirmation

---

## Related Files

| File | Purpose |
|------|---------|
| `backend/app/Services/CheckoutService.php` | Order splitting + shipping calc |
| `backend/app/Http/Controllers/Api/V1/OrderController.php` | Order creation |
| `backend/app/Http/Controllers/Api/PaymentController.php` | Payment confirmation |
| `frontend/src/app/(storefront)/thank-you/page.tsx` | Order confirmation display |
| `frontend/tests/e2e/checkout-golden-path.spec.ts` | E2E verification tests |

---

_SHIPPING-AND-TAXES-MVP.md | Pass-GUARDRAILS-CRITICAL-FLOWS-01 | 2026-01-25_
