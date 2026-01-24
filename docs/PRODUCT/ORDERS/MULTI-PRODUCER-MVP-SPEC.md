# Multi-Producer Cart: MVP Specification

**Pass**: SHIP-MULTI-DISCOVERY-01
**Date**: 2026-01-24
**Status**: Draft

---

## Goal

Allow customers to add products from multiple producers in a single cart/order.

---

## Non-Goals

- Complex split-shipping logic (Phase 2)
- Partial order fulfillment (Phase 2)
- Producer-specific delivery time slots (Phase 2)
- Multi-producer promotions/discounts (Phase 2)

---

## User Story

> As a customer, I want to order products from multiple producers in one checkout, so I don't have to place separate orders.

---

## Proposed Behavior

### Cart Add Flow

| Current | Proposed |
|---------|----------|
| Block add if producer differs | Allow add regardless of producer |
| Show conflict modal | No modal needed |
| User must replace or cancel | Items accumulate freely |

### Checkout Display

| Element | Display |
|---------|---------|
| Cart items | Grouped by producer |
| Shipping | Per-producer or combined (TBD) |
| Producer labels | Show producer name per item group |

### Order Creation

| Aspect | Behavior |
|--------|----------|
| Validation | Remove multi-producer block |
| Order record | Single order, no producer_id |
| Order items | Each item has producer_id |
| Total calculation | Sum of all items + shipping |

---

## Shipping Strategy Options

### Option A: Single Combined Shipping

- Calculate shipping based on delivery address only
- Ignore producer locations
- Simplest to implement
- May not reflect actual logistics cost

### Option B: Per-Producer Shipping (Recommended for MVP)

- Calculate shipping per producer
- Sum producer shipping costs
- User pays aggregate shipping
- Accurate cost reflection

### Option C: Highest-Cost Shipping

- Calculate shipping for each producer
- Charge only the highest
- Marketing advantage ("free shipping from smaller producers")
- Revenue impact

**Recommendation**: Start with Option A for MVP, iterate based on feedback.

---

## Technical Changes Required

### Phase 1: Remove Blocks (~20 LOC)

| File | Change |
|------|--------|
| `frontend/src/lib/cart.ts` | Remove lines 46-56 (conflict check) |
| `backend/OrderController.php` | Remove lines 131-144 (server guard) |

### Phase 2: UI Updates (~100 LOC)

| Component | Change |
|-----------|--------|
| Cart display | Group items by producer |
| Checkout summary | Show producer breakdown |
| Order confirmation | List items by producer |

### Phase 3: Producer Dashboard (~50 LOC)

| Component | Change |
|-----------|--------|
| Order list | Already filters by producer_id ✅ |
| Order detail | Already shows only their items ✅ |

---

## Acceptance Criteria

1. [ ] User can add products from Producer A and Producer B to cart
2. [ ] No conflict modal appears when mixing producers
3. [ ] Checkout completes successfully with multi-producer cart
4. [ ] Order created with items from multiple producers
5. [ ] Each producer sees only their items in dashboard
6. [ ] E2E test covers multi-producer checkout flow

---

## Test Scenarios

| Scenario | Expected |
|----------|----------|
| Add item A (Producer 1) | Added |
| Add item B (Producer 2) | Added (no conflict) |
| Proceed to checkout | Both items visible |
| Complete order | Order created |
| Producer 1 dashboard | Sees only item A |
| Producer 2 dashboard | Sees only item B |

---

## Rollback Plan

If issues arise, re-enable guards:
1. Restore conflict check in `cart.ts`
2. Restore server guard in `OrderController.php`

Both changes are additive guards, easy to toggle.

---

## Open Questions

1. **Shipping**: Option A/B/C? (Recommend A for MVP)
2. **Notifications**: One email or per-producer? (Recommend one email MVP)
3. **Producer view**: Any dashboard changes needed? (No for MVP)

---

## Dependencies

- None (schema already supports this)

---

## Estimated Effort

| Phase | LOC | Effort |
|-------|-----|--------|
| Phase 1: Remove blocks | ~20 | Small |
| Phase 2: UI grouping | ~100 | Medium |
| Phase 3: Dashboard (if needed) | ~50 | Small |
| E2E tests | ~50 | Small |
| **Total** | ~220 | 1-2 passes |

---

_SHIP-MULTI-DISCOVERY-01 | 2026-01-24_
