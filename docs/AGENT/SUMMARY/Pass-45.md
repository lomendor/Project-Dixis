# Pass 45 - Deploy Workflow Hardening

**Date**: 2025-12-28
**Status**: CLOSED
**PRs**: #1916 (partial fix), #1917 (final hardening)

## Problem Statement

Both `deploy-staging.yml` and `deploy-prod.yml` workflows were showing failures on every push to main, creating CI noise:
- `deploy-prod.yml`: 0s instant failure with "workflow file issue"
- `deploy-staging.yml`: 0s failure (workflow file issue) or 2m+ failure (SSH permission denied)

## Root Cause Analysis

| Workflow | Root Cause |
|----------|------------|
| `deploy-prod.yml` | Complex 149-line bash script with nested quotes caused YAML parsing issues |
| `deploy-staging.yml` | (1) Invalid `secrets.SSH_PRIVATE_KEY` in job-level `if:` (PR #1916), (2) SSH key not configured for staging environment |

## Solution (PR #1917)

### deploy-prod.yml
- **Replaced with minimal deprecated stub** (33 lines)
- Only `workflow_dispatch` trigger (no push/PR)
- Single job that prints deprecation notice and exits 0
- Points users to `deploy-frontend.yml` (canonical deploy path)

### deploy-staging.yml
- **Made manual-only** (`workflow_dispatch` only)
- Disabled `push` and `pull_request` triggers (commented out)
- Added documentation on how to re-enable once staging secrets are configured
- Prevents SSH failures on main pushes

## Evidence

### Before (failing)
- deploy-prod: https://github.com/lomendor/Project-Dixis/actions/runs/20545056933 (0s failure)
- deploy-staging: https://github.com/lomendor/Project-Dixis/actions/runs/20545057389 (2m23s SSH failure)

### After (fixed)
- PR #1917 merged: 2025-12-28T03:57:51Z
- **No new runs** for deploy-prod or deploy-staging after merge (verified via `gh run list`)
- Both workflows now manual-only

## Files Changed

### PR #1916 (partial fix)
- `.github/workflows/deploy-staging.yml`: Fixed invalid secrets reference in job-level `if:`
- `.github/workflows/deploy-prod.yml`: Added `if: github.event_name == 'workflow_dispatch'` guard

### PR #1917 (final hardening)
- `.github/workflows/deploy-prod.yml`: Replaced with minimal deprecated stub (-151 lines)
- `.github/workflows/deploy-staging.yml`: Made manual-only, added documentation (+35/-12 lines)

## Canonical Deploy Path

**Production deployments use `deploy-frontend.yml`** - this workflow is unaffected and continues to work correctly.

## To Re-enable Staging Deploys

1. Configure staging secrets in GitHub:
   - `SSH_PRIVATE_KEY`
   - `STAGING_HOST`
   - `STAGING_USER`
   - `STAGING_PATH`
2. Add SSH public key to staging VPS `authorized_keys`
3. Uncomment the `push`/`pull_request` triggers in `deploy-staging.yml`

## DoD Checklist

- [x] Root cause identified (workflow file issue + SSH key not configured)
- [x] deploy-prod.yml: No longer shows 0s failures (manual-only stub)
- [x] deploy-staging.yml: No longer fails on push (manual-only)
- [x] Evidence: `gh run list` shows no new runs after merge
- [x] PRs merged with ai-pass label
- [x] Docs updated

---
Generated-by: Claude (Pass 45)
