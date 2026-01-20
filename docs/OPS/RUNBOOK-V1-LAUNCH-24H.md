# Runbook: V1 Launch — First 24 Hours

**Created**: 2026-01-20
**Purpose**: Keep production stable, detect regressions early, retain rollback path.

---

## Monitoring Schedule

Check every 2-4 hours for the first 24 hours post-launch.

### 1. Health Endpoints

| Endpoint | Expected | Command |
|----------|----------|---------|
| `/api/healthz` | HTTP 200, `status: ok` | `curl -sS https://dixis.gr/api/healthz` |
| `/api/v1/public/products` | HTTP 200, products array | `curl -sS https://dixis.gr/api/v1/public/products \| head -c 200` |

### 2. Core Pages

| Page | Expected | Command |
|------|----------|---------|
| `/products` | HTTP 200, < 500ms TTFB | `curl -sS -o /dev/null -w "%{http_code} %{time_starttransfer}s\n" https://dixis.gr/products` |
| `/checkout` | HTTP 200, < 500ms TTFB | `curl -sS -o /dev/null -w "%{http_code} %{time_starttransfer}s\n" https://dixis.gr/checkout` |
| `/` | HTTP 200 | `curl -sS -o /dev/null -w "%{http_code}\n" https://dixis.gr/` |

### 3. Email Delivery

Verify at least one transactional email delivered since launch:
```bash
ssh dixis-prod 'tail -50 /var/www/dixis/current/backend/storage/logs/laravel.log | grep -i "mail\|email\|resend"'
```

### 4. VPS Resources

```bash
ssh dixis-prod 'uptime && free -h && df -h /'
```

---

## Automated Scripts

### Quick Health Check
```bash
./scripts/prod-facts.sh
```

### Performance Baseline
```bash
bash scripts/perf-baseline.sh
```

---

## Red Flags / Alarms

| Signal | Severity | Action |
|--------|----------|--------|
| 5xx errors on any endpoint | P1 | Check Laravel logs, consider rollback |
| `/products` timeout (> 5s) | P1 | Check Neon DB, IPv6 fallback issue |
| Email delivery failures | P2 | Check Resend API status, RESEND_KEY |
| VPS CPU > 80% sustained | P2 | Check PHP-FPM pool, consider pm.max_children increase |
| Disk usage > 90% | P2 | Clear old logs, artifacts |

---

## Rollback Procedure

### Quick Rollback (< 5 min)
```bash
cd /path/to/Project-Dixis
git revert HEAD
git push origin main
# Deploys trigger automatically via GitHub Actions
```

### Full Rollback to Specific SHA
```bash
ROLLBACK_SHA="52c53a96"  # Update from STATE.md
git reset --hard $ROLLBACK_SHA
git push --force origin main  # DANGER: coordinate with team first
```

### Verify After Rollback
```bash
curl -sS https://dixis.gr/api/healthz
curl -sS https://dixis.gr/products -o /dev/null -w "%{http_code}\n"
```

---

## Contacts

- **VPS**: Hostinger (Frankfurt), SSH alias `dixis-prod`
- **DB**: Neon (PostgreSQL, eu-central-1)
- **Email**: Resend
- **Payments**: Stripe (test mode)

---

## Post-24h Actions

After 24 hours of stable operation:
1. Archive this runbook findings to `docs/OPS/POST-LAUNCH-REPORT.md`
2. Consider increasing monitoring interval to every 8-12 hours
3. Prioritize post-V1 nice-to-haves based on observed issues

---

_Runbook: V1-LAUNCH-24H | Generated: 2026-01-20 | Author: Claude_
