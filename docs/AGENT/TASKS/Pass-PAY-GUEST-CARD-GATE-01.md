# Pass-PAY-GUEST-CARD-GATE-01: Gate Card Payment for Guests

**Date**: 2026-01-27
**Status**: COMPLETE
**PR**: https://github.com/lomendor/Project-Dixis/pull/2502

---

## Task Overview

Make the checkout UI truthful: guests cannot use card payment (backend requires auth:sanctum), so UI must hide card option and prevent payment init calls for guests.

---

## Tasks

### 1. Verify Root Cause
- [x] Confirm payment init endpoint requires `auth:sanctum` (backend/routes/api.php:285)
- [x] Confirm order creation uses `auth.optional` (allows guests)
- [x] Confirm guest card payment fails with 401 Unauthenticated

### 2. Verify Existing UI Gate
- [x] PaymentMethodSelector already hides card for guests (line 28: `flagEnabled && isAuthenticated`)
- [x] PaymentMethodSelector resets to COD if card selected while unauthenticated (lines 31-33)
- [x] Production test confirms card NOT visible for guests

### 3. Add Visible Notice
- [x] Add amber notice box with login link for guests
- [x] Add `data-testid="guest-card-notice"` for testing
- [x] Message: "Για πληρωμή με κάρτα απαιτείται σύνδεση."

### 4. Add Submit Hard-Guard
- [x] Add check at start of handleSubmit: if guest + card, show error and return
- [x] Defense in depth - guarantees no paymentApi.initPayment for guests

### 5. Fix Flaky Auth Test
- [x] Replace UI element check with localStorage auth_token check
- [x] Verify test passes consistently

### 6. Add E2E Tests
- [x] Create `guest-checkout-card-gate.spec.ts`
- [x] GATE1: Guest does NOT see card option
- [x] GATE2: Guest COD checkout works, NO payment init call

### 7. Verify All Tests Pass
- [x] Run guest-checkout-card-gate.spec.ts against production: 2/2 PASSED
- [x] Run card-payment-real-auth.spec.ts: 4/4 PASSED
- [x] All 6 related tests pass

### 8. Create PR
- [x] Create branch `feat/passPAY-guest-card-gate-01`
- [x] Commit with descriptive message
- [x] Push and create PR #2502
- [x] Add `ai-pass` label

### 9. CI Verification
- [x] quality-gates: PASS
- [x] build-and-test: PASS
- [x] E2E (PostgreSQL): PASS

### 10. Merge & Deploy
- [x] Merge PR #2502
- [x] Verify deployment (frontend changes)

### 11. Documentation
- [x] Create docs/AGENT/TASKS/Pass-PAY-GUEST-CARD-GATE-01.md
- [x] Create docs/AGENT/SUMMARY/Pass-PAY-GUEST-CARD-GATE-01.md
- [x] Update docs/OPS/STATE.md

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/app/(storefront)/checkout/page.tsx` | +7 lines (submit hard-guard) |
| `frontend/src/components/checkout/PaymentMethodSelector.tsx` | +4/-5 lines (visible notice) |
| `frontend/tests/e2e/card-payment-real-auth.spec.ts` | +7/-4 lines (fix flaky auth test) |
| `frontend/tests/e2e/guest-checkout-card-gate.spec.ts` | NEW: 152 lines (gate tests) |

---

## Evidence

**Guest Checkout (production test)**:
```
GATE1: Guest user does NOT see card payment option
Card option visible: false
COD option is visible and checked
PASSED

GATE2: Guest COD checkout succeeds without payment init call
Order API: 201
Payment init NOT called - CORRECT for COD
Reached thank-you page
PASSED
```

**Logged-in Card Payment (real auth test)**:
```
Order creation status: 201
Payment init status: 200
Payment init has client_secret: true
Stripe Elements loaded successfully!
PASSED
```

---

_Pass-PAY-GUEST-CARD-GATE-01 | 2026-01-27 | COMPLETE_
