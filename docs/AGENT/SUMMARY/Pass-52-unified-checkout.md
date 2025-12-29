# Pass 52 — Unified Payment Selector (Stripe Canonical)

**Date**: 2025-12-29
**Status**: CLOSED

## TL;DR

Unified checkout to single implementation. Removed Viva Wallet from UI, added Stripe as canonical card payment provider gated by feature flag. Deprecated unused `CheckoutClient.tsx`.

## Problem

Two parallel checkout implementations existed:
1. **`page.tsx`** (used) - had Viva Wallet option that wasn't configured
2. **`CheckoutClient.tsx`** (unused) - had Stripe with feature flag

Users saw "Κάρτα (Viva Wallet)" option but it didn't work because Viva wasn't configured. Meanwhile, Stripe was set up but the checkout page wasn't using the Stripe-enabled component.

## Solution

### 1. PaymentMethodSelector.tsx
- Removed Viva Wallet option entirely
- Added Stripe-backed "Κάρτα" option
- Gated by `NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true'` (build-time check)
- COD always available

### 2. Checkout page.tsx
- Added `cardProcessing` state for loading UX
- Card payments call `apiClient.createPaymentCheckout(orderId)`
- Redirects to Stripe Checkout on success
- Button text changes based on payment method

### 3. CheckoutClient.tsx Deprecation
- Added deprecation header comment
- No routes import it (verified via grep)
- Will delete after Stripe rollout verified stable

### 4. E2E Test
- `checkout-payment-selector.spec.ts`
- Verifies COD always visible
- Verifies card option gated by flag
- Verifies button text changes

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/checkout/PaymentMethodSelector.tsx` | Viva → Stripe, flag-gated |
| `frontend/src/app/(storefront)/checkout/page.tsx` | Card payment flow, button text |
| `frontend/src/app/(storefront)/checkout/CheckoutClient.tsx` | Deprecated header |
| `frontend/tests/e2e/checkout-payment-selector.spec.ts` | New E2E test |

## Type Definitions

```typescript
// PaymentMethodSelector.tsx
export type PaymentMethod = 'cod' | 'card'  // was 'cod' | 'viva'
```

## Payment Flow

1. User selects payment method (COD or Card if flag enabled)
2. Submit creates order via Laravel API with `payment_method: 'COD' | 'CARD'`
3. **COD**: Clear cart → redirect to thank-you page
4. **Card**: Create order → call `createPaymentCheckout(orderId)` → redirect to Stripe Checkout

## Risks

1. **Build-time flag**: `NEXT_PUBLIC_PAYMENTS_CARD_FLAG` must be set in deploy workflow at build time
2. **Stripe backend**: Requires `createPaymentCheckout` endpoint (exists in Pass 51)
3. **VPS config**: Stripe keys must be in backend .env (configured earlier this session)

## Verification

- [ ] TypeScript passes (`pnpm tsc --noEmit`)
- [ ] Lint passes (`pnpm lint`)
- [ ] E2E test added (CI will run when backend available)
- [ ] Deploy with `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true` to see card option

## Next Steps

1. Merge PR
2. Deploy triggers rebuild with flag enabled
3. Verify card option appears on https://dixis.gr/checkout
4. Test full Stripe payment flow
5. If stable, delete CheckoutClient.tsx in future pass
