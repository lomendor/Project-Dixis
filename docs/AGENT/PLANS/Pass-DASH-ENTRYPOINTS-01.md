# Plan: Pass-DASH-ENTRYPOINTS-01

**Date**: 2026-01-23
**Status**: COMPLETE

---

## Goal

Add clear entry points for Admin & Producer dashboards in account menu with proper Greek translations.

## Non-goals

- No UI redesign
- No header layout changes
- No new routes (dashboards already exist)

## Deliverables

1. Add `admin.dashboard` translation key: "Διαχείριση (Admin)" (el) / "Admin Dashboard" (en)
2. Update Header.tsx to use translation instead of hardcoded "Admin"
3. Verify existing E2E smoke tests pass (4 tests)

## Acceptance Criteria

- [x] Producer dashboard link shows "Πίνακας Παραγωγού" for producer role
- [x] Admin dashboard link shows "Διαχείριση (Admin)" for admin role
- [x] Links use translations (i18n-ready)
- [x] 4 existing smoke tests pass (dashboard-visibility-smoke.spec.ts)

---

_Pass-DASH-ENTRYPOINTS-01 | 2026-01-23_
