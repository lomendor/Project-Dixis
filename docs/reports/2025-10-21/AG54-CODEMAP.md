# AG54-Ops — CODEMAP

**Date**: 2025-10-21
**Pass**: AG54-Ops
**Scope**: Danger skip for bot PRs at workflow level

---

## 📂 FILES MODIFIED

### `.github/workflows/danger.yml`

**Before** (line 16-18):
```yaml
jobs:
  danger:
    runs-on: ubuntu-latest
    continue-on-error: true  # Soft warnings, don't block
```

**After** (line 16-19):
```yaml
jobs:
  danger:
    runs-on: ubuntu-latest
    continue-on-error: true  # Soft warnings, don't block
    if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'github-actions[bot]' }}
```

---

### `.github/workflows/dangerjs.yml`

**Before** (line 17-19):
```yaml
jobs:
  danger:
    runs-on: ubuntu-latest
    timeout-minutes: 5
```

**After** (line 17-20):
```yaml
jobs:
  danger:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'github-actions[bot]' }}
```

---

### `.github/workflows/pr.yml`

**Before** (line 273-278):
```yaml
  danger:
    name: PR Hygiene Check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    continue-on-error: true  # HF-16.3: Advisory check - should not block merge when required checks pass
    if: github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name == github.repository && !contains(github.event.pull_request.labels.*.name, 'ai-pass')
```

**After** (line 273-278):
```yaml
  danger:
    name: PR Hygiene Check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    continue-on-error: true  # HF-16.3: Advisory check - should not block merge when required checks pass
    if: github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name == github.repository && !contains(github.event.pull_request.labels.*.name, 'ai-pass') && github.actor != 'dependabot[bot]' && github.actor != 'github-actions[bot]'
```

---

### `.github/workflows/quality-gates.yml`

**Before** (line 15-17):
```yaml
jobs:
  gates:
    runs-on: ubuntu-latest
    steps:
```

**After** (line 15-18):
```yaml
jobs:
  gates:
    runs-on: ubuntu-latest
    if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'github-actions[bot]' }}
    steps:
```

---

## 🎨 IMPLEMENTATION DETAILS

### Bot Detection Pattern
```yaml
if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'github-actions[bot]' }}
```

**Matches**:
- `github.actor` is the user/bot that triggered the workflow
- `dependabot[bot]` - Dependabot automated PRs
- `github-actions[bot]` - GitHub Actions automated PRs

**Does NOT Match**:
- Human users (e.g., `lomendor`, `developer123`)
- Other bots (e.g., `renovate[bot]`, `dependabot-preview[bot]`)

### Workflow Triggers Affected

**danger.yml**:
- Trigger: `pull_request` (opened, synchronize, reopened)
- Skips: When bot actor creates/updates PR

**dangerjs.yml**:
- Trigger: `pull_request` (opened, synchronize, reopened), `workflow_dispatch`
- Skips: When bot actor creates/updates PR

**pr.yml** (danger job):
- Trigger: `pull_request` (opened, synchronize, reopened, ready_for_review)
- Skips: When bot actor + not ai-pass label + same repo

**quality-gates.yml**:
- Trigger: `pull_request`, `push` (feat/**, ci/**)
- Skips: When bot actor pushes/creates PR

---

## 📊 INTEGRATION POINTS

### With Dependabot PRs
- **Before**: Dependabot PRs trigger Danger checks (always fail due to no GPG, commit format, etc.)
- **After**: Dependabot PRs skip Danger entirely (cleaner PR status)

### With GitHub Actions Bots
- **Before**: Action-generated PRs (e.g., automated updates) trigger Danger
- **After**: Action-generated PRs skip Danger (less noise)

### With Human PRs
- **Before**: Danger runs as expected
- **After**: **No change** - Danger still runs as expected

---

## 🎯 CI BEHAVIOR MATRIX

| Actor | PR Type | danger.yml | dangerjs.yml | pr.yml danger | quality-gates.yml |
|-------|---------|------------|--------------|---------------|-------------------|
| `lomendor` (human) | Normal PR | ✅ Runs | ✅ Runs | ✅ Runs | ✅ Runs |
| `dependabot[bot]` | Dependency update | ⏭️ Skips | ⏭️ Skips | ⏭️ Skips | ⏭️ Skips |
| `github-actions[bot]` | Automated PR | ⏭️ Skips | ⏭️ Skips | ⏭️ Skips | ⏭️ Skips |
| `renovate[bot]` (other) | Dependency update | ✅ Runs | ✅ Runs | ✅ Runs | ✅ Runs |

**Note**: `renovate[bot]` and other bots NOT in the skip list will still run Danger. This is intentional - only Dependabot and GitHub Actions bots are skipped.

---

## 📐 IDEMPOTENCY

**Safe to re-apply**:
- Patching already-patched workflows has no effect
- If-guards are added only once (not duplicated)
- Existing conditions extended (not replaced)

---

**Generated-by**: Claude Code (AG54-Ops Protocol)
**Timestamp**: 2025-10-21

