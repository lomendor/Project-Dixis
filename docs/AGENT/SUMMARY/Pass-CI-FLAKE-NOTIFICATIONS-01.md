# Summary: Pass CI-FLAKE-NOTIFICATIONS-01

**Date**: 2026-01-21
**Status**: DONE
**Type**: CI Flake Fix

---

## Overview

Fixed E2E smoke test failure caused by duplicate `notification-bell` testid in Header.

## Key Findings

- `NotificationBell` component renders twice (desktop + mobile header)
- Both have same testid, triggering Playwright strict mode violation
- Fix: Use `.first()` selector to target desktop bell

## Evidence

| Metric | Before | After |
|--------|--------|-------|
| E2E (PostgreSQL) | FAIL | PASS |
| notifications.spec.ts | 0/3 | 3/3 |

## What Changed

```diff
- const bell = page.getByTestId('notification-bell');
+ const bell = page.getByTestId('notification-bell').first();
```

## PR

#2379 merged | Commit: `7a1d1408`

---

_Summary: CI-FLAKE-NOTIFICATIONS-01 | 2026-01-21_
