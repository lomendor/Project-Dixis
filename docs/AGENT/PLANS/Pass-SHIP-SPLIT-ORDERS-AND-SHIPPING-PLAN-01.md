# PLAN: Pass-SHIP-SPLIT-ORDERS-AND-SHIPPING-PLAN-01

**Date**: 2026-01-24
**Status**: DRAFT — Awaiting Approval
**Scope**: Multi-producer order splitting + per-producer shipping calculation

---

## Goal

Enable realistic shipping calculation for multi-producer carts by:
1. Splitting orders per producer at checkout
2. Calculating shipping independently per producer suborder
3. Preserving clear customer UX with transparent totals

## Non-Goals

- UI/header/i18n changes (out of scope)
- Payment gateway integration changes
- Producer dashboard modifications
- New shipping carriers or zones (use existing)

---

## Current State

### What Works (after Pass SHIP-MULTI-PRODUCER-ENABLE-01)

- Cart accepts products from multiple producers
- Single order created with all items
- `order_items.producer_id` preserves attribution
- Shipping calculated once for entire order (flat fee or zone-based)

### What's Missing

- Per-producer shipping calculation
- Order grouping/splitting by producer
- Customer visibility into per-producer shipping costs
- Producer-specific fulfillment tracking

---

## Proposed Model

### Option A: Order Group + Suborders (Recommended)

```
┌─────────────────────────────────────────┐
│           ORDER GROUP                   │
│  order_group_id: OG-12345              │
│  customer_id, payment_status, etc.     │
├─────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐
│  │ SUBORDER A       │ │ SUBORDER B       │
│  │ producer_id: 1   │ │ producer_id: 4   │
│  │ subtotal: €25.00 │ │ subtotal: €18.00 │
│  │ shipping: €3.50  │ │ shipping: €5.00  │
│  │ status: pending  │ │ status: pending  │
│  └──────────────────┘ └──────────────────┘
└─────────────────────────────────────────┘
```

**Database Changes**:
```sql
-- New table
CREATE TABLE order_groups (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id),
  payment_status VARCHAR(50),
  payment_method VARCHAR(50),
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Modify orders table
ALTER TABLE orders ADD COLUMN order_group_id INTEGER REFERENCES order_groups(id);
ALTER TABLE orders ADD COLUMN producer_id INTEGER REFERENCES producers(id);
-- Existing columns: subtotal, shipping_cost, total_amount (now per-producer)
```

**Pros**:
- Clean separation of concerns
- Each producer sees only their suborder
- Independent fulfillment tracking
- Easy to add per-producer receipts later

**Cons**:
- Schema migration required
- More complex order queries
- Admin dashboard needs update to show groups

### Option B: Single Order with Item Groups (Simpler)

Keep single `orders` table, add shipping breakdown:

```sql
-- New table for per-producer shipping
CREATE TABLE order_shipping_lines (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  producer_id INTEGER REFERENCES producers(id),
  shipping_cost DECIMAL(10,2),
  shipping_carrier VARCHAR(100),
  shipping_method VARCHAR(100),
  free_shipping_applied BOOLEAN DEFAULT FALSE
);
```

**Pros**:
- Minimal schema change
- Backward compatible
- Simpler implementation

**Cons**:
- Order still single entity
- Harder to track per-producer fulfillment
- Less flexible for future needs

### Recommendation: Option A

Option A provides better foundation for:
- Per-producer fulfillment
- Producer-specific order management
- Future multi-vendor marketplace features

---

## Shipping Calculation Strategy

### Current Inputs (Existing)

| Input | Source | Status |
|-------|--------|--------|
| Postal code | Cart page input | ✅ Available |
| City | Cart page input | ✅ Available |
| Cart subtotal | Calculated | ✅ Available |
| Shipping zones | `shipping_rules` table | ✅ Available |
| Free shipping threshold | Config (€35) | ✅ Available |

### Missing Inputs

| Input | Needed For | Proposal |
|-------|------------|----------|
| Producer location | Distance-based shipping | Add `producers.postal_code` |
| Per-producer subtotal | Free shipping threshold | Calculate at checkout |
| Producer shipping preferences | Override defaults | Add `producer_shipping_rules` (optional, Phase 2) |

### Calculation Flow

```
1. Group cart items by producer_id
2. For each producer group:
   a. Calculate subtotal
   b. Determine shipping zone (customer postal code)
   c. Apply shipping rate from shipping_rules
   d. Check if subtotal >= €35 → free shipping
   e. Store in order_shipping_lines
3. Sum all shipping lines for grand total
```

### Free Shipping Logic

Per SHIP-MULTI-PRODUCER-PLAN-01:
- Free shipping threshold: €35 **per producer suborder**
- If Producer A subtotal = €40, Producer B subtotal = €20:
  - Producer A: FREE shipping
  - Producer B: Standard shipping fee

---

## Customer UX

### Cart Page

```
┌─────────────────────────────────────────┐
│ Καλάθι Αγορών                          │
├─────────────────────────────────────────┤
│ Από: Αγρόκτημα Παπαδόπουλος            │
│   Ελαιόλαδο Εξαιρετικό Παρθένο  €15.00 │
│   Μέλι Θυμαρίσιο                 €12.00 │
│   Υποσύνολο:                     €27.00 │
│   Μεταφορικά:                     €3.50 │
├─────────────────────────────────────────┤
│ Από: Οινοποιείο Δημητρίου              │
│   Κρασί Αγιωργίτικο             €18.00 │
│   Υποσύνολο:                     €18.00 │
│   Μεταφορικά:                     €5.00 │
├─────────────────────────────────────────┤
│ ΣΥΝΟΛΟ:                          €53.50 │
│ (Προϊόντα: €45.00 + Μεταφορικά: €8.50) │
└─────────────────────────────────────────┘
```

### Order Confirmation

- Show each producer's items grouped
- Display per-producer shipping cost
- Grand total clearly broken down
- Separate tracking info per producer (when available)

### Email Receipt

- Single receipt email to customer
- Sections per producer
- Clear total breakdown

---

## Acceptance Criteria (Testable)

### AC1: Order Splitting
- [ ] Checkout with 2+ producers creates order_group + N suborders
- [ ] Each suborder has correct producer_id
- [ ] order_items linked to correct suborder

### AC2: Per-Producer Shipping Calculation
- [ ] Shipping calculated independently per producer
- [ ] Zone-based rates applied correctly
- [ ] Free shipping threshold (€35) applied per suborder

### AC3: Customer UX
- [ ] Cart page shows items grouped by producer
- [ ] Per-producer shipping costs visible
- [ ] Grand total = sum of all subtotals + all shipping

### AC4: Order Confirmation
- [ ] Confirmation page shows grouped items
- [ ] Per-producer totals visible
- [ ] Receipt email includes breakdown

### AC5: Backward Compatibility
- [ ] Existing single-producer orders unaffected
- [ ] Admin orders list works with new structure
- [ ] Producer dashboard shows their suborders only

### AC6: E2E Tests
- [ ] Multi-producer checkout creates correct order structure
- [ ] Shipping costs calculated per producer
- [ ] Free shipping applied when threshold met

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema migration complexity | Data integrity | Run migration in maintenance window, test on staging first |
| Admin dashboard breaks | Admin can't view orders | Update admin queries before migration |
| Existing orders corrupted | Lost data | Migration only affects new orders, old orders keep structure |
| Performance regression | Slow checkout | Add database indexes, optimize queries |
| Neon compute spike | Cost increase | Per SHIP-MULTI-PRODUCER-PLAN-01: pause preview branches, connection pooling |

---

## Implementation Phases

### Phase 1: Database Schema (This Pass)
- Create `order_groups` table
- Create `order_shipping_lines` table
- Add columns to `orders` table
- Migration script with rollback

### Phase 2: Backend Logic
- Update `OrderController.php` to create order groups
- Implement per-producer shipping calculation
- Update order queries for new structure

### Phase 3: Frontend UX
- Cart page: Group items by producer
- Show per-producer shipping
- Update checkout flow

### Phase 4: Admin & Producer Dashboards
- Admin: Show order groups with suborders
- Producer: Filter to show only their suborders

---

## Estimated Scope

| Phase | Files | LOC Estimate |
|-------|-------|--------------|
| Phase 1 (Schema) | 2-3 migrations | ~100 |
| Phase 2 (Backend) | 3-4 controllers | ~200 |
| Phase 3 (Frontend) | 4-5 components | ~250 |
| Phase 4 (Dashboards) | 2-3 pages | ~150 |
| **Total** | | **~700 LOC** |

Split into ≤300 LOC PRs = 3-4 PRs

---

## Decision Required

**Approve this plan to proceed with Phase 1 (Schema)?**

Alternatives:
- Option B (simpler, shipping lines only)
- Delay until more requirements clarified

---

_Pass-SHIP-SPLIT-ORDERS-AND-SHIPPING-PLAN-01 | 2026-01-24_
