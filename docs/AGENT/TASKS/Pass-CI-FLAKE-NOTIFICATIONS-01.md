# Pass CI-FLAKE-NOTIFICATIONS-01

**Date**: 2026-01-21
**Status**: DONE
**Type**: CI Flake Fix

---

## What

Fix flaky E2E smoke test: Playwright strict mode violation for duplicate `notification-bell` testid.

## Why

- E2E (PostgreSQL) CI check was failing on unrelated PRs
- Root cause: `NotificationBell` renders twice in Header.tsx (desktop + mobile)
- Both instances have same `data-testid="notification-bell"`
- Playwright strict mode requires unique selectors

## Root Cause Analysis

```
Error: strict mode violation: getByTestId('notification-bell') resolved to 2 elements:
    1) <button ...> aka getByRole('button', { name: 'Notifications' })
    2) <button ...> aka locator('div').filter({ hasText: /^ELEN🛒 Cart$/ }).getByTestId('notification-bell')
```

**Location of duplicate testids:**
- `Header.tsx:99` - Desktop header (inside `hidden md:flex`)
- `Header.tsx:228` - Mobile header (inside `flex md:hidden`)

## Fix

Test-only fix: Use `.first()` to disambiguate the selector.

```typescript
// Before (flaky)
const bell = page.getByTestId('notification-bell');

// After (stable)
const bell = page.getByTestId('notification-bell').first();
```

This targets the desktop bell which is visible on default Playwright viewport.

## Evidence

| Check | Before | After |
|-------|--------|-------|
| E2E (PostgreSQL) | FAIL | PASS |
| Notifications smoke tests | 0/3 | 3/3 |

## Files Changed

- `frontend/tests/e2e/notifications.spec.ts` (+5/-3 lines)

## PR

- #2379 merged, commit `7a1d1408`

---

_Pass: CI-FLAKE-NOTIFICATIONS-01 | 2026-01-21_
