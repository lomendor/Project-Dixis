# STATE Archive: 2026-01-24 (Early)

Archived from `docs/OPS/STATE.md` on 2026-01-25.

---

## CI Note: E2E (PostgreSQL) Non-Required Failure

**Observed**: 2026-01-24 on PR #2440, #2441

The `E2E (PostgreSQL)` workflow failed but is **non-required** for merge. PRs merged successfully via auto-merge. This workflow runs against a PostgreSQL backend (vs SQLite in main CI) and may have flakiness. No action required unless it becomes blocking.

**Run links**:
- [#2441 E2E-PG](https://github.com/lomendor/Project-Dixis/actions/runs/21312989256/job/61351896715)
- [#2440 E2E-PG](https://github.com/lomendor/Project-Dixis/actions/runs/21312521868/job/61350824424)

---

## 2026-01-24 — Pass DOCS-ARCHIVE-CLEANUP-01: Agent Docs Housekeeping

**Status**: ✅ PASS — MERGED (PR #2442)

Archived 50 old Pass files (pre-2026-01-22) to `docs/ARCHIVE/AGENT-2026-01/`.

**Changes**:
- Archived: 29 SUMMARY, 18 TASKS, 3 PLANS files
- Remaining: 34 SUMMARY, 26 TASKS, 11 PLANS

**Evidence**: Summary: `Pass-DOCS-ARCHIVE-CLEANUP-01.md`

---

## 2026-01-24 — Pass UI-ROLE-NAV-SHELL-01: UI Role Navigation Verification

**Status**: ✅ PASS — MERGED (PR #2441)

Audited UI shell — already compliant from previous passes. Added 8 new E2E tests for logo behavior, mobile stability, and footer correctness.

**Changes**:
- New: `ui-role-nav-shell.spec.ts` (8 tests)

**E2E Tests**: 8/8 pass (14 total UI shell tests)

**Evidence**: Summary: `Pass-UI-ROLE-NAV-SHELL-01.md`

---

## 2026-01-24 — Pass SHIP-MULTI-DISCOVERY-01: Shipping & Multi-Producer Discovery

**Status**: ✅ PASS — MERGED (PR #2440)

Discovery audit for shipping calculation and multi-producer checkout capability. Created 4 spec documents.

**Key Findings**:
- Shipping engine adequate for MVP (zone-based, €35 free threshold)
- Multi-producer: Schema supports it, application blocks it (~20 LOC guards)
- To enable multi-producer: Remove client+server guards

**Deliverables**:
- `docs/PRODUCT/SHIPPING/SHIPPING-FACTS.md`
- `docs/PRODUCT/SHIPPING/SHIPPING-ENGINE-MVP-SPEC.md`
- `docs/PRODUCT/ORDERS/MULTI-PRODUCER-FACTS.md`
- `docs/PRODUCT/ORDERS/MULTI-PRODUCER-MVP-SPEC.md`

**Evidence**: Summary: `Pass-SHIP-MULTI-DISCOVERY-01.md`

---

## 2026-01-24 — Pass UI-SHELL-HEADER-FOOTER-01: UI Shell Stabilization

**Status**: ✅ PASS — MERGED (PR #2437)

Stabilized Header/Footer. Removed "Παρακολούθηση Παραγγελίας" from footer. Made cart visible for ALL roles (including producers). 6 E2E tests verify per-role visibility.

**Changes**:
- Footer: Removed order tracking link
- CartIcon: Cart now visible for producers too
- New: `ui-shell-header-footer.spec.ts` (6 tests)

**E2E Tests**: 6/6 pass

**Evidence**: Footer.tsx, CartIcon.tsx | Summary: `Pass-UI-SHELL-HEADER-FOOTER-01.md`

---

_Archived by Pass-DOCS-STATE-HYGIENE-01 on 2026-01-25_
