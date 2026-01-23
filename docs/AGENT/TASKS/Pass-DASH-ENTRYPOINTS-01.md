# Task: Pass-DASH-ENTRYPOINTS-01

## What
Add clear dashboard entry points for Admin & Producer roles in account menu.

## Status
**COMPLETE** — PR Pending

## Scope
- Translation keys only (no new UI components)
- Header.tsx update to use translations
- Existing E2E tests already cover this functionality

## Changes Made

| File | Change |
|------|--------|
| `frontend/messages/el.json` | Added `admin.dashboard`: "Διαχείριση (Admin)" |
| `frontend/messages/en.json` | Added `admin.dashboard`: "Admin Dashboard" |
| `frontend/src/components/layout/Header.tsx` | Changed hardcoded "Admin" to `t('admin.dashboard')` |

## Pre-existing Coverage

The dashboard entry points were already in Header.tsx from previous passes:
- Producer: `t('producer.dashboard')` = "Πίνακας Παραγωγού" ✅
- Admin: hardcoded "Admin" → now `t('admin.dashboard')` = "Διαχείριση (Admin)" ✅

## E2E Tests

| Test | Status |
|------|--------|
| producer can navigate to dashboard | ✅ Pass |
| producer dashboard link NOT visible for other roles | ✅ Pass |
| admin can see admin link and navigate | ✅ Pass |
| admin link NOT visible for other roles | ✅ Pass |

---

_Pass-DASH-ENTRYPOINTS-01 | 2026-01-23_
