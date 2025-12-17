# Production Monitoring

**Last Updated:** 2025-12-18
**Owner:** DevOps
**Status:** Active

## Overview

Automated monitoring of production endpoints via GitHub Actions workflow running every 5 minutes.

## Monitored Endpoints

### 1. API Health Check

**Endpoint:** `https://dixis.gr/api/healthz`
**Method:** GET
**Expected Status:** 200
**Expected Response:** JSON with `{"status":"ok"}`

**Test Command:**
```bash
curl -sS https://dixis.gr/api/healthz
```

**Expected Output:**
```json
{"status":"ok","database":"connected","timestamp":"2025-12-18T...","version":"11.45.2"}
```

---

### 2. Products Page

**Endpoint:** `https://dixis.gr/products`
**Method:** GET
**Expected Status:** 200
**Expected Content:**
- Must contain text: `Προϊόντα` (page title)
- Should contain text: `συνολικά` (product count)
- Must have product cards with `data-testid="product-card"`

**Test Command:**
```bash
curl -sS https://dixis.gr/products | grep -o "Προϊόντα"
curl -sS https://dixis.gr/products | grep -o "συνολικά"
curl -sS https://dixis.gr/products | grep -c 'data-testid="product-card"'
```

**Expected Output:**
```
Προϊόντα
συνολικά
4
```

---

### 3. Auth Pages

**Endpoint:** `https://dixis.gr/auth/login`
**Method:** GET
**Expected Status:** 200
**Expected Content:** Login form

**Endpoint:** `https://dixis.gr/auth/register`
**Method:** GET
**Expected Status:** 200
**Expected Content:** Registration form

**Test Commands:**
```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://dixis.gr/auth/login
curl -sS -o /dev/null -w "%{http_code}\n" https://dixis.gr/auth/register
```

**Expected Output:**
```
200
200
```

---

## Monitoring Workflow

**Location:** `.github/workflows/monitor-uptime.yml`
**Schedule:** Every 5 minutes (`*/5 * * * *`)
**Timeout:** 3 minutes per check

### Failure Handling

When a check fails:
1. Workflow turns red in GitHub Actions
2. GitHub sends notification to repository watchers
3. Check logs in Actions tab for exact failure reason
4. Manual investigation required

### Manual Trigger

Run monitoring on-demand:
```bash
gh workflow run monitor-uptime.yml
```

Or via GitHub UI: Actions → Monitor Uptime → Run workflow

---

## Alert Thresholds

| Check | Failure Condition | Action |
|-------|------------------|--------|
| API Health | HTTP ≠ 200 | Exit 1 (fail workflow) |
| Products Page | HTTP ≠ 200 OR missing "Προϊόντα" | Exit 1 (fail workflow) |
| Products Count | Missing "συνολικά" | Warning only (log) |
| Auth Pages | HTTP ≠ 200 | Exit 1 (fail workflow) |

---

## Investigation Playbook

### If API Health Fails

1. Check backend status:
   ```bash
   ssh dixis-prod 'pm2 status | grep dixis-backend'
   ```

2. Check backend logs:
   ```bash
   ssh dixis-prod 'pm2 logs dixis-backend --lines 50'
   ```

3. Check database connection:
   ```bash
   ssh dixis-prod 'cd /var/www/dixis/backend && php artisan db:show'
   ```

### If Products Page Fails

1. Check frontend status:
   ```bash
   ssh dixis-prod 'pm2 status | grep dixis-frontend'
   ```

2. Check frontend logs:
   ```bash
   ssh dixis-prod 'pm2 logs dixis-frontend --lines 50'
   ```

3. Verify backend API:
   ```bash
   curl -sS https://dixis.gr/api/v1/public/products
   ```

### If Auth Pages Fail

1. Check for deployment issues:
   ```bash
   ssh dixis-prod 'cd /var/www/dixis/frontend && git log -1'
   ```

2. Check nginx config:
   ```bash
   ssh dixis-prod 'sudo nginx -t'
   ```

3. Check frontend build:
   ```bash
   ssh dixis-prod 'ls -lah /var/www/dixis/current/frontend/.next'
   ```

---

## Future Enhancements

- [ ] Add response time monitoring (warn if >2s)
- [ ] Add SSL certificate expiry check
- [ ] Add database query performance metrics
- [ ] Integrate with external monitoring service (UptimeRobot, Pingdom)
- [ ] Add Slack/Discord notifications
- [ ] Monitor staging environment

---

## Related Documentation

- [VPS Management](VPS-MANAGEMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Incident Response](../PLAYBOOKS/incident-response.md)
