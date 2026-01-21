# TASK — Pass UI-HEADER-LOGO-NAV-01

## Goal

Verify and ensure header/logo/navigation behavior meets requirements for all user states.

## Scope

E2E test fix only. Header implementation was already correct.

## Deliverables

### Verification (all PASS)

- [x] Logo visible for guest → links to `/`
- [x] Logo visible for logged-in users → links to `/`
- [x] Guest shows: Products, Track Order, Producers, Login, Register, Cart
- [x] Consumer shows appropriate items
- [x] Producer shows appropriate items
- [x] Admin shows appropriate items
- [x] Mobile: Logo visible, hamburger menu works
- [x] Aria-labels in Greek for mobile menu

### Test Fix

- [x] Fix selector ambiguity in `header-nav.spec.ts`
  - Changed `header` to `header nav` for link selectors
  - Prevents matching cart aria-label containing "προϊόντα"

## Files Changed

| File | Change |
|------|--------|
| `tests/e2e/header-nav.spec.ts` | Fix selector to scope within nav element |

## DoD

- [x] E2E tests pass locally
- [ ] PR created + CI green
- [ ] Merged

## Result

**PENDING** — Awaiting CI verification.
