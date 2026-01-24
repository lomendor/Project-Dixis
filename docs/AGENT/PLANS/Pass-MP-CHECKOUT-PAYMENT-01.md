# Plan: Pass-MP-CHECKOUT-PAYMENT-01

**Date**: 2026-01-24
**Status**: COMPLETE
**Author**: Claude Code

---

## Goal

Fix multi-producer checkout correctness issues:
1. ~~Email confirmation sent at wrong time (before payment completes)~~ **VERIFIED: Already correct**
2. ~~Payment confirmation endpoint returning 400 errors~~ **VERIFIED: Backend logic correct**
3. UI showing success despite payment failures **FIXED**
4. ~~Shipping displayed incorrectly for multi-producer orders~~ **VERIFIED: API correct, frontend uses shipping_amount**

---

## Non-Goals

- UI redesign or new features
- Payment provider changes (Stripe stays)
- Refactoring routing or controller structure
- Performance optimization

---

## Acceptance Criteria

| AC | Description | Test | Status |
|----|-------------|------|--------|
| AC1 | COD orders: Email sent immediately at order creation | `test_cod_order_triggers_email_at_creation` | PASS |
| AC2 | Card orders: Email sent ONLY after payment confirmed | `test_card_order_does_not_trigger_email_at_creation` | PASS |
| AC3 | Payment confirm 400 error surfaces actionable error to user | Already handled in checkout page | PASS |
| AC4 | UI does NOT show "success" when payment fails | Frontend fix: removed premature toast | PASS |
| AC5 | shipping_total in response equals sum of shipping_lines | Existing `MultiProducerShippingTest` | PASS |
| AC6 | Frontend displays correct shipping total for multi-producer | Uses `shipping_amount` from API | VERIFIED |

---

## Investigation Results

### 1. Email Trigger Analysis
- **OrderController.php (lines 250-263)**: Already has HOTFIX - only sends email for COD orders
- **PaymentController.php (lines 131-142)**: Email sent after payment confirmation for Card
- **Conclusion**: Backend email logic is CORRECT

### 2. Payment Flow Analysis
- **PaymentController.php**: Returns 400 when `$result['success']` is false (line 123-128)
- **Frontend checkout**: Already handles 400 by setting error state
- **BUG FOUND**: StripePaymentForm.tsx showed success toast BEFORE backend confirmation

### 3. Shipping Display Analysis
- **OrderResource.php**: Returns `shipping_amount`, `shipping_cost`, and `shipping_total` (for multi-producer)
- **Thank-you page**: Uses `shipping_amount` or `shipping_cost` - correct for current flow
- **Note**: Multi-producer checkout is blocked by HOTFIX, so `shipping_total` not yet needed

---

## Changes Made

### Frontend
1. **StripePaymentForm.tsx**: Removed premature success toast (line 51)
   - Toast was shown BEFORE backend confirmed payment
   - Now parent handles toast AFTER backend confirmation

2. **checkout/page.tsx**: Added success toast after backend confirmation
   - Imported `useToast` from ToastContext
   - Added `showToast('success', ...)` after `confirmPayment` succeeds

### Backend (Tests)
3. **OrderEmailTriggerRulesTest.php**: 3 new tests documenting email trigger rules
   - `test_cod_order_triggers_email_at_creation`
   - `test_card_order_does_not_trigger_email_at_creation`
   - `test_card_order_email_sent_after_payment_confirmation`

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking existing COD flow | Added regression test for COD email |
| Payment webhook timing | Ensure email also triggers from webhook |
| Frontend complexity | Minimal changes, focus on error handling |

---

## Definition of Done

- [x] Backend: Email only sent for confirmed payments (Card) or at creation (COD) - **VERIFIED**
- [x] Backend: Payment confirm endpoint handles errors gracefully - **VERIFIED**
- [x] Frontend: Shows error message on payment failure (not success) - **FIXED**
- [x] Frontend: Displays correct shipping total - **VERIFIED**
- [x] Tests: 3 backend tests for email trigger rules - **ADDED**
- [ ] CI: All tests green - **PENDING PR**
- [ ] PR: Merged with ai-pass label - **PENDING**

---

## Evidence Required

- [x] Test output showing email trigger rules: 3/3 pass
- [x] Frontend fix: StripePaymentForm.tsx, checkout/page.tsx
- [x] Shipping verified: API returns correct shipping_amount

---

_Pass-MP-CHECKOUT-PAYMENT-01 | 2026-01-24_
