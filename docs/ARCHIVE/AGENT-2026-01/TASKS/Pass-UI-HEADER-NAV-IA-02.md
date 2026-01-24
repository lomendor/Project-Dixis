# TASK — Pass UI-HEADER-NAV-IA-02

## Goal

Improve header/navigation IA to be clean, predictable, and role-based:
- Logo always visible and clickable → home
- Role-based navigation (Guest, Consumer, Producer, Admin)
- No debug/test links in any state
- Mobile-first with hamburger menu

## Scope

UI + IA only. No business logic changes.

## Deliverables

### UI Changes

- [x] Added `data-testid="nav-user-name"` to user name display (desktop)
- [x] Added `data-testid="mobile-nav-user-name"` to user name display (mobile)

### Tests

- [x] Updated `frontend/tests/e2e/header-nav.spec.ts`
  - Added `@smoke` tags to all test suites
  - Added negative test cases (admin/producer links NOT visible for other roles)
  - Added mobile menu tests with iPhone SE viewport
  - Improved test resilience with `expect.poll()` and `networkidle` waits
  - Clear storage state in guest tests to prevent flaky auth issues

### Documentation

- [x] Updated `docs/PRODUCT/HEADER-NAV-V1.md`
  - Comprehensive testid reference for all roles
  - Mobile navigation section with all testids
  - "NOT visible" sections for each role

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/layout/Header.tsx` | Added user name testids |
| `frontend/tests/e2e/header-nav.spec.ts` | Comprehensive E2E tests |
| `docs/PRODUCT/HEADER-NAV-V1.md` | Updated nav rules doc |

## DoD

- [x] Logo visible in all states
- [x] Role-based nav items work correctly
- [x] Negative test cases for role isolation
- [x] Mobile menu tests
- [x] Documentation updated
- [x] PR created + CI green
- [x] Merged

## Result

**PASS** — PR #2365 merged, commit `d8f1b41a`.
