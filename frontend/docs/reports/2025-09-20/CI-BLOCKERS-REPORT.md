# CI Blockers Report (2025-09-20)
Analyzed PRs: 24

## Summary
Bucket	Count	Representative PRs
lighthouse	2	#48 #47
frontend-tests	8	#212 #164 #162 #161
phpunit	5	#164 #114 #113 #112
workflows	4	#212 #159 #111 #66
other	5	#65 #64 #50 #45

## Top 3 failing job links
- https://github.com/lomendor/Project-Dixis/actions/runs/17877729390/job/50841429614
- https://github.com/lomendor/Project-Dixis/actions/runs/17745228438/job/50428791894
- https://github.com/lomendor/Project-Dixis/actions/runs/17742384644/job/50419561057

## Quick Fixes (per bucket)
- frontend-tests: lock Node to 20.x; ensure `pnpm -w install`; mock network; data-testid selectors; avoid waitForTimeout; fix tsc strictness deltas.
- lighthouse: bind TEST_BASE_URL; ensure Next.js dev server port unused; seed minimal DB; run `next start -p 3001` only once.
- phpunit: use `Http::preventStrayRequests`; seed DB; isolate feature vs unit; use sqlite memory if possible.
- workflows: permissions: contents: read; actions: read; PR body must include dated docs link if Danger requires.
- other: inspect failing check detail; apply minimal patch.

## Detailed Analysis

### High-Priority Issues
1. **PR #212**: Multiple check failures (PR Hygiene, Quality Assurance, Smoke Tests, frontend)
   - Likely Node version or dependency conflicts
   - Critical CI fix needed for other PRs

2. **PR #164**: Backend and E2E test failures
   - Database/seeding issues suspected
   - ERD implementation conflicts

3. **PR #162**: E2E test failures
   - Dependency version bump causing test instability

### Pattern Analysis
- **Frontend Tests**: Most common failure type (8 PRs affected)
- **Dependency Bumps**: Multiple dependabot PRs failing (#162, #161, #159)
- **E2E Instability**: Recurring theme across multiple PRs
- **Node Version**: Likely root cause for several frontend failures

### Recommended Actions
1. Fix PR #212 first (critical CI infrastructure)
2. Address Node version consistency across all workflows
3. Update E2E test selectors and timing
4. Review dependabot PR compatibility
5. Implement stricter pre-merge CI requirements
