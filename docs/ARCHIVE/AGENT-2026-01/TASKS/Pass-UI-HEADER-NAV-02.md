# TASK — Pass UI-HEADER-NAV-02

## Goal

Fix header navigation per V1 spec:
1. Logo (home button) visible ALWAYS (guest + logged-in) in desktop & mobile
2. Remove "Παρακολούθηση παραγγελίας" from top nav
3. Update E2E tests to enforce these rules
4. Update mini-spec with clear nav rules by role

## Scope

Frontend header/nav UI + E2E tests + docs only. No business logic changes.

## Deliverables

### Code Changes

- [x] Remove Track Order from navLinks in Header.tsx
- [x] Logo already unconditionally rendered (verified)

### Tests

- [x] Update header-nav.spec.ts: remove Track Order assertion
- [x] Add new test: Track Order NOT visible in top nav

### Documentation

- [x] Update docs/PRODUCT/HEADER-NAV-V1.md
  - Removed Track Order from all role tables
  - Added "No Track Order in top nav" to Core Principles
  - Added to "Items That Must NEVER Appear" list

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/layout/Header.tsx` | Remove Track Order from navLinks |
| `frontend/tests/e2e/header-nav.spec.ts` | Update tests, add Track Order NOT visible test |
| `docs/PRODUCT/HEADER-NAV-V1.md` | Update spec to reflect removed Track Order |

## DoD

- [x] Build passes (TypeScript)
- [x] PR created + CI green
- [x] Merged

## Result

**PASS** — PR #2372 merged (commit 18e19441).
