# Task: Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01

## What
Add E2E smoke tests proving admin and producer users can navigate to their dashboards.

## Status
**COMPLETE** — PR Pending

## Scope
- Add Playwright smoke spec for dashboard visibility
- Prove end-to-end navigation works
- No business logic changes

## Problem Statement

User feedback: "I've never seen producer/admin dashboard"

Root cause investigation showed entry points exist (PRODUCER-IA-01), but no E2E test verifies:
1. The navigation actually works end-to-end
2. The dashboard content loads (not just URL check)

## Implementation

### New Test File
`frontend/tests/e2e/dashboard-visibility-smoke.spec.ts`

| Test | Description |
|------|-------------|
| producer can navigate to dashboard and see content | Home → menu → click → verify URL + testid |
| producer dashboard link NOT visible for other roles | Negative case: consumer can't see it |
| admin can navigate to admin panel and see content | Home → menu → click → verify URL + heading |
| admin link NOT visible for other roles | Negative case: consumer can't see it |

### Selectors Used
- `[data-testid="header-user-menu"]` — User dropdown trigger
- `[data-testid="user-menu-dashboard"]` — Producer dashboard link
- `[data-testid="user-menu-admin"]` — Admin link
- `[data-testid="producer-dashboard"]` — Producer dashboard container
- `[data-testid="dashboard-title"]` — Producer dashboard heading
- `heading:Πίνακας Ελέγχου` — Admin panel heading

## Files Changed

| File | Change |
|------|--------|
| `frontend/tests/e2e/dashboard-visibility-smoke.spec.ts` | NEW — 4 smoke tests |
| `docs/AGENT/PLANS/Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md` | NEW |
| `docs/AGENT/TASKS/Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md` | NEW (this file) |
| `docs/AGENT/SUMMARY/Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md` | NEW |
| `docs/OPS/STATE.md` | Updated |

## Verification

```bash
CI=true BASE_URL=https://dixis.gr npx playwright test dashboard-visibility-smoke.spec.ts --reporter=line
```

## Acceptance Criteria

- [x] Producer navigation test passes
- [x] Admin navigation test passes
- [x] Negative cases pass
- [ ] CI green (pending PR)
- [x] No business logic changes
