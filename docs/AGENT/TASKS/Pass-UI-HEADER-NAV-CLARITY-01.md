# TASK — Pass UI-HEADER-NAV-CLARITY-01

## Goal

Move language switcher from header to footer for stable, non-shifting UI.

## Scope

Frontend ONLY. No business logic changes.

## Steps

1. [x] Sync to main @ `cd42664f`
2. [x] Remove language switcher from Header.tsx (desktop + mobile)
3. [x] Add language switcher to Footer.tsx
4. [x] Update E2E tests to use new footer testids
5. [x] Build verification: PASS
6. [x] TypeScript check: PASS
7. [x] Create TASKS + SUMMARY artifacts
8. [ ] PR merged with CI green

## DoD

- [x] Header has NO language switcher
- [x] Footer HAS language switcher with testids `footer-lang-el`, `footer-lang-en`
- [x] E2E tests updated
- [x] Build passes
- [ ] CI green
- [ ] Pass artifacts created
- [ ] STATE + NEXT-7D updated

## Result

**PENDING CI** — Awaiting merge.
