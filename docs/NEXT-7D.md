# NEXT 7 DAYS

**Last Updated**: 2025-12-19 17:56 UTC

## WIP (1 item only)
**1) Data dependency roadmap documentation**
- **DoD**:
  - Create `docs/PRODUCT/DATA-DEPENDENCY-MAP.md`
  - Document: Products → Producers → Permissions → Dashboard → Admin
  - Current state: what exists today
  - Missing pieces: what needs to be built
  - Implementation order: 1, 2, 3...
  - Stakeholder agreement on priority
- **Proof source**: File exists in repo with complete content
- **Status**: In PR review

## NEXT (ordered, max 3)

### 2) Producer permissions audit
- **DoD**:
  - Backend policy verification: ProductPolicy enforces producer_id ownership
  - Frontend verification: Dashboard only shows producer's own products
  - Admin override verification: Admin can edit any product
  - Authorization test coverage: existing tests pass
  - Document findings: `docs/FEATURES/PRODUCER-PERMISSIONS.md`
  - No user-facing bugs found
- **Estimated effort**: 2-3 hours (audit + docs)

### 3) Checkout flow smoke test
- **DoD**:
  - Manual test: Add product → Cart → Checkout → Order created
  - API verification: POST /api/orders returns 201 or 200
  - Database verification: Order record exists
  - Email verification: Confirmation email sent (or logged)
  - Document test: `docs/TESTS/CHECKOUT-SMOKE.md`
  - No blocking bugs found
- **Estimated effort**: 1-2 hours (manual test + docs)

## DONE (this week)
- Bootstrap OPS state management system (2025-12-19) - PR #1761 merged ✅
- SSH/fail2ban hardening (2025-12-19) - CLOSED ✅
- Products list verification (2025-12-19) - STABLE ✓
- Auth routes verification (2025-12-19) - STABLE ✓
- PROD monitoring workflows (MON1 + prod-smoke) (2025-12-19) - Active ✅

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
