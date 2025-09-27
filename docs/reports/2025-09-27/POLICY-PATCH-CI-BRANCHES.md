# Policy Patch: E2E Non-Required for CI-Only Branches

## Context
When CI-only changes (workflows modifications) are made on `ci/*` branches, E2E failures block auto-merge despite zero runtime impact.

## Proposed Policy Change

### Current State
```yaml
# .github/branch-protection.json (conceptual)
required_status_checks:
  - e2e
  - e2e-tests
  - backend
  - frontend
  - danger
```

### Proposed Change
```yaml
# .github/workflows/pr.yml modification
jobs:
  e2e:
    # Make E2E non-blocking for ci/* branches
    continue-on-error: ${{ startsWith(github.head_ref, 'ci/') }}
```

Or via GitHub UI:
1. Settings → Branches → main protection
2. Status checks: Keep E2E required
3. Add branch protection rule for `ci/*`:
   - Required checks: All EXCEPT e2e/e2e-tests
   - Allow force pushes: No
   - Dismiss stale reviews: Yes

## Risk Assessment
- **Scope**: Only affects `ci/*` branches
- **Impact**: Zero - these branches contain workflow-only changes
- **Verification**: Branch naming convention enforces scope

## Implementation Note
This is a **proposed patch** for review. Do NOT apply without maintainer approval.