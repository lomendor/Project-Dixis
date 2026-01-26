# Pass-STRIPE-CARD-E2E-01: Stripe/Card Payment End-to-End Verification

**Status**: 🔲 TODO
**Priority**: HIGH
**Blocked by**: None

---

## Scope

Verify the complete CARD payment flow with timeline evidence. Ensure email "Order Confirmation" is sent **ONLY after payment confirmation/webhook success**.

## Objectives

1. **Reproduce CARD flow** in staging or prod test mode (whichever exists)
2. **Collect timeline evidence**:
   - Order created (timestamp)
   - Payment intent created (timestamp)
   - `confirmPayment` called (timestamp)
   - Webhook received (timestamp)
   - Email sent (timestamp)
3. **Verify requirement**: Email must be sent ONLY after payment confirmation

## Test Scenarios

### Scenario 1: Single-producer CARD payment
- Add 1 product to cart
- Complete checkout with card (Stripe test card: 4242...)
- Verify:
  - Order created with `payment_status: pending`
  - PaymentIntent created
  - After `confirmPayment` → `payment_status: paid`
  - Email sent AFTER confirmation

### Scenario 2: Multi-producer CARD payment
- Add 2 products from different producers
- Complete checkout with card
- Verify:
  - CheckoutSession created with 2 child orders
  - Single PaymentIntent for total
  - After `confirmPayment` → ALL child orders marked paid
  - Email sent for ALL child orders AFTER confirmation

### Scenario 3: Payment failure handling
- Use Stripe test card that declines (4000 0000 0000 0002)
- Verify:
  - No email sent
  - UI shows error message (not success)
  - Order remains `payment_status: pending`

## Evidence Collection

### Required Artifacts
1. **Backend logs**: Filter for order creation, payment confirmation, email sending
2. **Database timestamps**:
   - `orders.created_at`
   - `orders.updated_at` (when payment confirmed)
3. **Email service logs**: Resend API response timestamps
4. **Stripe dashboard**: PaymentIntent timeline

### Expected Timeline (correct behavior)
```
T+0s:   Order created (status: pending, payment_status: pending)
T+1s:   PaymentIntent created
T+5s:   User completes Stripe form
T+6s:   confirmPayment called
T+7s:   Webhook received (payment_intent.succeeded)
T+8s:   Order updated (payment_status: paid)
T+8s:   Email sent (AFTER payment confirmation) ✅
```

### Incorrect Behavior (bug)
```
T+0s:   Order created
T+0s:   Email sent (BEFORE payment) ❌ BUG
T+6s:   Payment confirmed
```

## Environment Requirements

- [ ] Staging environment with Stripe test mode OR
- [ ] Production with Stripe test cards (if supported) OR
- [ ] Local environment with Stripe webhook forwarding

## Code Locations to Verify

| File | Purpose |
|------|---------|
| `backend/app/Http/Controllers/Api/V1/OrderController.php:165-180` | COD email at creation |
| `backend/app/Http/Controllers/Api/PaymentController.php:130-160` | CARD email after confirmation |
| `backend/app/Http/Controllers/StripeWebhookController.php` | Webhook handling |
| `backend/app/Services/OrderEmailService.php` | Email sending with idempotency |

## Success Criteria

1. ✅ CARD payment emails sent ONLY after `PaymentController::confirmPayment` or webhook success
2. ✅ COD payment emails sent at order creation (different flow)
3. ✅ Multi-producer: ALL sibling orders get emails after parent PaymentIntent confirms
4. ✅ Payment failure: NO email sent, UI shows error

## Notes

- DO NOT implement changes in this pass
- ONLY collect evidence and document findings
- If issues found, create follow-up fix pass
