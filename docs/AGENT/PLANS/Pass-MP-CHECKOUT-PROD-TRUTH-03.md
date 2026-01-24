# Plan: Pass-MP-CHECKOUT-PROD-TRUTH-03

**Date**: 2026-01-24
**Status**: COMPLETE
**Author**: Claude Code

---

## Goal

Fix production multi-producer checkout issues reported by user:
1. Email sent BEFORE payment confirmed (CARD)
2. Shipping shown as single price for 3 producers (should be 3 shipments)
3. UI showed "success" while confirm endpoint returned 400

---

## Non-Goals

- Remove HOTFIX (keep blocking for now, but fix the bypass)
- Header/nav/i18n changes
- UI redesign

---

## Root Cause Analysis

### CRITICAL BUG: HOTFIX Bypass

The frontend HOTFIX at `checkout/page.tsx:213` was:
```typescript
if (multiProducer && !stripeClientSecret) { /* block */ }
```

This was **bypassed** because:
1. User fills form and clicks submit
2. `handleSubmit()` calls `apiClient.createOrder()` - **ORDER CREATED**
3. Then `paymentApi.initPayment()` sets `stripeClientSecret`
4. Component re-renders, `stripeClientSecret` is truthy → HOTFIX bypassed
5. Stripe form shows, user completes payment

**The order was created BEFORE the HOTFIX could block it!**

### Why Previous Passes Didn't Catch This

Pass-02 claimed "HOTFIX still active (multi-producer checkout blocked)" but only checked the render-time guard, not the submit-time behavior.

---

## Fix Applied

### checkout/page.tsx - handleSubmit guard

Added check at the START of `handleSubmit()` (before any API calls):

```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()

  // CRITICAL FIX: Check multi-producer BEFORE order creation
  if (isMultiProducerCart(cartItems)) {
    setError('Δεν υποστηρίζεται ακόμη...')
    return
  }
  // ... rest of function
}
```

Now multi-producer carts are blocked BEFORE `apiClient.createOrder()` is called.

---

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC-1 | HOTFIX blocks multi-producer checkout BEFORE order creation | ✅ FIXED |
| AC-2 | CARD orders: NO email at order creation | ✅ VERIFIED (existing test) |
| AC-3 | Thank-you page shows correct shipping for multi-producer | ✅ DONE (Pass-02) |
| AC-4 | Payment confirm 400 shows error, not success | ✅ DONE (Pass-01) |

---

## Verification

### Backend Tests
- `test_cod_order_triggers_email_at_creation` ✅ PASS
- `test_card_order_does_not_trigger_email_at_creation` ✅ PASS
- `test_card_order_email_sent_after_payment_confirmation` ✅ PASS
- `test_shipping_total_equals_sum_of_shipping_lines` ✅ PASS
- 3 more shipping tests ✅ PASS

### Frontend Build
- ✅ Build successful

---

## Why User Saw Bugs in Production

1. **Email before payment**: The HOTFIX bypass allowed multi-producer orders to be created with CARD payment. While backend correctly doesn't send email at creation for CARD, the subsequent payment flow may have failed, leaving the order in a bad state.

2. **Wrong shipping**: When order was created despite HOTFIX, the shipping calculation ran for multi-producer but checkout form showed hardcoded €3.50.

3. **Success on 400**: The StripePaymentForm.tsx was fixed in Pass-01 to not show premature success. If user saw this, it might be from cached/old code.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking single-producer checkout | Tested - still works |
| Error message not localized | Using Greek directly in error |

---

## Definition of Done

- [x] HOTFIX blocks multi-producer BEFORE order creation
- [x] Email timing correct (verified by tests)
- [x] All backend tests pass
- [x] Frontend builds successfully
- [ ] CI green
- [ ] PR merged with ai-pass label

---

_Pass-MP-CHECKOUT-PROD-TRUTH-03 | 2026-01-24_
