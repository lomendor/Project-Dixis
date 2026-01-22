# VPS Hygiene Checklist

**Purpose:** Safe maintenance checklist for production VPS
**Created:** 2026-01-22
**SSH Alias:** `dixis-prod`

---

## Pre-Maintenance Checks

Before any maintenance, verify production health:

```bash
# 1. Check current health
curl -sS https://dixis.gr/api/healthz | jq '.status'

# 2. Run prod-facts locally
./scripts/prod-facts.sh
```

Only proceed if all checks pass.

---

## Resource Monitoring

### Check Disk Usage

```bash
ssh dixis-prod 'df -h /'
```

| Threshold | Status | Action |
|-----------|--------|--------|
| < 70% | OK | No action |
| 70-80% | Warning | Plan cleanup |
| 80-90% | Critical | Immediate cleanup |
| > 90% | Emergency | Stop non-critical services, cleanup |

**Cleanup commands (safe):**

```bash
# Clear old Laravel logs (keep last 7 days)
ssh dixis-prod 'find /var/www/dixis/current/backend/storage/logs -name "*.log" -mtime +7 -delete'

# Clear old deployment artifacts (if using releases)
ssh dixis-prod 'ls -la /var/www/dixis/releases | head -20'

# Check large files
ssh dixis-prod 'du -sh /var/www/dixis/current/backend/storage/*'
```

### Check Memory Usage

```bash
ssh dixis-prod 'free -h'
```

| Threshold | Status | Action |
|-----------|--------|--------|
| Used < 70% | OK | No action |
| Used 70-80% | Warning | Monitor PHP-FPM pool |
| Used > 80% | Critical | Review pm.max_children |

### Check CPU Load

```bash
ssh dixis-prod 'uptime'
```

| Load Avg | Status (for 1-2 CPU) |
|----------|---------------------|
| < 1.0 | OK |
| 1.0-2.0 | Warning |
| > 2.0 | Critical |

---

## Security Updates

### Check for Pending Updates

```bash
ssh dixis-prod 'apt list --upgradable 2>/dev/null | head -20'
```

### Check if Reboot Required

```bash
ssh dixis-prod 'cat /var/run/reboot-required 2>/dev/null || echo "No reboot required"'
```

### Safe Update Procedure

**STOP**: Always coordinate with team before updates.

```bash
# 1. Check what will be updated
ssh dixis-prod 'apt list --upgradable'

# 2. Take note of current state
ssh dixis-prod 'uptime && free -h && df -h /'

# 3. Apply security updates only (non-interactive)
ssh dixis-prod 'sudo apt-get update && sudo apt-get upgrade -y --only-upgrade'

# 4. Verify services
ssh dixis-prod 'systemctl status nginx php8.2-fpm'

# 5. Check production health
curl -sS https://dixis.gr/api/healthz
```

### If Reboot Required

**STOP**: Confirm with team before proceeding.

```bash
# 1. Announce maintenance window
# 2. Verify no active orders in progress
ssh dixis-prod 'tail -5 /var/www/dixis/current/backend/storage/logs/laravel.log'

# 3. Reboot
ssh dixis-prod 'sudo reboot'

# 4. Wait ~2 minutes, then verify
curl -sS https://dixis.gr/api/healthz
./scripts/prod-facts.sh
```

---

## Service Health Checks

### Check PHP-FPM

```bash
ssh dixis-prod 'systemctl status php8.2-fpm'
ssh dixis-prod 'ps aux | grep php-fpm | wc -l'
```

### Check Nginx

```bash
ssh dixis-prod 'systemctl status nginx'
ssh dixis-prod 'nginx -t'  # Config test
```

### Check Laravel Queue (if applicable)

```bash
ssh dixis-prod 'supervisorctl status'
```

---

## Log Review

### Laravel Errors (Last 24h)

```bash
ssh dixis-prod 'grep -c "ERROR" /var/www/dixis/current/backend/storage/logs/laravel.log'
ssh dixis-prod 'tail -50 /var/www/dixis/current/backend/storage/logs/laravel.log | grep -A2 "ERROR"'
```

### Nginx Errors

```bash
ssh dixis-prod 'tail -20 /var/log/nginx/error.log'
```

### Check for 5xx Responses

```bash
ssh dixis-prod 'grep -c " 5[0-9][0-9] " /var/log/nginx/access.log'
```

---

## Rollback Quick Reference

If maintenance causes issues:

```bash
# 1. Check if it's a code issue
./scripts/prod-facts.sh

# 2. If code rollback needed
git revert HEAD --no-edit && git push origin main

# 3. If VPS issue, restart services
ssh dixis-prod 'sudo systemctl restart nginx php8.2-fpm'

# 4. Verify
curl -sS https://dixis.gr/api/healthz
```

---

## Maintenance Log Template

```markdown
## Maintenance - [DATE]

**Time:** [START] - [END]
**Operator:** [NAME]

### Pre-checks
- [ ] prod-facts.sh PASS
- [ ] Team notified

### Actions Taken
- [ ] [Action 1]
- [ ] [Action 2]

### Post-checks
- [ ] prod-facts.sh PASS
- [ ] All endpoints 200

### Notes
[Any observations]
```

---

_VPS Hygiene Checklist | 2026-01-22_
