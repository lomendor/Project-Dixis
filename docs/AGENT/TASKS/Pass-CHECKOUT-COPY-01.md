# Pass-CHECKOUT-COPY-01: Fix Misleading Shipping/VAT Note

**Status**: ✅ COMPLETE
**PR**: TBD
**Date**: 2026-01-26

---

## Problem Statement

The checkout page displays misleading copy to users:
- **Greek**: "Τα μεταφορικά και ο ΦΠΑ θα υπολογιστούν στο επόμενο βήμα"
- **English**: "Shipping and VAT will be calculated in the next step"

This is incorrect because:
1. VAT is **not implemented** (TaxService exists but is never called - see Pass-MULTI-PRODUCER-SHIPPING-AUDIT-01)
2. Shipping is already calculated at checkout (€3.50 per producer, free over €35)

## Solution

Updated the `shippingNote` translation to be truthful and informative:

| Language | Before | After |
|----------|--------|-------|
| Greek | Τα μεταφορικά και ο ΦΠΑ θα υπολογιστούν στο επόμενο βήμα | Μεταφορικά: €3.50 ανά παραγωγό (δωρεάν άνω των €35) |
| English | Shipping and VAT will be calculated in the next step | Shipping: €3.50 per producer (free over €35) |

## Files Changed

| File | Change |
|------|--------|
| `frontend/messages/el.json` | Line 240: Updated shippingNote |
| `frontend/messages/en.json` | Line 240: Updated shippingNote |
| `frontend/tests/e2e/checkout-copy-regression.spec.ts` | New: Regression test |

## Regression Test

Added Playwright test that:
1. Navigates to checkout with an item in cart
2. Locates the shipping note element
3. Asserts note does NOT contain "VAT" or "ΦΠΑ"
4. Asserts note DOES contain shipping info (€3.50, per producer)

## Acceptance Criteria

- [x] Greek copy updated - no VAT mention
- [x] English copy updated - no VAT mention
- [x] Regression test added
- [x] Lint passes
- [x] CI will validate test

## Related

- Pass-MULTI-PRODUCER-SHIPPING-AUDIT-01: Documents that VAT is not implemented
