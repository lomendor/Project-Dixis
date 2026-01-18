# Pass 51 - Payments v1 (Card via Stripe)

**Date**: 2025-12-28
**Status**: IN_PROGRESS
**PRs**: (pending)

## Problem Statement

Dixis only supported Cash on Delivery (COD). Greek marketplace needs card payment option for:
- Customers who prefer online payment
- International orders
- Higher conversion rates

## Solution

### Feature Flag Approach
Card payments are behind a feature flag (`PAYMENTS_CARD_FLAG=false` by default). This ensures:
- COD continues to work exactly as before
- Card payments can be enabled per-environment
- No runtime crashes if Stripe keys are missing

### Backend: Stripe Checkout Sessions

**New Files**:
- `config/payments.php` - Payment configuration with feature flag
- `PaymentCheckoutController.php` - Creates Stripe Checkout Sessions
- `StripeWebhookController.php` - Handles Stripe webhooks (signature validated)

**New Migration**:
- `2025_12_28_160000_add_payment_provider_fields_to_orders.php`
  - `payment_provider` (stripe, null for COD)
  - `payment_reference` (Stripe session ID)
  - Extended `payment_status` enum (unpaid, pending, paid, failed, refunded)

**API Endpoints**:
```
POST /api/v1/public/payments/checkout
  Request: { order_id: int }
  Response: { redirect_url: string, session_id: string }

POST /api/v1/webhooks/stripe
  - Validates signature
  - Updates order payment_status
  - Idempotent handling
```

### Frontend: Payment Method Selector

- Added "Τρόπος Πληρωμής" section to checkout
- COD always available ("Αντικαταβολή")
- Card option appears only when `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true`
- Button text changes: "Ολοκλήρωση Παραγγελίας" (COD) vs "Συνέχεια στην Πληρωμή" (Card)

### Flow

```
COD Flow (unchanged):
  Form → Create Order → Redirect to /order/{id}

Card Flow (new):
  Form → Create Order (payment_method=CARD)
       → POST /payments/checkout → Get Stripe URL
       → Redirect to Stripe Checkout
       → Stripe webhook → Update payment_status=paid
       → User returns to /thank-you?id={id}
```

## Files Changed

| File | Changes |
|------|---------|
| `backend/database/migrations/2025_12_28_160000_...` | New |
| `backend/config/payments.php` | New |
| `backend/app/Models/Order.php` | +2 fillable fields |
| `backend/app/Http/Controllers/Api/V1/PaymentCheckoutController.php` | New |
| `backend/app/Http/Controllers/Api/V1/StripeWebhookController.php` | New |
| `backend/app/Http/Resources/OrderResource.php` | +2 fields |
| `backend/routes/api.php` | +8 lines |
| `backend/composer.json` | +stripe/stripe-php |
| `backend/.env.example` | +6 lines |
| `frontend/src/lib/api.ts` | +30 lines |
| `frontend/src/app/(storefront)/checkout/CheckoutClient.tsx` | +80 lines |
| `frontend/.env.example` | +3 lines |
| `backend/tests/Feature/PaymentWebhookTest.php` | New (8 tests) |
| `frontend/tests/e2e/pass-51-payments.spec.ts` | New (6 tests) |

## How to Enable Card Payments

### Backend (.env)
```bash
PAYMENTS_CARD_FLAG=true
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env)
```bash
NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true
```

### Stripe Webhook Setup
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://dixis.gr/api/v1/webhooks/stripe`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing

### Backend Tests (8 tests)
- Webhook without signature → 400
- Webhook with invalid signature → 400
- Webhook without secret configured → 503
- Payment status transitions
- Idempotent webhook handling
- Payment provider/reference fields

### E2E Tests (6 tests)
- COD flow regression
- Card option hidden when flag disabled
- Card option visible when flag enabled
- Card payment redirect (mocked)
- Order displays payment method
- Payment selector test IDs

### Webhook Simulation
```bash
# Simulate successful payment
curl -X POST https://dixis.gr/api/v1/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=...,v1=..." \
  -d '{"type":"checkout.session.completed",...}'
```

## DoD Checklist

- [x] Backend: payment_provider + payment_reference fields
- [x] Backend: Payment config with feature flag
- [x] Backend: Stripe Checkout Session endpoint
- [x] Backend: Webhook handler with signature validation
- [x] Backend: Idempotent webhook handling
- [x] Frontend: Payment method selector
- [x] Frontend: Card option with feature flag
- [x] Frontend: Stripe redirect flow
- [x] COD unchanged (regression protected)
- [x] Backend tests: 8 tests
- [x] E2E tests: 6 tests
- [x] TypeScript passes
- [ ] CI green
- [ ] PR merged
- [ ] Docs updated

## Next Passes

- **Pass 52**: Email notifications (order confirmation, payment receipt)
- **Pass 53**: Refund handling

---
Generated-by: Claude (Pass 51)
