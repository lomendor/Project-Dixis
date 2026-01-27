# Summary: Pass-PAY-GUEST-CARD-GATE-01

**Date**: 2026-01-27
**Status**: COMPLETE
**PR**: https://github.com/lomendor/Project-Dixis/pull/2502

---

## TL;DR

Made checkout UI truthful for guests: card payment option hidden, visible notice shown, and hard-guard added to prevent any guest card payment attempts. Backend auth remains unchanged.

---

## Problem

Guest users could theoretically attempt card payment, but the backend payment init endpoint requires `auth:sanctum` middleware. This caused:
- Order creation: 201 SUCCESS (uses `auth.optional`)
- Payment init: 401 Unauthenticated (requires `auth:sanctum`)

---

## Root Cause

Middleware mismatch between order creation and payment:

```php
// routes/api.php line 285
Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    Route::post('orders/{order}/init', ...);  // Requires auth
});

// Order creation uses auth.optional - allows guests
```

Guest checkout creates order with `user_id = null`, but payment init fails because guest has no auth token.

---

## Solution

Frontend-only fix to make UI truthful:

1. **PaymentMethodSelector** (already implemented):
   - Hides card option when `!isAuthenticated`
   - Resets to COD if card selected while logged out

2. **Visible notice** (new):
   ```tsx
   <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
     Για πληρωμή με κάρτα απαιτείται σύνδεση. <a href="/login?redirect=/checkout">Συνδεθείτε</a>
   </div>
   ```

3. **Submit hard-guard** (new):
   ```tsx
   if (isGuest && paymentMethod === 'card') {
     setError('Για πληρωμή με κάρτα απαιτείται σύνδεση.')
     return
   }
   ```

---

## Evidence

| Test | Result |
|------|--------|
| GATE1: Guest card option visibility | NOT visible (correct) |
| GATE2: Guest COD checkout | 201 + no payment init call |
| Real-auth: Payment init | 200 + client_secret |
| All tests | 6/6 PASSED |

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/app/(storefront)/checkout/page.tsx` | +7 lines |
| `frontend/src/components/checkout/PaymentMethodSelector.tsx` | +4/-5 lines |
| `frontend/tests/e2e/card-payment-real-auth.spec.ts` | +7/-4 lines |
| `frontend/tests/e2e/guest-checkout-card-gate.spec.ts` | NEW (152 lines) |

---

## NOT Changed

- Backend routes/middleware remain unchanged
- auth:sanctum on payment endpoints preserved
- No i18n changes, shipping changes, or refactors

---

_Pass-PAY-GUEST-CARD-GATE-01 | 2026-01-27 | COMPLETE_
