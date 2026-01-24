# Plan: Pass-MP-MULTI-PRODUCER-CHECKOUT-02

**Date**: 2026-01-24
**Status**: COMPLETE
**Author**: Claude Code

---

## Goal

Enable correct multi-producer checkout behavior:
A) Shipping total reflects multiple shipments (sum per producer) ✅
B) Order confirmation email NOT sent before payment confirmed (CARD/Stripe) ✅
C) Checkout does NOT show success when confirm endpoint returns 400 ✅ (Fixed in MP-CHECKOUT-PAYMENT-01)
D) Order state remains consistent: unpaid/pending until confirmed ✅

---

## Non-Goals

- Remove multi-producer checkout HOTFIX (keep blocking for now)
- UI redesign or new features
- Change payment providers
- Performance optimization

---

## Acceptance Criteria

| AC | Description | Test | Status |
|----|-------------|------|--------|
| AC-A1 | API returns `shipping_total` = sum of `shipping_lines[].shipping_cost` | `test_shipping_total_equals_sum_of_shipping_lines` | PASS |
| AC-A2 | Frontend displays shipping total from API `shipping_total` field | thank-you page updated | DONE |
| AC-B1 | COD orders: email sent at creation | `test_cod_order_triggers_email_at_creation` | PASS |
| AC-B2 | CARD orders: email NOT sent at order creation | `test_card_order_does_not_trigger_email_at_creation` | PASS |
| AC-B3 | CARD orders: email sent ONLY after payment confirmed | `test_card_order_email_sent_after_payment_confirmation` | PASS |
| AC-C1 | Payment confirm 400 does NOT show success toast | Fixed in MP-CHECKOUT-PAYMENT-01 | DONE |
| AC-C2 | Payment confirm 400 shows error message to user | Frontend already handles | VERIFIED |
| AC-D1 | Order status = pending until payment confirmed | Backend default | VERIFIED |

---

## Changes Made

### Frontend
1. **api.ts**: Added `ShippingLine` interface and `shipping_total`, `shipping_lines`, `is_multi_producer` to Order type
2. **thank-you/page.tsx**:
   - Prefers `shipping_total` over `shipping_amount` when available
   - Shows "Μεταφορικά (σύνολο):" for multi-producer orders
   - Added `isMultiProducer` field to local Order interface

### Backend (Tests)
3. **MultiProducerShippingTotalTest.php**: 3 new tests
   - `test_shipping_total_equals_sum_of_shipping_lines`
   - `test_shipping_total_with_free_shipping_on_one_producer`
   - `test_single_producer_order_not_multi_producer`

---

## Investigation Results

### Current State
- HOTFIX still blocks multi-producer checkout (frontend blocks cart with 2+ producers)
- API already returns `shipping_total` and `shipping_lines` when shippingLines relation is loaded
- Frontend was NOT using `shipping_total` - now fixed

### Email Trigger Rules
- Verified in MP-CHECKOUT-PAYMENT-01:
  - COD: email at order creation
  - CARD: email only after payment confirmation (PaymentController)

### Order State
- Orders created with status=pending, payment_status=pending
- Backend only updates after payment confirmed

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking COD flow | Existing regression tests |
| HOTFIX removal breaks checkout | Keep HOTFIX in place |
| Email double-send | Idempotency already in place |

---

## Definition of Done

- [x] Backend: `shipping_total` = sum of shipping lines (VERIFIED + TESTED)
- [x] Frontend: Uses `shipping_total` from API for display (UPDATED)
- [x] Backend: Email rules enforced (COD=creation, CARD=after confirm) (VERIFIED)
- [x] Tests: 3 backend tests for shipping total correctness (ADDED)
- [x] Tests: Email tests from MP-CHECKOUT-PAYMENT-01 cover AC-B (EXISTING)
- [ ] CI: All tests green (PENDING PR)
- [ ] PR: Merged with ai-pass label (PENDING)

---

## Evidence Required

- [x] API response showing correct `shipping_total` for multi-producer order: Tests verify
- [x] Frontend builds successfully
- [x] 11 backend tests pass (routing, email, shipping total)

---

_Pass-MP-MULTI-PRODUCER-CHECKOUT-02 | 2026-01-24_
