# NEXT 7 DAYS

**Last Updated**: 2025-12-29 12:00 UTC

## WIP (1 item only)
- (none)

## NEXT (ordered, max 3)

1. **Pass 52 — Card Payments Enable** (BLOCKED on Stripe credentials - user must provide)
2. **Pass 60 — Email Infrastructure Enable** (BLOCKED on SMTP/Resend credentials - user must provide)
3. **TEST-UNSKIP-01 — Enable Skipped E2E Tests** (actionable - unskip tests from Pass 39/40/44)

See `docs/OPS/STATE.md` for full DoD checklists.

## Recently Completed (Pass 58-63 + MONITOR)

- **Pass 58** — Producer Order Status Updates (status buttons on /my/orders) ✅
- **Pass 59** — Stabilize PROD Smoke reload-and-css ✅
- **Pass 61** — Admin Dashboard Polish (Laravel API integration) ✅
- **Pass 62** — Orders/Checkout E2E Guardrail (consumer journey tests) ✅
- **Pass 63** — Smoke Readiness Gate (healthz polling with backoff) ✅
- **MONITOR-01** — Uptime Alerting (GitHub Issue on failure) ✅
- **MONITOR-02** — Alert Drill (proved alerting pipeline works) ✅

## Previously Completed (Pass 45-57)

- **Pass 45** — Deploy Workflow Hardening ✅
- **Pass 46** — CI E2E Auth Setup ✅
- **Pass 47** — Production Healthz & Smoke-Matrix Policy ✅
- **Pass 48** — Shipping Display in Checkout & Order Details ✅
- **Pass 49** — Greek Market Validation ✅
- **Pass 50** — Zone-Based Shipping Pricing ✅
- **Pass 51** — Card Payments via Stripe (feature flag) ✅
- **Pass 53** — Order Email Notifications (consumer + producers) ✅
- **Pass 54** — Order Status Update Emails (shipped/delivered) ✅
- **Pass 55** — Weekly Producer Digest (order stats email) ✅
- **Pass 56** — Producer Orders Split-Brain Fix (Laravel API for /my/orders) ✅
- **Pass 57** — Producer Orders CSV Export (export button + API) ✅

---

## Rules

### WIP Limit = 1
Only ONE item in WIP at any time. No exceptions.

### DoD Required
Every item must have measurable Definition of Done before starting work.

### State Updates
After completing WIP item:
1. Move to DONE section
2. Update `docs/OPS/STATE.md` (move from IN PROGRESS to STABLE/CLOSED)
3. Pull next item from NEXT to WIP
4. Run `./scripts/prod-facts.sh` to verify PROD still healthy

### Estimation
Optional but helpful for planning. Reality: most tasks take 2-4 hours of focused work.

---

## References
- Data dependency map: `docs/PRODUCT/DATA-DEPENDENCY-MAP.md`
- Decision gate SOP: `docs/OPS/DECISION-GATE.md`
- Current state: `docs/OPS/STATE.md`
