# Post-Launch Checks: Dixis V1

**Purpose:** Verification checklist for 24h and 72h post-launch windows
**Created:** 2026-01-22
**Related:** `LAUNCH-RUNBOOK-V1.md`, `RUNBOOK-V1-LAUNCH-24H.md`

---

## 24-Hour Checks

### Health & Availability

| Check | Frequency | Command | Pass Criteria |
|-------|-----------|---------|---------------|
| API healthz | Every 2h | `curl https://dixis.gr/api/healthz` | `{"status":"ok"}` |
| Products API | Every 4h | `curl https://dixis.gr/api/v1/public/products` | Returns products |
| Homepage | Every 2h | `curl -o /dev/null -w "%{http_code}" https://dixis.gr/` | 200 |
| TTFB | Every 4h | `curl -w "%{time_starttransfer}s" -o /dev/null https://dixis.gr/products` | < 500ms |

### Error Monitoring

| Check | Location | Command | Pass Criteria |
|-------|----------|---------|---------------|
| Laravel errors | Server logs | `ssh dixis-prod 'grep -c "ERROR" /var/www/dixis/current/backend/storage/logs/laravel.log'` | < 5 new errors |
| 5xx responses | Nginx logs | `ssh dixis-prod 'grep -c " 5[0-9][0-9] " /var/log/nginx/access.log \| tail -1'` | 0 |
| PHP-FPM | Process | `ssh dixis-prod 'systemctl status php8.2-fpm'` | active (running) |

### Core Flow Verification

| Flow | How to Test | Pass Criteria |
|------|-------------|---------------|
| Guest Checkout | Add product, checkout as guest with COD | Order created, confirmation shown |
| User Checkout | Login, add product, pay with test card | Payment intent created, order confirmed |
| Producer Flow | Login as producer, view dashboard | Dashboard loads with orders |
| Admin Flow | Login as admin, view orders | Orders list visible |

### Resource Utilization

| Resource | Command | Warning | Critical |
|----------|---------|---------|----------|
| CPU | `ssh dixis-prod 'uptime'` | Load > 1.0 | Load > 2.0 |
| Memory | `ssh dixis-prod 'free -h'` | Used > 80% | Used > 90% |
| Disk | `ssh dixis-prod 'df -h /'` | Used > 80% | Used > 90% |

### Email Delivery

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Resend configured | `/api/health` response | `email.configured: true` |
| Test delivery | Create test order | Email received in < 5 min |
| UTF-8 encoding | Check email source | Greek characters display correctly |

---

## 24-Hour Summary Report

Complete this after the first 24 hours:

```markdown
# 24h Post-Launch Report - Dixis V1

**Period:** [Launch time] to [+24h]
**Status:** [STABLE / ISSUES / ROLLBACK]

## Health Summary

| Metric | Result |
|--------|--------|
| API Uptime | XX% |
| Error Count | X errors |
| Avg TTFB | XXXms |
| Orders Processed | X |

## Issues Encountered

| Time | Issue | Severity | Resolution |
|------|-------|----------|------------|
| - | - | - | - |

## Actions Taken

- [ ] Monitored every 2-4 hours
- [ ] Verified all 4 core flows
- [ ] Checked error logs
- [ ] Reviewed resource utilization

## Recommendation

[ ] Continue monitoring at reduced frequency (every 8-12h)
[ ] Investigate issue: [details]
[ ] No action needed - stable operation
```

---

## 72-Hour Checks

### Extended Monitoring

| Check | Frequency | Focus |
|-------|-----------|-------|
| API Health | Every 6h | Consistency |
| Error Trends | Every 12h | New patterns |
| Performance | Every 12h | Degradation |
| Orders | Daily | Flow completion rate |

### Data Integrity

| Check | Query/Command | Pass Criteria |
|-------|---------------|---------------|
| Orphan orders | Check orders with missing user_id (guests OK) | Expected pattern |
| Product consistency | Products have valid producer_id | All valid |
| Order totals | Order total matches line items | All match |

### User Experience

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Cart persistence | Add item, close browser, reopen | Cart retained |
| Cart sync | Login on different device | Cart synced |
| Password reset | Request reset, check email | Email received |

### Security Review

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Failed logins | Check auth logs | No brute force patterns |
| Rate limiting | `curl -X POST` repeated | 429 after limit |
| Admin access | Attempt `/admin` without auth | Redirect to login |

---

## 72-Hour Summary Report

Complete this after 72 hours:

```markdown
# 72h Post-Launch Report - Dixis V1

**Period:** [Launch time] to [+72h]
**Status:** [STABLE / MONITORING / ISSUES]

## Metrics Summary

| Metric | 24h | 48h | 72h |
|--------|-----|-----|-----|
| API Uptime | XX% | XX% | XX% |
| Error Count | X | X | X |
| Orders | X | X | X |
| Avg TTFB | XXXms | XXXms | XXXms |

## Trend Analysis

- [ ] Performance stable
- [ ] Error rate declining
- [ ] User activity growing

## Issues & Resolutions

| Issue | Resolution | Status |
|-------|------------|--------|
| - | - | - |

## Recommendations

- [ ] Reduce monitoring to weekly
- [ ] Address backlog item: [item]
- [ ] Schedule performance review
```

---

## Automated Monitoring Commands

### Quick Health Script

```bash
#!/bin/bash
# Save as: scripts/post-launch-check.sh

echo "=== Dixis V1 Post-Launch Check ==="
echo "Time: $(date)"
echo ""

echo "--- API Health ---"
curl -sS https://dixis.gr/api/healthz
echo ""

echo "--- TTFB ---"
curl -sS -o /dev/null -w "Homepage: %{time_starttransfer}s\n" https://dixis.gr/
curl -sS -o /dev/null -w "Products: %{time_starttransfer}s\n" https://dixis.gr/products
curl -sS -o /dev/null -w "Products API: %{time_starttransfer}s\n" https://dixis.gr/api/v1/public/products
echo ""

echo "--- Product Count ---"
curl -sS https://dixis.gr/api/v1/public/products | jq '.data | length'
echo ""

echo "=== Check Complete ==="
```

### Full prod-facts Check

```bash
./scripts/prod-facts.sh
```

---

## Issue Response Matrix

| Issue Type | 24h Response | 72h Response |
|------------|--------------|--------------|
| Site down | Immediate rollback | Incident review |
| High error rate | Investigate + fix | Root cause analysis |
| Slow response | Monitor trend | Optimize if persistent |
| Email delay | Check Resend status | Review email queue |
| Payment issue | Check Stripe dashboard | Review integration |

---

## Sign-Off Checklist

### 24-Hour Sign-Off

- [ ] All health checks passing
- [ ] Core flows verified
- [ ] No P1/P0 issues
- [ ] Error count acceptable
- [ ] Performance within bounds
- [ ] **Signed off by:** _______________
- [ ] **Date/Time:** _______________

### 72-Hour Sign-Off

- [ ] Stable operation for 72h
- [ ] No recurring issues
- [ ] User feedback positive
- [ ] Ready for reduced monitoring
- [ ] **Signed off by:** _______________
- [ ] **Date/Time:** _______________

---

## Automated Workflows

### GitHub Actions Workflows

| Workflow | Schedule | Scripts | Purpose |
|----------|----------|---------|---------|
| `post-launch-checks.yml` | Daily 05:30 UTC | prod-facts.sh, perf-baseline.sh, prod-qa-v1.sh | Comprehensive daily health check |
| `prod-facts.yml` | Daily 07:00 UTC | prod-facts.sh | Production endpoint validation |
| `monitor-uptime.yml` | Every 5 min | inline curl | Quick uptime ping |

### Manual Trigger

```bash
# Trigger post-launch checks manually
gh workflow run post-launch-checks.yml

# Trigger prod-facts manually
gh workflow run prod-facts.yml
```

### Interpreting Failures

1. **Check workflow artifacts** for detailed logs
2. **Run scripts locally** for debugging: `./scripts/prod-facts.sh`
3. **Review GitHub Issues** auto-created on failure
4. **Update STATE.md** if issue requires tracking

---

## References

- **Release Notes:** `docs/PRODUCT/RELEASE-NOTES-V1.md`
- **Launch Runbook:** `docs/OPS/LAUNCH-RUNBOOK-V1.md`
- **24h Monitoring:** `docs/OPS/RUNBOOK-V1-LAUNCH-24H.md`
- **V1 QA Runbook:** `docs/OPS/RUNBOOK-V1-QA.md`

---

_Post-Launch Checks: V1 | Updated 2026-01-22_
