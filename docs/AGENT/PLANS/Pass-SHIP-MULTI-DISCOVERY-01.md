# Plan: Pass-SHIP-MULTI-DISCOVERY-01

**Date**: 2026-01-24
**Status**: COMPLETE

---

## Goal

Discovery/audit pass for shipping calculation and multi-producer checkout capability.

## Non-goals

- No code changes to production logic
- No new features implemented
- No migrations

---

## Deliverables

1. [x] **SHIPPING-FACTS.md** — Audit of shipping calculation (inputs, rules, defaults, edge cases)
2. [x] **MULTI-PRODUCER-FACTS.md** — Audit of multi-producer model (what's allowed, what breaks)
3. [x] **MULTI-PRODUCER-MVP-SPEC.md** — Specification for enabling multi-producer
4. [x] **SHIPPING-ENGINE-MVP-SPEC.md** — Specification for shipping engine improvements

---

## Key Findings

### Shipping

- Zone-based pricing via 2-digit postal prefix
- Free shipping at €35 (backend), €25 (frontend contract default)
- Fallback prices: HOME €3.50, COURIER €4.50, PICKUP €0
- No changes needed for MVP

### Multi-Producer

- **Schema supports it** — OrderItem has producer_id, Order does not
- **Application blocks it**:
  - Client: `cart.ts:46-56` returns 'conflict' status
  - Server: `OrderController.php:131-144` returns 422
- **To enable**: Remove ~20 LOC (client + server guards)

---

## Files Created

| File | Location |
|------|----------|
| SHIPPING-FACTS.md | `docs/PRODUCT/SHIPPING/` |
| MULTI-PRODUCER-FACTS.md | `docs/PRODUCT/ORDERS/` |
| MULTI-PRODUCER-MVP-SPEC.md | `docs/PRODUCT/ORDERS/` |
| SHIPPING-ENGINE-MVP-SPEC.md | `docs/PRODUCT/SHIPPING/` |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Threshold mismatch (€25 vs €35) | Document in FACTS, fix in future pass |
| Multi-producer enablement complexity | MVP spec defines minimal path |

---

## Next Steps

1. **Decision**: Approve multi-producer enablement? (User decision)
2. **Pass**: If approved, create MULTI-PRODUCER-ENABLE-01 pass (~20 LOC)
3. **UI**: Cart grouping by producer (Phase 2)

---

_Pass-SHIP-MULTI-DISCOVERY-01 | 2026-01-24_
