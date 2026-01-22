# Pass OPS-POST-LAUNCH-CHECKS-01: Scheduled Prod Monitoring

**Date**: 2026-01-22T16:50:00Z
**Commit**: TBD (pending merge)
**Pass ID**: OPS-POST-LAUNCH-CHECKS-01

---

## TL;DR

Added automated, scheduled production monitoring via GitHub Actions. Non-blocking workflows run daily and upload artifacts.

---

## Workflows Created/Updated

### NEW: post-launch-checks.yml

**Path**: `.github/workflows/post-launch-checks.yml`

**Schedule**: Daily at 05:30 UTC (07:30 Europe/Athens)

**Triggers**:
- `schedule: '30 5 * * *'`
- `workflow_dispatch` (manual)

**Scripts Run**:
1. `scripts/prod-facts.sh` - endpoint validation
2. `scripts/perf-baseline.sh` - TTFB measurements
3. `scripts/prod-qa-v1.sh` - V1 QA smoke tests

**Features**:
- Non-blocking (not in required checks)
- 15-minute timeout
- Artifact upload (30-day retention)
- Summary generation

### FIX: prod-facts.yml

**Path**: `.github/workflows/prod-facts.yml`

**Changes**:
- Removed commit step (output now gitignored)
- Updated artifact path to `docs/OPS/.local/PROD-FACTS-LAST.md`
- Added timeout (10 minutes)
- Fixed issue creation on failure

---

## Non-Blocking Design

These workflows are **informational only**:
- NOT added to required checks
- Do NOT block PRs or deployments
- Auto-create GitHub Issues on failure for visibility
- Artifacts available for 30 days

---

## Manual Trigger

```bash
# Run post-launch checks manually
gh workflow run post-launch-checks.yml

# Run prod-facts manually
gh workflow run prod-facts.yml
```

---

## Evidence

After merge, first scheduled run will be:
- `post-launch-checks.yml`: Next day at 05:30 UTC
- `prod-facts.yml`: Next day at 07:00 UTC

Manual trigger available immediately via `workflow_dispatch`.

---

## Artifacts

- `.github/workflows/post-launch-checks.yml` (NEW)
- `.github/workflows/prod-facts.yml` (UPDATED)
- `docs/OPS/POST-LAUNCH-CHECKS.md` (UPDATED)

---

**Automated Monitoring: ENABLED**
