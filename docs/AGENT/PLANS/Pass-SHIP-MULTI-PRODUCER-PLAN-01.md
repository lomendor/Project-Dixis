# Plan: Pass-SHIP-MULTI-PRODUCER-PLAN-01

**Date**: 2026-01-24
**Status**: PLANNING (Discovery Only)
**Type**: Design + Infrastructure Planning

---

## Goal

Define how shipping should be computed realistically and how multi-producer checkout should work (separate shipments/receipts, per-producer shipping). Also address Neon compute at 80% capacity.

---

## Non-Goals

- No code changes in this pass
- No business logic implementation
- No migrations

---

## Part A: Multi-Producer Checkout Design

### Current State (from MULTI-PRODUCER-FACTS.md)

- Schema: ✅ Ready (OrderItem has producer_id)
- Client: ❌ Blocked in cart.ts:46-56
- Server: ❌ Blocked in OrderController.php:131-144
- Effort to unblock: ~20 LOC removal

### Proposed Behavior

#### 1. Cart Experience

| Scenario | Current | Proposed |
|----------|---------|----------|
| Add item from Producer B | Modal: "Replace cart?" | Item added (no conflict) |
| Cart display | Flat list | Grouped by producer |
| Cart count | Total items | Still total items |

#### 2. Checkout Experience

| Component | Proposed Behavior |
|-----------|-------------------|
| Cart summary | Items grouped by producer with subtotals |
| Shipping | **Per-producer shipping** (see Part B) |
| Payment | Single payment for total |
| Order creation | Single order, multiple items with producer_id |

#### 3. Order Confirmation

| Element | Display |
|---------|---------|
| Order number | Single order ID |
| Items | Grouped by producer |
| Shipping | Breakdown per producer |
| Total | Combined total |

#### 4. Producer Dashboard

| Current | Proposed |
|---------|----------|
| Already filters by producer_id | No change needed |
| Producer sees only their items | Still works |

#### 5. Email Notifications

| Recipient | Content |
|-----------|---------|
| Customer | Full order (all producers) |
| Producer A | Only their items + delivery info |
| Producer B | Only their items + delivery info |

---

## Part B: Per-Producer Shipping Calculation

### Option Analysis

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Single Flat Rate** | One shipping charge regardless of producers | Simple | Doesn't reflect actual cost |
| **B: Per-Producer (Recommended)** | Calculate shipping per producer, sum total | Accurate | More complex UI |
| **C: Highest Only** | Charge highest producer's shipping | Marketing angle | Revenue loss |
| **D: Producer-subsidized** | Producer absorbs own shipping | No customer confusion | Requires producer agreement |

### Recommended: Option B (Per-Producer)

**Rationale**: Accurate cost reflection without producer agreements needed.

#### Calculation Flow

```
For each producer in cart:
  1. Get producer's pickup zone (postal_code from producer profile)
  2. Calculate shipping from producer zone → customer zone
  3. Apply free shipping threshold per producer subtotal
  4. Sum all producer shipping costs

Total Shipping = Σ (producer_shipping_cost)
```

#### Free Shipping Threshold

| Approach | Description |
|----------|-------------|
| Per-producer | €35 per producer (current threshold) |
| Per-order | €35 total cart (simpler for customer) |

**Recommendation**: Per-order threshold for better UX.

#### Example

```
Cart:
- Producer A: €20 worth of items (Zone 1 → Customer Zone 3)
- Producer B: €18 worth of items (Zone 2 → Customer Zone 3)

Shipping Calculation:
- Producer A: €3.50 (Zone 1→3)
- Producer B: €4.00 (Zone 2→3)
- Total cart: €38 (> €35 threshold)
- Final shipping: €0 (free shipping applies)
```

---

## Part C: Neon Compute Optimization

### Current State

- Neon compute at **80% capacity**
- Used for: Production, Staging, CI E2E tests (when PostgreSQL mode)
- SQLite used for main CI (no Neon impact)

### Proposed Optimizations

| Action | Impact | Effort |
|--------|--------|--------|
| **1. Pause preview branches** | High | Low |
| **2. Reduce staging compute hours** | Medium | Low |
| **3. Implement connection pooling** | Medium | Medium |
| **4. Add query timeouts** | Low | Low |

#### Action 1: Pause Preview Branches

Preview branches auto-suspend after 5 minutes of inactivity by default. Verify this is configured:

```sql
-- Check branch settings in Neon console
-- Set auto_suspend_timeout = 300 (5 min)
```

#### Action 2: Staging Compute Hours

- Current: Staging runs 24/7
- Proposed: Staging auto-suspends after 30 min inactivity
- Impact: ~50% reduction in staging compute

#### Action 3: Connection Pooling

- Use Neon's built-in connection pooling
- Change connection string from direct to pooled endpoint
- Reduces connection overhead

#### Action 4: Query Timeouts

Add statement_timeout to prevent runaway queries:

```sql
SET statement_timeout = '30s';
```

---

## Implementation Phases

### Phase 1: Infrastructure (This Pass - Docs Only)

- [x] Design multi-producer checkout flow
- [x] Design per-producer shipping calculation
- [x] Document Neon optimization steps
- [ ] Create implementation checklist

### Phase 2: Enable Multi-Producer (Future Pass)

| Task | Files | LOC |
|------|-------|-----|
| Remove client block | cart.ts | -10 |
| Remove server block | OrderController.php | -14 |
| Group cart by producer | CartDrawer.tsx | +30 |
| E2E test | multi-producer.spec.ts | +50 |

### Phase 3: Per-Producer Shipping (Future Pass)

| Task | Files | LOC |
|------|-------|-----|
| Add producer zone to model | Producer.php | +5 |
| Per-producer shipping API | ShippingQuoteController.php | +40 |
| Checkout UI updates | CheckoutClient.tsx | +50 |
| E2E tests | shipping-multi.spec.ts | +60 |

### Phase 4: Neon Optimization (Future Pass)

| Task | Platform | Effort |
|------|----------|--------|
| Configure auto-suspend | Neon Console | 10 min |
| Enable pooling | Neon Console | 10 min |
| Update connection strings | .env files | 5 min |
| Add query timeouts | Migration | 15 min |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Per-producer shipping confusion | Clear UI grouping + breakdown |
| Higher total shipping | Free shipping threshold messaging |
| Neon changes break staging | Test in preview branch first |
| Producer notification complexity | Use existing email service patterns |

---

## Open Questions for Stakeholder

1. **Free shipping**: Per-producer or per-order threshold?
2. **Producer zone**: Do we have producer postal codes in DB?
3. **Neon priority**: Immediate optimization or defer?
4. **Multi-producer priority**: Ready to enable or more planning needed?

---

## Deliverables This Pass

1. ✅ This PLAN document
2. ✅ TASKS document
3. ✅ SUMMARY document
4. ✅ STATE.md update
5. ✅ NEXT-7D.md update

---

_Pass-SHIP-MULTI-PRODUCER-PLAN-01 | 2026-01-24_
