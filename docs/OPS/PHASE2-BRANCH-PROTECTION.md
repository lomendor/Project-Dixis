# Phase 2: Branch Protection Alignment

## Current State (Post-Phase 1)

Branch protection for `main` requires 5 status check contexts:
1. `type-check` (app_id: 15368 - Required Shims workflow)
2. `frontend-tests` (app_id: 15368 - Required Shims workflow)
3. `danger` (app_id: 15368 - Required Shims workflow)
4. `php-tests` (app_id: 15368 - Required Shims workflow)
5. `quality-gates` (app_id: null - Pull Request Quality Gates workflow)

**Problem**: The first 4 contexts were provided by the temporary `required-shims.yml` workflow, which has been removed in Phase 2.

## Recommended Change

**Update required_status_checks to use single unified gate**:
- Remove: `type-check`, `frontend-tests`, `danger`, `php-tests`
- Keep: `quality-gates` (single check that depends on all jobs)

### Why This Works

The `quality-gates` job in `.github/workflows/pr.yml`:
- **Depends on**: `qa`, `test-smoke`, `danger`
- **Requires**: QA job must succeed (includes type-check, lint, build)
- **Advisory**: Smoke Tests and PR Hygiene are advisory (continue-on-error)

The QA job already includes:
- TypeScript type checking (via `npm run qa:all:ci`)
- ESLint validation
- Unit tests (via build step)
- Production build verification

## Implementation

### Option A: Manual via GitHub UI
1. Navigate to repository Settings → Branches → main → Edit
2. Under "Require status checks to pass before merging":
   - Uncheck: `type-check`, `frontend-tests`, `danger`, `php-tests`
   - Keep checked: `quality-gates`
3. Save changes

### Option B: Via API (Automated)
```bash
gh api -X PUT repos/lomendor/Project-Dixis/branches/main/protection/required_status_checks \
  -f strict=true \
  -f 'contexts[]=quality-gates'
```

### Option C: Using Pass 52 Script
```bash
export APPLY_BP_CHANGES=1
# Re-run Pass 52 section E
```

## Verification

After applying changes:
```bash
gh api repos/lomendor/Project-Dixis/branches/main/protection/required_status_checks \
  --jq '.contexts'
```

Should output:
```json
["quality-gates"]
```

## Rollback Plan

If issues arise:
```bash
gh api -X PUT repos/lomendor/Project-Dixis/branches/main/protection/required_status_checks \
  -f strict=true \
  -f 'contexts[]=type-check' \
  -f 'contexts[]=frontend-tests' \
  -f 'contexts[]=danger' \
  -f 'contexts[]=php-tests' \
  -f 'contexts[]=quality-gates'
```

## Phase 2 Timeline

1. ✅ Remove required-shims.yml workflow
2. ✅ Document branch protection changes (this file)
3. ⏳ Create PR for Phase 2 cleanup
4. ⏳ Update branch protection after PR merge
5. ⏳ Verify single quality-gates check works
6. ⏳ Proceed with E2E unquarantine and test unskipping
