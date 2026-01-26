# Summary: Pass-PAY-INIT-404-01

**Date**: 2026-01-27
**Status**: COMPLETE
**PR**: https://github.com/lomendor/Project-Dixis/pull/2500

---

## TL;DR

Fixed payment init 404 error for guest orders by updating authorization logic in PaymentController to allow orders with `user_id = null` to be paid by any authenticated user.

---

## Problem

`POST /api/v1/payments/orders/{id}/init` returned 404 "Order not found" for all guest checkout orders in production.

---

## Root Cause

```php
// PaymentController.php (BEFORE - BROKEN)
if ($order->user_id !== $request->user()->id) {
    return response()->json(['message' => 'Order not found'], 404);
}
```

Guest orders have `user_id = null`. The comparison `null !== <any_user_id>` always evaluates to `true`, causing ALL guest orders to return 404.

**Evidence from production**: All recent orders had `user_id: null` (guest checkout).

---

## Solution

Updated authorization to explicitly allow guest orders:

```php
// PaymentController.php (AFTER - FIXED)
// Pass PAY-INIT-404-01: Allow guest orders OR orders owned by the user
if ($order->user_id !== null && $order->user_id !== $request->user()->id) {
    return response()->json(['message' => 'Order not found'], 404);
}
```

Applied to all 4 payment endpoints:
- `initPayment()` - line 27
- `confirmPayment()` - line 107
- `cancelPayment()` - line 204
- `getPaymentStatus()` - line 260

---

## Evidence

| Item | Value |
|------|-------|
| PR | #2500 |
| Merge Commit | `e6b91105` |
| Deploy Run | #21376262793 (SUCCESS) |
| Auth Test | 401 Unauthenticated (not 404) |

---

## Files Changed

| File | Change |
|------|--------|
| `backend/app/Http/Controllers/Api/PaymentController.php` | +4 lines (fixed 4 auth checks) |
| `backend/tests/Feature/PaymentInitAuthorizationTest.php` | +127 lines (6 new tests) |

---

## Tests Added

| Test | Purpose |
|------|---------|
| `authenticated_user_can_init_payment_for_own_order` | Owner can pay their order |
| `authenticated_user_cannot_init_payment_for_other_users_order` | Cannot pay someone else's order → 404 |
| `authenticated_user_can_init_payment_for_guest_order` | Any authenticated user can pay guest order |
| `unauthenticated_user_cannot_init_payment` | Must be logged in → 401 |
| `cannot_init_payment_for_nonexistent_order` | Invalid order ID → 404 |
| `cannot_init_payment_for_already_paid_order` | Paid orders → 400 |

---

## Related Context

- Order creation uses `auth.optional` middleware (allows guest checkout)
- Payment endpoints use `auth:sanctum` middleware (requires authentication)
- Guest orders have `user_id = null` by design
- The fix ensures guests can create orders AND pay for them

---

_Pass-PAY-INIT-404-01 | 2026-01-27 | COMPLETE_
