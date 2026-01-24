# Task: Pass-SHIP-MULTI-PRODUCER-PLAN-01

## What
Planning pass for multi-producer checkout and shipping calculation design.

## Status
**COMPLETE** — PR Pending

## Deliverables

| Deliverable | Status |
|-------------|--------|
| Multi-producer checkout design | ✅ Done |
| Per-producer shipping design | ✅ Done |
| Neon compute optimization plan | ✅ Done |
| Implementation phases defined | ✅ Done |

## Key Decisions

### Multi-Producer Checkout

- Remove ~20 LOC guards (client + server)
- Cart groups items by producer
- Single payment, split notifications

### Shipping Strategy

- **Recommended**: Per-producer shipping (Option B)
- Free shipping threshold: Per-order (€35 total)
- Producer zone → Customer zone calculation

### Neon Optimization

- Pause preview branches (auto-suspend)
- Reduce staging compute (30 min timeout)
- Enable connection pooling
- Add query timeouts (30s)

## Implementation Phases

| Phase | Scope | Est. LOC |
|-------|-------|----------|
| 1. Infrastructure (this pass) | Docs only | 0 |
| 2. Enable Multi-Producer | Remove blocks | -24 +80 |
| 3. Per-Producer Shipping | New calculation | +155 |
| 4. Neon Optimization | Console + config | ~20 |

---

_Pass-SHIP-MULTI-PRODUCER-PLAN-01 | 2026-01-24_
