# AG121: MVP Checkout (Order Intent)

**Goal**: Enable customers to create draft orders from cart and submit basic contact info (no payments, no polish).

## Scope
- **Zero migrations**: Use existing AG130 Order/OrderItem schema
- **Hybrid API**: New `/api/order-intents` for draft management + existing `/api/checkout` for submit
- **Price handling**: Cart uses priceCents (Int), DB uses price (Float) - convert in API layer
- **Status flow**: Use existing "pending" status for drafts (not "draft")

## Implementation (~2.5h, ~235 LOC)
1. ✅ Branch & TL;DR (feat/AG121-order-intent)
2. API: POST `/api/order-intents` (create draft from cart items)
3. API: GET `/api/order-intents/[id]` (fetch order)
4. API: PATCH `/api/order-intents/[id]` (submit with email/name)
5. Frontend: Cart button → create draft → redirect to /checkout?orderId=X
6. Frontend: /checkout page - fetch order, show items, form (email/name/address)
7. Frontend: /thank-you?id=X page - fetch order, show confirmation
8. E2E: `checkout-mvp.spec.ts` (add to cart → checkout → submit → verify)
9. Commit & PR (with green CI)
10. Verify & Report

## Key Files
- `frontend/src/app/api/order-intents/route.ts` - POST (create draft)
- `frontend/src/app/api/order-intents/[id]/route.ts` - GET/PATCH
- `frontend/src/app/cart/page.tsx` - wire "Συνέχεια" button
- `frontend/src/app/checkout/page.tsx` - fetch order, show form
- `frontend/src/app/thank-you/page.tsx` - show confirmation
- `frontend/tests/e2e/checkout-mvp.spec.ts` - E2E test

## STOP Criteria
- ❌ Any migration (schema already sufficient)
- ❌ Payment integration (AG122)
- ❌ VPS deployment (PR + CI first)
- ❌ Polish/styling (MVP only)

## Success Criteria
- ✅ Cart → draft order → /checkout flow works
- ✅ Order submission updates DB (email/name/status)
- ✅ E2E test passes
- ✅ CI green
- ✅ PR ≤300 LOC
