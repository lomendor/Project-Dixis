# Pass 28: Deploy Staging Signal Fix (Evidence-Based)

**Date**: 2025-12-23
**Status**: IN PROGRESS
**Priority**: P2 (Operational debt - main branch has failing workflows)

---

## Problem Statement

After Pass 27 merge to main, 3 workflows are FAILING on every push:
1. **Deploy Staging**: Run #20471409483 - FAILURE (2m42s)
2. **Staging Smoke**: Run #20471409463 - FAILURE (5s)
3. **os-state-capsule**: Run #20471409476 - FAILURE (21s)

These failures appear on main branch (push event), not PR. Critical checks (CI, E2E, PROD deploy) are GREEN.

**Current State**: Failures labeled "known/non-blocking" WITHOUT evidence/root cause → UNACCEPTABLE.

**Required**: Hard evidence from logs + root cause + minimal fix OR proper SKIP guards.

---

## Definition of Done (DoD)

1. **Evidence Collected**: Logs from all 3 failing runs analyzed and root cause identified
2. **Fix Applied**:
   - Either: Fix the actual issue (if script bug/config error)
   - Or: Add `if:` guards to SKIP gracefully when prerequisites missing (secrets/env/permissions)
   - Or: Change triggers if workflows should only run on PR, not main push
3. **Main Branch Clean**: Next main push shows SKIP (not FAIL) for staging workflows if prerequisites absent
4. **Docs Updated**: Root cause + fix documented in STATE.md + Pass 28 summary
5. **PR Merged**: ops-only PR with auto-merge, all checks green

---

## Constraints

- **No VPS changes**: Only workflow/CI changes
- **Minimal diffs**: ops-only, smallest possible change
- **Evidence-first**: Must paste actual logs showing root cause
- **STOP if scope expands**: No feature work, pure CI/ops hygiene

---

## Investigation Plan

### Phase 0: Rehydrate + Docs ✅
- [x] Create branch: `ops/pass28-staging-ci-signal`
- [x] Create task doc: `docs/AGENT/TASKS/Pass-28-deploy-staging-signal.md`
- [x] Create summary stub: `docs/AGENT/SUMMARY/Pass-28.md`
- [ ] Update STATE.md (Pass 28 → IN PROGRESS)
- [ ] Update AGENT-STATE.md (Pass 28 → WIP)

### Phase 1: Pull Logs/Evidence

**Run #20471409483 - Deploy Staging**:
```bash
gh run view 20471409483 --json name,conclusion,htmlURL,workflowName,event,createdAt,updatedAt --jq '.'
gh run view 20471409483 --log-failed | sed -n '1,200p'
```

**Run #20471409463 - Staging Smoke**:
```bash
gh run view 20471409463 --json name,conclusion,htmlURL,workflowName,event --jq '.'
gh run view 20471409463 --log-failed | sed -n '1,200p'
```

**Run #20471409476 - os-state-capsule**:
```bash
gh run view 20471409476 --json name,conclusion,htmlURL,workflowName,event --jq '.'
gh run view 20471409476 --log-failed | sed -n '1,200p'
```

**Locate Workflow Files**:
```bash
ls -la .github/workflows
rg -n "Deploy Staging|Staging Smoke|os-state-capsule" .github/workflows
```

### Phase 2: Root Cause Analysis

For each failing run, determine:
1. **Why it failed** (missing secrets, wrong trigger, script bug, permissions)
2. **Should it run on main push?** (or PR-only)
3. **Minimal fix**: Skip guard vs actual fix vs trigger change

**Possible Root Causes**:
- Missing staging secrets/credentials on main branch
- Workflow triggered on main but should be PR-only
- Hardcoded assumptions about environment
- Script expecting variables not set in main context

**Fix Patterns**:
```yaml
# Pattern A: Skip if secrets missing
jobs:
  deploy-staging:
    if: github.event_name == 'pull_request' || env.STAGING_SECRET != ''

# Pattern B: PR-only trigger
on:
  pull_request:
    branches: [main]
  # Remove push trigger if not needed

# Pattern C: Explicit skip on main
jobs:
  staging-smoke:
    if: github.event_name != 'push'
```

### Phase 3: Implement Fix

**Workflow Files to Check**:
- `.github/workflows/deploy-staging.yml` (if exists)
- `.github/workflows/smoke-staging.yml` (if exists)
- `.github/workflows/os-state-capsule.yml` (if exists)

**Changes**:
- Add `if:` conditions to skip when prerequisites missing
- OR adjust triggers to PR-only if staging is not needed on main
- Update job names/descriptions to clarify intent

### Phase 4: Close-Out Docs

**Update STATE.md**:
- Add Pass 28 to CLOSED with summary
- Document root cause + fix for each workflow

**Update Pass-28.md**:
- Evidence section with log excerpts
- Root cause per failing run
- Fix applied (exact lines changed)
- Why it's safe

### Phase 5: PR + Auto-Merge

```bash
git add -A
git commit -m "ops(ci): Pass 28 - fix staging workflow failures with evidence"
gh pr create --title "Pass 28: CI/ops — fix staging workflow failures (evidence-based)" \
  --body "..." \
  --label "ai-pass" --label "risk-ok" --label "ops-only"
gh pr merge --auto --squash --delete-branch
```

---

## Risk Assessment

**Low Risk** (ops-only, CI workflow changes):
- Only affects workflow execution logic
- No production code changes
- No VPS/infrastructure changes
- Changes isolated to `.github/workflows/`

**Potential Issues**:
- If we skip too aggressively, may miss real staging issues
- If we fix wrong root cause, may still fail

**Mitigation**:
- Evidence-first approach (logs before fix)
- Minimal changes (add guards, don't rewrite workflows)
- Test in PR before merge

---

## Success Criteria

**Pass 28 Complete** when:
- ✅ Logs collected from all 3 failing runs
- ✅ Root cause identified and documented
- ✅ Fix applied (skip guards OR actual fix)
- ✅ Next main push shows SKIP (not FAIL) for staging workflows
- ✅ Docs updated (STATE + Pass-28 summary)
- ✅ PR merged with ai-pass, risk-ok, ops-only labels

---

**Next**: Execute Phase 1 (pull logs and evidence)
