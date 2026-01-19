# Pass STRIPE-PAYMENT-INIT-01: Stripe Payment Init Fix

**Date**: 2026-01-19 13:18 UTC
**Commit**: `cbec8d96` (main)
**PR**: #2327
**Environment**: Production (https://dixis.gr)
**Status**: PASS

---

## Summary

Fixed P1 blocker where card checkout failed with "Failed to initialize payment" when frontend didn't send customer data in payment init request.

---

## Root Cause Analysis

| Component | Issue |
|-----------|-------|
| **Endpoint** | `POST /api/v1/payments/orders/{id}/init` |
| **Error** | `{"message":"Failed to initialize payment","error":"payment_init_failed"}` |
| **HTTP Status** | 400 |
| **Root Cause** | Stripe customer creation requires email, but code didn't fallback to order data |

### Code Path

```php
// StripePaymentProvider.php (BEFORE)
$customerData = $options['customer'] ?? [];
// If no customer.email provided, $customer remains null
// Stripe API fails without proper customer context
```

### Fix Applied

```php
// StripePaymentProvider.php (AFTER)
// Fallback to order's shipping email or user email if not provided
if (empty($customerData['email'])) {
    $customerData['email'] = $order->shipping_address['email']
        ?? $order->user?->email
        ?? null;
}
```

---

## Testing Evidence

### Before Fix (Order #89)

```bash
POST /api/v1/payments/orders/89/init
Body: {}
```

**Response**:
```json
{
  "message": "Failed to initialize payment",
  "error": "payment_init_failed",
  "error_message": "Failed to initialize payment. Please try again."
}
```
**HTTP Status**: 400

### After Fix (Order #91)

```bash
POST /api/v1/payments/orders/91/init
Body: {}
```

**Response**:
```json
{
  "message": "Payment initialized successfully",
  "payment": {
    "client_secret": "pi_3SrIMIQ9Xukpkfmb18QMgTdS_secret_...",
    "payment_intent_id": "pi_3SrIMIQ9Xukpkfmb18QMgTdS",
    "requires_action": false,
    "payment_method_types": ["card", "bancontact", "eps", "klarna", "link"],
    "amount": 885,
    "currency": "eur",
    "status": "requires_payment_method"
  },
  "order": {
    "id": 91,
    "total_amount": "8.85",
    "payment_status": "pending"
  }
}
```
**HTTP Status**: 200

---

## Deployment Timeline

| Time (UTC) | Event |
|------------|-------|
| 13:09:00 | Issue reproduced and root cause identified |
| 13:10:43 | PR #2327 created |
| 13:18:23 | PR #2327 merged |
| 13:18:45 | Backend deployment completed |
| 13:19:00 | Fix verified in production |

---

## Impact

- **Fixed**: Card payments now work without explicit customer data in request
- **Backward Compatible**: Existing calls with customer data continue to work
- **Fallback Chain**: `options.customer.email` → `order.shipping_address.email` → `order.user.email`

---

## Verification Checklist

- [x] Root cause identified (customer email not provided)
- [x] Minimal fix applied (10 lines added)
- [x] Backend tests pass
- [x] CI/CD checks pass
- [x] PR merged
- [x] Production deployment verified
- [x] End-to-end proof captured (Order #91)

---

## Files Changed

| File | Changes |
|------|---------|
| `backend/app/Services/Payment/StripePaymentProvider.php` | +10 lines (email fallback logic) |

---

_Pass: STRIPE-PAYMENT-INIT-01 | Generated: 2026-01-19 13:19 UTC | Author: Claude_
