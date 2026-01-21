# Launch Runbook: Dixis V1

**Purpose:** Step-by-step operational checklist for V1 launch
**Created:** 2026-01-22
**Related:** `RUNBOOK-V1-LAUNCH-24H.md` (monitoring), `POST-LAUNCH-CHECKS.md` (verification)

---

## Pre-Launch Checklist

### T-24h: Final Verification

| # | Task | Command/Action | Expected | Done |
|---|------|----------------|----------|------|
| 1 | Sync to latest main | `git pull origin main` | Clean pull | |
| 2 | Run prod-facts.sh | `./scripts/prod-facts.sh` | ALL PASS | |
| 3 | Verify API health | `curl https://dixis.gr/api/healthz` | `{"status":"ok"}` | |
| 4 | Check E2E tests | `cd frontend && npm run test:e2e` | 70+ PASS | |
| 5 | Review error logs | SSH + check Laravel logs | No P1 errors | |
| 6 | Confirm payment config | Check `/api/health` | Stripe configured | |
| 7 | Confirm email config | Check `/api/health` | Resend configured | |

### T-4h: Pre-Announce

| # | Task | Command/Action | Expected | Done |
|---|------|----------------|----------|------|
| 1 | Clear old logs | `php artisan log:clear` (optional) | Clean slate | |
| 2 | Warm caches | Visit key pages manually | Fast response | |
| 3 | Document rollback SHA | Record in STATE.md | SHA noted | |
| 4 | Notify team | Slack/email announcement | Acknowledged | |

### T-1h: Final Go/No-Go

| # | Check | Pass Criteria | Decision |
|---|-------|---------------|----------|
| 1 | prod-facts.sh | ALL PASS | GO / NO-GO |
| 2 | Recent errors | None in last 1h | GO / NO-GO |
| 3 | Team availability | Someone on-call | GO / NO-GO |
| 4 | Rollback tested | Procedure documented | GO / NO-GO |

---

## Launch Steps

### T-0: Execute Launch

| # | Step | Action | Verification |
|---|------|--------|--------------|
| 1 | Announce internally | "V1 is LIVE" to team | Acknowledged |
| 2 | Monitor health | `watch -n 30 ./scripts/prod-facts.sh` | Continuous green |
| 3 | Test guest checkout | Manual test on production | Order created |
| 4 | Test user checkout | Login + card payment test | Payment init OK |
| 5 | Check email delivery | Verify confirmation email | Email received |

### T+15m: First Health Check

```bash
# Run full health check
./scripts/prod-facts.sh

# Check for new errors
ssh dixis-prod 'tail -20 /var/www/dixis/current/backend/storage/logs/laravel.log'

# Verify page response times
curl -sS -o /dev/null -w "Homepage: %{time_starttransfer}s\n" https://dixis.gr/
curl -sS -o /dev/null -w "Products: %{time_starttransfer}s\n" https://dixis.gr/products
```

### T+1h: First Comprehensive Check

| Check | Command | Expected |
|-------|---------|----------|
| API Health | `curl https://dixis.gr/api/healthz` | `{"status":"ok"}` |
| Products API | `curl https://dixis.gr/api/v1/public/products \| jq '.data \| length'` | > 0 |
| Error count | Check Laravel log | 0 new errors |
| VPS resources | `ssh dixis-prod 'uptime && free -h'` | Load < 1.0 |

---

## Rollback Procedure

### When to Rollback

| Severity | Trigger | Action |
|----------|---------|--------|
| P0 | Site down (5xx on homepage) | Immediate rollback |
| P0 | Data corruption detected | Immediate rollback |
| P1 | Checkout broken | Evaluate, likely rollback |
| P1 | Payment failures | Evaluate, likely rollback |
| P2 | Non-critical feature broken | Fix forward if possible |
| P3 | UI glitch | Fix forward |

### Quick Rollback (< 5 min)

```bash
# 1. Revert the last commit
git revert HEAD --no-edit

# 2. Push to trigger auto-deploy
git push origin main

# 3. Monitor deployment
# Check GitHub Actions for deployment status

# 4. Verify after deploy completes (~2-3 min)
curl -sS https://dixis.gr/api/healthz
curl -sS -o /dev/null -w "%{http_code}\n" https://dixis.gr/
```

### Full Rollback to Known-Good SHA

```bash
# WARNING: Destructive operation - coordinate with team first

# 1. Identify rollback target
ROLLBACK_SHA="06850e79"  # From STATE.md pre-V1 section

# 2. Reset to that SHA
git fetch origin
git reset --hard $ROLLBACK_SHA

# 3. Force push (requires team coordination)
git push --force origin main

# 4. Verify
./scripts/prod-facts.sh
```

### Post-Rollback Actions

1. [ ] Notify team of rollback
2. [ ] Document what went wrong
3. [ ] Capture error logs for analysis
4. [ ] Create incident report
5. [ ] Plan fix for next attempt

---

## Escalation Path

| Severity | Response Time | Who | Contact |
|----------|---------------|-----|---------|
| P0 (Site Down) | Immediate | On-call engineer | Team Slack |
| P1 (Critical Bug) | < 30 min | Development team | GitHub issue |
| P2 (Major Issue) | < 4h | Development team | GitHub issue |
| P3 (Minor Issue) | Next business day | Backlog | GitHub issue |

---

## Service Dependencies

| Service | Provider | Dashboard | Status Page |
|---------|----------|-----------|-------------|
| VPS | Hostinger | hostinger.com | - |
| Database | Neon | console.neon.tech | neonstatus.com |
| Email | Resend | resend.com/dashboard | status.resend.com |
| Payments | Stripe | dashboard.stripe.com | status.stripe.com |

### Checking Service Status

```bash
# Quick check all critical endpoints
echo "=== API Health ===" && curl -sS https://dixis.gr/api/healthz
echo "=== Products API ===" && curl -sS https://dixis.gr/api/v1/public/products | head -c 100
echo "=== Homepage ===" && curl -sS -o /dev/null -w "%{http_code}\n" https://dixis.gr/
```

---

## Communication Templates

### Launch Announcement (Internal)

```
[Dixis] V1 Launch Executed

Status: LIVE at https://dixis.gr
Time: [timestamp]
Rollback SHA: 06850e79

Monitoring active. Report any issues immediately.
```

### Issue Detected

```
[Dixis] Issue Detected - [Severity]

Description: [what's broken]
Impact: [who/what is affected]
Status: [investigating/rolling back/fixed]
ETA: [if known]
```

### Rollback Complete

```
[Dixis] Rollback Complete

Reason: [why we rolled back]
Rolled back to: [SHA]
Status: Site operational
Next steps: [investigation plan]
```

---

## References

- **Release Notes:** `docs/PRODUCT/RELEASE-NOTES-V1.md`
- **24h Monitoring:** `docs/OPS/RUNBOOK-V1-LAUNCH-24H.md`
- **Post-Launch Checks:** `docs/OPS/POST-LAUNCH-CHECKS.md`
- **State:** `docs/OPS/STATE.md`

---

_Runbook: LAUNCH-RUNBOOK-V1 | 2026-01-22_
