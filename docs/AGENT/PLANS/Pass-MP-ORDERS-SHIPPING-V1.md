# PLAN: Pass-MP-ORDERS-SHIPPING-V1

**Date**: 2026-01-24
**Status**: DRAFT — Awaiting Approval
**Scope**: Enable multi-producer checkout with per-producer shipping (V1)
**Supersedes**: HOTFIX-MP-CHECKOUT-GUARD-01 (temporary block)

---

## Goal

Remove the temporary checkout block and enable real multi-producer checkout:
1. Split checkout into per-producer suborders
2. Calculate shipping per producer
3. Single payment for entire order group
4. Clear customer UX showing per-producer breakdown

## Non-Goals

- Producer dashboard changes (V2)
- Advanced shipping carriers/rates (use existing zones)
- Split payments (single payment covers all suborders)
- International shipping
- Weight-based pricing refinements
- Time slot delivery

---

## Current State (Post-HOTFIX)

| Component | Status |
|-----------|--------|
| Multi-producer cart | ✅ Enabled (items from N producers) |
| Checkout UI | ❌ Blocked with Greek message |
| Backend API | ❌ Returns 422 for N>1 producers |
| Shipping calc | Single flat rate (not per-producer) |
| Email timing | ✅ COD at creation, CARD after payment |

---

## Proposed Data Model (Minimal)

### Option: Order Shipping Lines (Simpler V1)

Keep existing `orders` table, add shipping breakdown:

```sql
-- New table
CREATE TABLE order_shipping_lines (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  producer_id INTEGER NOT NULL,
  producer_name VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  shipping_method VARCHAR(50),
  free_shipping_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_osl_order_id ON order_shipping_lines(order_id);
CREATE INDEX idx_osl_producer_id ON order_shipping_lines(producer_id);
```

**Why not Order Groups?**
- V1 simplicity: Single order, single payment, single confirmation
- Existing admin/producer dashboards work with filter by `order_items.producer_id`
- Order Groups can be added in V2 if needed for fulfillment tracking

---

## API Changes

### 1. Order Creation (`POST /api/v1/orders`)

**Before (current)**: Rejects multi-producer with 422

**After**:
```json
{
  "items": [...],
  "shipping_method": "HOME",
  "shipping_address": {...},
  "currency": "EUR"
}

// Response includes shipping breakdown
{
  "order": {
    "id": 123,
    "subtotal": 45.00,
    "shipping_cost": 8.50,  // Sum of all producer shipping
    "total": 53.50,
    "shipping_lines": [
      { "producer_id": 1, "producer_name": "Παπαδόπουλος", "subtotal": 27.00, "shipping_cost": 3.50 },
      { "producer_id": 4, "producer_name": "Δημητρίου", "subtotal": 18.00, "shipping_cost": 5.00 }
    ]
  }
}
```

### 2. Shipping Quote (`POST /api/v1/shipping/quote`)

**New optional param**: `per_producer: true`

```json
{
  "postal_code": "10552",
  "items": [
    { "product_id": 1, "quantity": 2, "producer_id": 1 },
    { "product_id": 6, "quantity": 1, "producer_id": 4 }
  ],
  "per_producer": true
}

// Response
{
  "total_shipping": 8.50,
  "producers": [
    { "producer_id": 1, "subtotal": 27.00, "shipping": 3.50, "free": false },
    { "producer_id": 4, "subtotal": 18.00, "shipping": 5.00, "free": false }
  ]
}
```

---

## Payment Flow

**Single payment for entire order** (no split payments):

1. Customer completes checkout form
2. Order created with all items, shipping_lines populated
3. Payment initialized for `order.total` (products + all shipping)
4. On payment success:
   - Order status → `processing`
   - Email sent to customer (single receipt)
   - Separate email to each producer (their items only)

---

## Email Timing Rules

| Payment Method | Customer Email | Producer Email(s) |
|----------------|----------------|-------------------|
| COD | On order creation | On order creation |
| CARD | After payment confirmed | After payment confirmed |

**Customer email**: Single receipt with all items grouped by producer
**Producer email**: Only their items + their shipping portion

---

## Shipping Calculation V1 (Simple)

### Rules

1. **Group cart items by producer_id**
2. **Per producer**:
   - Calculate subtotal
   - Look up shipping rate by customer postal zone
   - If subtotal ≥ €35 → free shipping
   - Store in `order_shipping_lines`
3. **Total shipping** = sum of all producer shipping costs

### Zone Lookup (Existing)

Uses existing `shipping_zones` + `shipping_rates` tables:
- Extract 2-digit prefix from postal code
- Look up zone → get rate by method

### Fallback (Existing)

If zone not found: €3.50 (HOME), €4.50 (COURIER), €0 (PICKUP)

### Future Validation

Later pass: Compare calculated shipping vs real courier quotes (ACS, ELTA, Courier Center) to calibrate rates.

---

## Checkout UX Changes

### Cart Page (Existing)

No change needed - cart already shows items.

### Checkout Page

Remove blocking message, show grouped breakdown:

```
┌─────────────────────────────────────────┐
│ Σύνοψη Παραγγελίας                      │
├─────────────────────────────────────────┤
│ Αγρόκτημα Παπαδόπουλος                  │
│   Ελαιόλαδο Εξαιρετικό Παρθένο  €15.00 │
│   Μέλι Θυμαρίσιο                 €12.00 │
│   Υποσύνολο:                     €27.00 │
│   Μεταφορικά:                     €3.50 │
├─────────────────────────────────────────┤
│ Οινοποιείο Δημητρίου                    │
│   Κρασί Αγιωργίτικο             €18.00 │
│   Υποσύνολο:                     €18.00 │
│   Μεταφορικά:                     €5.00 │
├─────────────────────────────────────────┤
│ ΣΥΝΟΛΟ                           €53.50 │
│ (Προϊόντα: €45.00 + Μεταφορικά: €8.50) │
└─────────────────────────────────────────┘
```

---

## Acceptance Criteria (Testable)

### AC1: Order Creation
- [ ] Multi-producer cart checkout succeeds (no 422)
- [ ] Order created with correct total
- [ ] `order_shipping_lines` populated per producer

### AC2: Shipping Calculation
- [ ] Each producer's shipping calculated independently
- [ ] Free shipping applied if producer subtotal ≥ €35
- [ ] Total shipping = sum of all producer shipping

### AC3: Checkout UX
- [ ] Items grouped by producer in order summary
- [ ] Per-producer subtotal + shipping visible
- [ ] Grand total clearly shown

### AC4: Emails
- [ ] Customer receives single receipt with breakdown
- [ ] Each producer receives email with only their items
- [ ] Emails sent at correct time (COD vs CARD)

### AC5: Backward Compatibility
- [ ] Single-producer orders work unchanged
- [ ] Existing orders unaffected

---

## Minimal E2E Tests (3 Critical)

### MPORDER1: Multi-producer checkout success
```
Given cart with items from 2 producers
When user completes checkout (COD)
Then order is created with correct totals
And order has 2 shipping_lines
And confirmation page shows grouped breakdown
```

### MPORDER2: Per-producer free shipping
```
Given cart: Producer A €40, Producer B €20
When checkout
Then Producer A shipping = €0 (free)
And Producer B shipping = €X (charged)
```

### MPORDER3: Email breakdown
```
Given multi-producer order created
When emails sent
Then customer email shows all items grouped
And producer A email shows only their items
And producer B email shows only their items
```

---

## Implementation Phases

| Phase | Scope | Est. LOC | PR |
|-------|-------|----------|-----|
| 1. Schema | Migration: `order_shipping_lines` | ~60 | #1 |
| 2. Backend | OrderController + shipping calc | ~200 | #2 |
| 3. Frontend | Checkout grouped UI | ~180 | #3 |
| 4. Emails | Per-producer email templates | ~100 | #4 |

**Total**: ~540 LOC across 4 PRs (all ≤300 LOC)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Migration breaks prod | Run on staging first, add index concurrently |
| Existing orders affected | Migration only creates new table, no ALTER on orders |
| Admin dashboard breaks | `shipping_lines` is additive, existing queries work |
| Shipping total mismatch | Store breakdown + validate sum = total |

---

## Open Questions (Resolve Before Implementation)

1. **PICKUP shipping**: If customer selects PICKUP, do all producers ship to same pickup point, or per-producer pickup?
   - **Proposal**: V1 = single pickup point (customer picks from closest)

2. **Producer without postal zone**: What if producer location not in shipping_zones?
   - **Proposal**: Use fallback rates (existing behavior)

3. **Order confirmation page**: New page needed or update existing?
   - **Proposal**: Update existing `/checkout/success` to show grouped breakdown

---

## Decision Required

**Approve this plan to proceed with Phase 1 (Schema)?**

---

_Pass-MP-ORDERS-SHIPPING-V1 | 2026-01-24_
