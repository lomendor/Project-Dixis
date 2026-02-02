# Pass OPS-DEPLOY-GUARD-01: VPS Frontend Deploy Guardrails

**Created**: 2026-02-02
**Status**: IN_PROGRESS
**Priority**: P0 (Blocks reliable deploys)

## Problem Statement

The VPS frontend deploy workflow (`deploy-frontend.yml`) lacks critical guardrails:

1. **Symlink Loss**: rsync `--delete` wipes the `.env` symlink, causing "env file not found" failures
2. **Nginx Drift**: If nginx config changes, `/api/producer/*` routes may go to Laravel instead of Next.js
3. **Port Conflicts**: pm2 crashes in loop if port 3000 is occupied by orphan processes
4. **No Security Smoke**: Post-deploy doesn't verify API auth is working (P0-SEC-01 regression possible)

## Root Cause (from 2026-02-02 incident)

- Deploy failed: `.env file not found at /var/www/dixis/current/frontend/.env`
- Actual env was at `/var/www/dixis/shared/frontend.env` - needed symlink
- Nginx routed all `/api/*` to Laravel; needed explicit `/api/producer/*` → Next.js
- pm2 had "too many unstable restarts" due to EADDRINUSE on port 3000

## Definition of Ready (DoR)

- [x] Workflow file identified: `.github/workflows/deploy-frontend.yml`
- [x] VPS paths confirmed via SSH inspection
- [x] nginx config snippet captured
- [x] Required env vars list: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_API_BASE`

## Scope

### In Scope
1. Add post-rsync symlink recreation step
2. Add nginx config verification step (detect-only, fail if missing)
3. Add pm2/port health check before start
4. Add security smoke test (POST to producer API returns 401)
5. Create VPS deploy runbook documentation

### Out of Scope
- Modifying nginx config automatically (too risky)
- Changing business logic
- Modifying backend workflows

## Definition of Done (DoD)

- [ ] Workflow includes: symlink recreation after rsync
- [ ] Workflow includes: nginx config verification (grep for `/api/producer/`)
- [ ] Workflow includes: port 3000 health check before pm2 start
- [ ] Workflow includes: security smoke test (401 JSON from `/api/producer/orders/test/status`)
- [ ] Runbook created at `docs/OPS/RUNBOOKS/vps-frontend-deploy.md`
- [ ] PR merged with ai-pass label
- [ ] Post-merge deploy succeeds
- [ ] Production verified via curl

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Symlink path changes | Hardcode in workflow + document in runbook |
| nginx config auto-edit breaks prod | Detect-only approach, fail with clear instructions |
| Additional steps slow deploy | Steps are quick SSH commands (<10s each) |

## Verification Commands

```bash
# Symlink exists
ssh dixis-prod 'ls -la /var/www/dixis/current/frontend/.env'

# nginx has producer route
ssh dixis-prod 'grep -q "api/producer" /etc/nginx/sites-enabled/dixis.gr && echo OK'

# pm2 running
ssh dixis-prod 'pm2 list | grep dixis-frontend | grep online'

# Security smoke
curl -sS -X POST https://dixis.gr/api/producer/orders/test/status \
  -H "Content-Type: application/json" -d '{"status":"shipped"}' \
  | grep -q "error" && echo "Auth working"
```

## Related

- PR #2579: P0-SEC-01 security fix (merged)
- Incident: 2026-02-02 deploy failures
