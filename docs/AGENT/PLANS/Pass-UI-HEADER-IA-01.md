# Plan: Pass-UI-HEADER-IA-01

**Status**: PLANNED (awaiting "go")
**Type**: UI/IA (Information Architecture)
**Scope**: Header/Navigation cleanup only

---

## Goal

Clean up header navigation to match the approved spec (`docs/PRODUCT/NAVIGATION-V1.md`):
- Remove clutter
- Ensure role-based nav items are correct
- Improve mobile UX

## Non-Goals

- ❌ NO business logic changes
- ❌ NO pricing/shipping/order logic
- ❌ NO new features
- ❌ NO API changes
- ❌ NO database changes

---

## Acceptance Criteria (Testable)

| # | Criterion | Test Method |
|---|-----------|-------------|
| 1 | Logo visible on all pages, all roles | E2E: `header-nav.spec.ts` |
| 2 | Primary nav: Products, Producers (max 2-3 links) | E2E visual check |
| 3 | Language toggle NOT in header (moved to footer) | E2E: `header-nav.spec.ts` |
| 4 | User dropdown shows role-appropriate links | E2E: check by role |
| 5 | Cart icon visible for: guest, consumer, admin | E2E existing tests |
| 6 | Cart icon HIDDEN for: producer | E2E existing tests |
| 7 | Mobile hamburger menu works | E2E mobile viewport |
| 8 | No "Track Order" in header | E2E assertion |
| 9 | No standalone username text in header | E2E assertion |

---

## Screens/Roles Affected

| Role | Header Changes |
|------|---------------|
| Guest | Login/Register buttons visible |
| Consumer | User dropdown with: name, My Orders, Logout |
| Producer | User dropdown with: name, Dashboard, Orders, Logout; NO cart |
| Admin | User dropdown with: name, Admin Panel, Logout; cart visible |

---

## Nav Items: Keep vs Remove

### Keep in Header
- Logo (links to `/`)
- Products link
- Producers link
- Cart icon (role-dependent)
- User dropdown (authenticated)
- Login/Register (guest)
- Mobile menu button

### Remove from Header
- Language toggle (already moved to footer per UI-HEADER-NAV-CLARITY-01)
- Track Order link (if present)
- Standalone username text

### Footer (existing, no changes)
- Language toggle (EL/EN)
- Copyright
- Links

---

## Implementation Steps

1. **Audit current header** - screenshot all roles
2. **Remove any remaining clutter** if found
3. **Verify role-based visibility** with E2E tests
4. **Update mobile menu** if needed
5. **Run full E2E suite** to ensure no regressions

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Break existing nav | Low | High | E2E tests already cover this |
| Mobile breakage | Medium | Medium | Test at 375px viewport |
| Role confusion | Low | Medium | Test all 4 roles explicitly |

---

## Files Likely Changed

- `frontend/src/components/Header.tsx` (or similar)
- `frontend/src/components/MobileMenu.tsx` (if exists)
- `frontend/tests/e2e/header-nav.spec.ts` (add missing tests)

---

## Dependencies

- None (UI-only pass)

---

## Estimate

- Small scope (~50-100 LOC changes)
- Low risk (UI cosmetic only)

---

**Status**: AWAITING "go" to proceed with implementation.
