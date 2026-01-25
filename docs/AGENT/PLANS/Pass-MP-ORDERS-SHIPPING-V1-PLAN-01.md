# Plan: Pass-MP-ORDERS-SHIPPING-V1-PLAN-01

**Date**: 2026-01-25
**Status**: PROPOSED
**Author**: Claude Agent
**Scope**: Multi-producer order splitting + per-producer shipping

---

## Goal

Enable customers to checkout with products from multiple producers, creating a logically unified purchase that:
1. Appears as one transaction to the customer
2. Splits fulfillment by producer
3. Charges shipping per producer
4. Sends emails only after payment confirmation

---

## Current State

| Layer | Status | Evidence |
|-------|--------|----------|
| Cart | Multi-producer enabled | PR #2444 |
| Checkout UI | Blocked with message | PR #2448, #2465 |
| Backend shipping | Per-producer lines | PR #2456, #2458 |
| Email timing | COD=creation, CARD=confirmation | PR #2460 |
| Production | Verified blocked | Pass MP-PAY-EMAIL-TRUTH-01 |

**Blocking reason**: No order splitting implementation yet.

---

## Proposed Model: Parent-Child Orders

### Architecture

```
CheckoutSession (parent)
    ├── Order A (producer 1)
    │   ├── items from producer 1
    │   ├── shipping_line (€3.50 or free)
    │   └── status: pending_payment
    ├── Order B (producer 2)
    │   ├── items from producer 2
    │   ├── shipping_line (€3.50 or free)
    │   └── status: pending_payment
    └── PaymentIntent (Stripe)
        └── amount = sum(Order A + Order B)
```

### Database Changes

| Table | Change | Purpose |
|-------|--------|---------|
| `checkout_sessions` | NEW | Parent entity for multi-producer checkout |
| `orders.checkout_session_id` | ADD FK | Link child orders to parent |
| `orders.is_child_order` | ADD bool | Distinguish from standalone orders |

### Key Invariants

1. **Single Payment**: One Stripe PaymentIntent per CheckoutSession
2. **Atomic Status**: All child orders succeed or fail together
3. **Independent Fulfillment**: Each producer fulfills their order independently
4. **Unified Customer View**: Customer sees one "purchase" in history

---

## Payment Strategy

### Option A: Multiple PaymentIntents (REJECTED)
- One payment per producer
- Pro: Cleaner failure handling
- Con: Complex UX, multiple charges on statement

### Option B: Single PaymentIntent (SELECTED)

**Rationale**:
- Better customer experience (one charge)
- Simpler Stripe integration
- Standard marketplace pattern
- Matches customer mental model

**Implementation**:
```
1. Customer submits checkout
2. Backend creates CheckoutSession + N child Orders
3. Backend creates 1 PaymentIntent for total amount
4. Customer completes payment
5. Webhook updates ALL child orders to paid
6. Emails sent to customer + each producer
```

---

## Email Timing Rules

| Payment Method | Email Trigger | Why |
|----------------|---------------|-----|
| COD | Order creation | Customer committed, producer must prepare |
| CARD | Payment confirmation (webhook) | Only send on actual payment success |
| BANK_TRANSFER | Manual confirmation | Admin marks paid |

**Multi-producer emails**:
- Customer: 1 email with all items, grouped by producer
- Producers: 1 email each with only their items

---

## Shipping Calculation (V1)

Already implemented in PR #2458:

| Condition | Per-Producer Shipping |
|-----------|----------------------|
| PICKUP | €0.00 |
| Subtotal >= €35 | €0.00 |
| Otherwise | €3.50 |

**Total shipping** = Sum of all producer shipping lines

---

## Acceptance Criteria

### AC1: Multi-producer checkout completes successfully
```gherkin
Given cart has items from producers A and B
When customer completes checkout with CARD payment
Then 1 CheckoutSession created
And 2 child Orders created (one per producer)
And 1 PaymentIntent created for total amount
And customer is redirected to thank-you page
```

### AC2: Emails sent only after payment confirmation
```gherkin
Given multi-producer order with CARD payment
When Stripe webhook confirms payment
Then customer receives 1 confirmation email
And producer A receives order notification
And producer B receives order notification
And no emails sent before webhook
```

### AC3: Shipping calculated per producer
```gherkin
Given cart with:
  - Producer A: €40 subtotal (free shipping)
  - Producer B: €15 subtotal (€3.50 shipping)
When order is created
Then total shipping = €3.50
And Producer A shipping_line.cost = €0.00
And Producer B shipping_line.cost = €3.50
```

### AC4: Order history shows unified view
```gherkin
Given completed multi-producer checkout
When customer views order history
Then they see 1 "purchase" entry
And can expand to see per-producer details
```

### AC5: Producer sees only their items
```gherkin
Given completed multi-producer checkout
When producer A views their orders
Then they see only items they need to fulfill
And they don't see producer B's items
```

---

## Implementation Phases

### Phase 1: Schema + Model (1 PR, ~100 LOC)
- Create `checkout_sessions` table
- Add `checkout_session_id` FK to orders
- Add `CheckoutSession` model with relations
- Unit tests

### Phase 2: Backend Order Splitting (1 PR, ~150 LOC)
- Modify `OrderController@store` to detect multi-producer
- Create CheckoutSession + child Orders
- Create single PaymentIntent
- Feature tests

### Phase 3: Webhook + Email (1 PR, ~100 LOC)
- Update Stripe webhook to handle multi-producer
- Update email triggers for child orders
- Integration tests

### Phase 4: Frontend Unblock (1 PR, ~50 LOC)
- Remove render-time block in checkout/page.tsx
- Remove submit-time block in handleSubmit
- Display per-producer shipping breakdown
- E2E tests

### Phase 5: Customer Order History (1 PR, ~100 LOC)
- Group child orders by CheckoutSession
- Show unified "purchase" view
- Expandable producer details

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Partial payment failure | Orders in limbo | Atomic transaction: all or nothing |
| Webhook race condition | Double email send | Idempotency key on webhook handler |
| Producer confusion | Support tickets | Clear email subject: "New Order from Dixis" |
| Refund complexity | Manual process | V1: Full refund only, partial in V2 |
| Rollback needed | Feature unusable | Keep blocking guards as feature flag |

---

## Out of Scope (V1)

- Partial refunds (manual for now)
- Split delivery dates
- Producer-specific payment timing
- Advanced shipping zones

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Multi-producer checkout success rate | >= 95% |
| Email delivery within 5 min of payment | >= 99% |
| Producer fulfillment time | No regression |
| Customer support tickets | < 5% increase |

---

## Dependencies

- Stripe PaymentIntents API (existing)
- Existing `order_shipping_lines` table (PR #2456)
- Email service (existing)

---

## Open Questions

1. **Refund flow**: Should refund cancel all child orders or allow partial?
   - **Recommendation**: V1 = full refund only

2. **Inventory reservation**: Should we reserve inventory at cart or checkout?
   - **Recommendation**: Checkout (current behavior)

3. **Feature flag**: Should we use a flag to gradually roll out?
   - **Recommendation**: Yes, for safety

---

_Pass-MP-ORDERS-SHIPPING-V1-PLAN-01 | 2026-01-25 | PROPOSED_
