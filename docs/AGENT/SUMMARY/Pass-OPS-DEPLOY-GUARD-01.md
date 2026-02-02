# Pass OPS-DEPLOY-GUARD-01 Summary

**Status**: COMPLETE
**Date**: 2026-02-02
**PR**: [#2580](https://github.com/lomendor/Project-Dixis/pull/2580)

## Problem

Manual VPS fixes were required after P0-SEC-01 deploy:
1. `.env` symlink deleted by `rsync --delete`
2. nginx routing `/api/producer/*` to Laravel instead of Next.js
3. pm2 orphan process holding port 3000

These issues caused deploy-then-debug loops costing engineering time.

## Solution

Added automated guardrails to `.github/workflows/deploy-frontend.yml`:

### 1. Restore .env symlink (lines 164-208)
- Runs after rsync deploy step
- Creates symlink: `/var/www/dixis/current/frontend/.env` -> `/var/www/dixis/shared/frontend.env`
- Verifies required env keys exist
- Fails fast with actionable error if source missing

### 2. Verify nginx config (lines 210-261)
- Checks `/etc/nginx/sites-enabled/dixis.gr` exists
- Verifies `/api/producer/*` routes to Next.js (port 3000)
- Warns if `/api/healthz` route missing
- Provides fix instructions if config invalid

### 3. Security smoke test (lines 489-524)
- POST to `/api/producer/orders/deploy-test/status`
- Verifies 401 JSON response (auth working)
- Detects if response is 404 HTML (Laravel routing = nginx broken)
- Fails deploy with clear diagnostic message

## Documentation Created

- `docs/AGENT/TASKS/Pass-OPS-DEPLOY-GUARD-01.md` - Task specification
- `docs/OPS/RUNBOOKS/vps-frontend-deploy.md` - Comprehensive runbook with:
  - Architecture diagram
  - Path/file inventory
  - nginx configuration requirements
  - Verification commands
  - Troubleshooting procedures
  - Emergency rollback steps

## Verification

Deploy pipeline now:
1. Prechecks .env exists
2. Deploys via rsync
3. **NEW**: Restores .env symlink
4. **NEW**: Verifies nginx config
5. Configures and starts pm2
6. Runs health checks
7. **NEW**: Runs security smoke test

## Verification Commands

```bash
# Check .env symlink exists
ssh dixis-prod 'ls -la /var/www/dixis/current/frontend/.env'

# Check nginx config
ssh dixis-prod 'grep -q "api/producer" /etc/nginx/sites-enabled/dixis.gr && echo "OK"'

# Security smoke test
curl -sS -X POST "https://dixis.gr/api/producer/orders/test/status" \
  -H "Content-Type: application/json" -d '{"status":"shipped"}'
# Expected: {"error":"Απαιτείται είσοδος"} with HTTP 401
```

## Risks & Rollback

**Risks**:
- New guardrails may fail on edge cases (permissions, nginx config variants)
- False positives in security smoke test if API changes response format

**Rollback**:
- Revert PR #2580 if guardrails cause deploy failures
- Manual deploy still works with runbook: `docs/OPS/RUNBOOKS/vps-frontend-deploy.md`

## Related

- P0-SEC-01: Original security fix (producer order-status API auth)
- OPS-DEPLOY-SSH-RETRY-01: SSH retry configuration (already in workflow)
- OPS-PM2-01: PM2 stability configuration (already in workflow)

## Next

- **P0-ONBOARDING-REAL-01**: Real producer onboarding flow (placeholder)
