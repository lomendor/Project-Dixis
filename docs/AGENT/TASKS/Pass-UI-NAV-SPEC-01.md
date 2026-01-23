# Task: Pass-UI-NAV-SPEC-01

## What
Create unified navigation specification document defining Header, Footer, and mobile navigation per user role.

## Status
**COMPLETE** — PR Pending

## Scope
- Docs-only changes
- No code/UI modifications
- Consolidate navigation rules across existing specs

## Problem Statement

"Random UI" and inconsistent links were causing confusion:
- Unclear what should appear in Header vs Footer
- Role-based visibility not documented in one place
- Language switcher position unclear
- Track Order link appearing inconsistently

## Implementation

### Updated Doc
`docs/PRODUCT/NAVIGATION-V1.md` — Comprehensive update adding:

| Section | Content |
|---------|---------|
| 1. Logo Behavior | Size, position, always-visible rule |
| 2. Header by Role | 4 tables (Guest, Consumer, Producer, Admin) |
| 3. Footer Navigation | Column structure, all-roles visibility |
| 4. Language Switcher | Header + footer rules, testids |
| 5. Cart Visibility | Role-based show/hide |
| 6. Mobile Navigation | Hamburger menu contents per role |
| 7. Items NEVER in Header | Track Order, user name, etc. |
| 8. Items NEVER in Footer | Auth buttons, cart, dashboard links |
| 9. Non-Goals | Out of scope for V1 |
| 10. Implementation Files | File locations |
| 11. E2E Test Coverage | Test file mapping |
| 12. Resolved Decisions | Prior pass decisions |
| 13. Follow-up Passes | Triggers for code alignment |

## Files Changed

| File | Change |
|------|--------|
| `docs/PRODUCT/NAVIGATION-V1.md` | Updated — comprehensive navigation spec |
| `docs/AGENT/TASKS/Pass-UI-NAV-SPEC-01.md` | NEW (this file) |
| `docs/AGENT/SUMMARY/Pass-UI-NAV-SPEC-01.md` | NEW |
| `docs/OPS/STATE.md` | Updated |

## Acceptance Criteria

- [x] NAVIGATION-V1.md has tables per role (Guest/Consumer/Producer/Admin)
- [x] Footer navigation documented with all columns
- [x] Mobile rules (hamburger menu contents) specified
- [x] "Non-goals" section prevents scope creep
- [x] Language switcher rules defined
- [x] Cart visibility rules defined
- [x] Items NEVER in header/footer documented
- [x] Follow-up passes listed if code alignment needed
- [ ] CI green (pending PR)

---

_Pass-UI-NAV-SPEC-01 | 2026-01-23_
