# PR #222 — CI Diagnosis (2025-09-23 06:59Z)

## Meta
- **Title:** ci(auth): test-only login endpoint + e2e helper (flagged)
- **Branch:** ci/auth-e2e-hotfix → main
- **Author:** lomendor
- **Mergeable:** CONFLICTING
- **URL:** https://github.com/lomendor/Project-Dixis/pull/222

## Checks
- **e2e-tests** — state: IN_PROGRESS | started: 2025-09-23T06:37:06Z | done: 0001-01-01T00:00:00Z (https://github.com/lomendor/Project-Dixis/actions/runs/17937782355/job/51007216995) [wf: frontend-ci]
- **frontend-tests** — state: SUCCESS | started: 2025-09-23T06:36:07Z | done: 2025-09-23T06:37:01Z (https://github.com/lomendor/Project-Dixis/actions/runs/17937782355/job/51007165308) [wf: frontend-ci]
- **type-check** — state: SUCCESS | started: 2025-09-23T06:35:32Z | done: 2025-09-23T06:36:04Z (https://github.com/lomendor/Project-Dixis/actions/runs/17937782355/job/51007135330) [wf: frontend-ci]
- **dependabot-smoke** — state: SKIPPED | started: 2025-09-23T06:35:31Z | done: 2025-09-23T06:35:30Z (https://github.com/lomendor/Project-Dixis/actions/runs/17937782355/job/51007135393) [wf: frontend-ci]

## E2E / Integration Logs (head/tail)
**Run URL:** https://github.com/lomendor/Project-Dixis/actions/runs/17937782355/job/51007216995

<details><summary>Head (first 120 lines)</summary>

```
```
</details>

<details><summary>Tail (last 120 lines)</summary>

```
```
</details>

## Related PRs (#221, #220)
### PR #221
- **Title:** fix(e2e): stabilize shipping integration timeouts + admin UI flags
- **Mergeable:** CONFLICTING
- **URL:** https://github.com/lomendor/Project-Dixis/pull/221
  - e2e-tests: state=FAILURE (https://github.com/lomendor/Project-Dixis/actions/runs/17912956522/job/50928588153) [wf: frontend-ci]
  - frontend-tests: state=SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17912956522/job/50928507921) [wf: frontend-ci]
  - integration: state=CANCELLED (https://github.com/lomendor/Project-Dixis/actions/runs/17912956521/job/50928463303) [wf: .github/workflows/fe-api-integration.yml]
  - type-check: state=SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17912956522/job/50928462873) [wf: frontend-ci]
  - dependabot-smoke: state=SKIPPED (https://github.com/lomendor/Project-Dixis/actions/runs/17912956522/job/50928462923) [wf: frontend-ci]

### PR #220
- **Title:** ci(guardrails): fix workflow paths, add contracts build, stabilize checks
- **Mergeable:** CONFLICTING
- **URL:** https://github.com/lomendor/Project-Dixis/pull/220

## Next Actions (single-step)
- If checks turn ALL success on next poll: `gh pr merge 222 --squash --auto --delete-branch`
- If failing:
  1) Identify failing job from Checks section (by state\!='SUCCESS')
  2) Open the link; capture exact error and file
  3) Propose 1-line targeted fix (no code change yet) in a follow-up PR
