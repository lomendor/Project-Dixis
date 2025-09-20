# Required Checks Proposal (2025-09-20)

Detected successful checks (source: pull/213):
```
danger
php-tests
```

## Proposed required checks (minimal set)
- backend-ci: phpunit (backend tests)
- frontend-ci: type-check (tsc --noEmit)
- frontend-ci: unit-tests (jest/vitest)
- dangerjs: danger (policy/PR gates)

## Optional (non-blocking but recommended)
- frontend-e2e: e2e (can be required later if stable)
- lighthouse: lhci (keep as advisory or nightly)

## Notes
- Αφαιρέστε οποιαδήποτε required checks που δείχνουν σε *.yml.bak ή παλιά workflow names.
- Μετά το merge του PR #213, αφήστε 1-2 runs να ολοκληρωθούν στη main και μετά ενημερώστε τα branch rules.

