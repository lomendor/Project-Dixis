# Pass PAYMENTS-STRIPE-ELEMENTS-01: Stripe Elements Integration

**Created**: 2026-01-18

## Objective

Replace Stripe Checkout (redirect-based) with embedded Stripe Elements card form in the checkout flow.

## Problem

Card payments previously redirected users to Stripe Checkout (external page). This creates a fragmented UX and loses checkout context.

## Solution

Integrate existing `StripeProvider` and `StripePaymentForm` components into checkout page:
1. After order creation, call `initPayment` API to get `client_secret`
2. Render Stripe Elements form inline
3. On successful payment, call `confirmPayment` API
4. Redirect to thank-you page

## Changes Made

### Frontend

1. **`frontend/src/app/(storefront)/checkout/page.tsx`**
   - Import `StripeProvider` and `StripePaymentForm`
   - Add state for `stripeClientSecret`, `pendingOrderId`, `orderTotal`
   - Add `handleStripePaymentSuccess`, `handleStripePaymentError`, `handleCancelPayment` handlers
   - Replace `createPaymentCheckout` (redirect) with `paymentApi.initPayment`
   - Render Stripe Elements form when `clientSecret` is available

2. **`frontend/src/lib/api/payment.ts`**
   - Fixed API endpoint paths to match backend routes:
     - `/payments/orders/{orderId}/init` (was `/orders/{orderId}/payment/init`)
     - `/payments/orders/{orderId}/confirm`
     - `/payments/orders/{orderId}/cancel`
     - `/payments/orders/{orderId}/status`

3. **`frontend/tests/e2e/card-payment-real-auth.spec.ts`**
   - Updated test 4 to work with new Stripe Elements flow
   - Test now fills checkout form first, submits, then interacts with Stripe iframe
   - Added proper handling for PaymentElement iframe structure

### Backend (No Changes)

Backend endpoints already implemented correctly:
- `POST /api/v1/payments/orders/{order}/init` → returns `client_secret`
- `POST /api/v1/payments/orders/{order}/confirm` → accepts `payment_intent_id`

## Flow Diagram

```
User fills checkout form
         ↓
Selects "Card" payment
         ↓
Clicks "Continue to Payment"
         ↓
Order created (status: pending)
         ↓
initPayment API called
         ↓
client_secret returned
         ↓
Stripe Elements form rendered
         ↓
User enters card details (4242...)
         ↓
Stripe confirmPayment called
         ↓
confirmPayment API called
         ↓
Order updated (status: paid)
         ↓
Redirect to /thank-you
```

## Definition of Done

- [x] Card payment shows embedded Stripe Elements form
- [x] API paths corrected to match backend routes
- [x] E2E test updated for new flow
- [x] TypeScript compiles without errors
- [x] Lint passes (no new errors)
- [ ] E2E test passes in CI
- [ ] Test card 4242 4242 4242 4242 completes payment (requires deployed build)

## Verification

### TypeScript
```
npx tsc --noEmit  # No errors
```

### Lint
```
npm run lint  # No errors (warnings only, pre-existing)
```

### LOC Count
```
219 insertions, 74 deletions = ~145 LOC net change (within ≤300 limit)
```

## Files Changed

- `frontend/src/app/(storefront)/checkout/page.tsx` (+105 lines)
- `frontend/src/lib/api/payment.ts` (+5/-5 lines)
- `frontend/tests/e2e/card-payment-real-auth.spec.ts` (+109/-64 lines)
- `docs/AGENT/PASSES/TASK-Pass-PAYMENTS-STRIPE-ELEMENTS-01.md` (new)
- `docs/AGENT/PASSES/SUMMARY-Pass-PAYMENTS-STRIPE-ELEMENTS-01.md` (new)

## Risks

| Risk | Mitigation |
|------|------------|
| Stripe key not embedded at build time | Key added in PR #2290 workflow |
| Order orphaned if payment fails | User can retry on same order |
| CSP blocks Stripe iframe | Verify CSP allows *.stripe.com |

## References

- Pass PAYMENTS-CARD-REAL-01 (prerequisite)
- Backend PaymentController: `backend/app/Http/Controllers/Api/PaymentController.php`
- Stripe docs: https://stripe.com/docs/payments/payment-element
