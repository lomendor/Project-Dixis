# Security Hardening Plan - Project Dixis VPS

## Executive Summary

**Problem**: VPS compromised 2x in 3 days with crypto miners despite fresh OS reinstalls.

**Root Cause**: CVE-2025-55182 was patched, but **multiple other attack vectors remain open**:
1. **Test login endpoint** (`ALLOW_TEST_LOGIN=true`) enables unauthenticated admin token generation
2. **Weak OPS API authentication** (header-only token check, easily brute-forced)
3. **Missing admin role enforcement** on critical endpoints (refunds, analytics, shipping)
4. **Wildcard CORS** allows requests from any origin (CSRF vulnerability)
5. **Zero runtime monitoring** - no CPU/memory alerts, process detection, or intrusion detection

**Impact**: Attackers can bypass authentication, gain admin access, execute code, and run undetected for hours.

**Solution**: 3-phase hardening approach targeting authentication, authorization, and monitoring.

---

## Phase 1: CRITICAL - Stop Active Attack Vectors (Day 1, ~2-3 hours)

### 1.1 Disable Test Login Endpoint ⚠️ CRITICAL

**Risk**: Unauthenticated admin token generation via `/api/v1/test/login`

**Files to modify**:
- `backend/.env` (production VPS)

**Changes**:
```bash
# Current (VULNERABLE):
ALLOW_TEST_LOGIN=true    # or missing (defaults to true)

# Fixed:
ALLOW_TEST_LOGIN=false   # Explicitly disable
```

**Verification**:
```bash
# Should return 404:
curl -X POST https://dixis.gr/api/v1/test/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","role":"admin"}'
```

---

### 1.2 Fix CORS Configuration ⚠️ CRITICAL

**Risk**: Wildcard CORS allows requests from any website (CSRF attacks)

**Files to modify**:
- `backend/.env` (production VPS)

**Changes**:
```bash
# Current (VULNERABLE):
CORS_ALLOWED_ORIGINS=*   # or missing (defaults to wildcard)

# Fixed:
CORS_ALLOWED_ORIGINS=https://dixis.gr,https://www.dixis.gr
```

**Verification**:
```bash
# Should fail with CORS error from different origin:
curl -X OPTIONS https://dixis.gr/api/v1/auth/login \
  -H "Origin: https://attacker.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

### 1.3 Strengthen OPS Token Authentication ⚠️ HIGH

**Risk**: Weak header-only validation, no rate limiting on sensitive endpoints

**Files to modify**:
- `backend/routes/api.php` (lines 806-867)
- `backend/.env` (production VPS)

**Changes**:

**Step 1**: Generate strong OPS token
```bash
# On VPS:
echo "OPS_TOKEN=$(openssl rand -base64 32)" >> backend/.env
```

**Step 2**: Add IP whitelist for OPS endpoints
```php
// backend/routes/api.php (after line 806)
Route::prefix('ops')->middleware(function ($request, $next) {
    $token = $request->header('x-ops-token');
    $allowedToken = env('OPS_TOKEN');
    $allowedIPs = explode(',', env('OPS_ALLOWED_IPS', '127.0.0.1'));

    if (!$allowedToken || $token !== $allowedToken) {
        abort(403, 'Invalid token');
    }

    if (!in_array($request->ip(), $allowedIPs)) {
        abort(403, 'IP not whitelisted');
    }

    return $next($request);
})->group(function () {
    // Existing OPS routes...
});
```

**Step 3**: Update `.env`
```bash
OPS_TOKEN=<generated-32-byte-token>
OPS_ALLOWED_IPS=127.0.0.1,<your-office-ip>
```

**Verification**:
```bash
# Should return 403 from unauthorized IP:
curl https://dixis.gr/api/ops/commission/preview \
  -H "x-ops-token: wrong-token"
```

---

### 1.4 Add Admin Role Middleware ⚠️ HIGH

**Risk**: Any authenticated user can access admin endpoints (refunds, analytics, shipping)

**Files to modify**:
- `backend/app/Http/Middleware/RequireAdmin.php` (NEW)
- `backend/app/Http/Kernel.php`
- `backend/routes/api.php` (lines 139, 163)

**Changes**:

**Step 1**: Create middleware
```php
// backend/app/Http/Middleware/RequireAdmin.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }

        return $next($request);
    }
}
```

**Step 2**: Register middleware
```php
// backend/app/Http/Kernel.php
protected $middlewareAliases = [
    // ... existing
    'admin' => \App\Http\Middleware\RequireAdmin::class,
];
```

**Step 3**: Apply to routes
```php
// backend/routes/api.php (line 139)
Route::middleware(['auth:sanctum', 'admin'])->prefix('refunds')->group(function () {
    // Existing refund routes
});

// Line 163
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/analytics')->group(function () {
    // Existing analytics routes
});

// Line 175 (shipping config)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/shipping')->group(function () {
    // Existing shipping routes
});
```

**Verification**:
```bash
# With consumer token - should return 403:
curl https://dixis.gr/api/v1/admin/analytics/overview \
  -H "Authorization: Bearer <consumer-token>"

# With admin token - should return 200:
curl https://dixis.gr/api/v1/admin/analytics/overview \
  -H "Authorization: Bearer <admin-token>"
```

---

### 1.5 Remove Test Credentials from .env ⚠️ HIGH

**Risk**: Test bypass credentials (OTP_BYPASS, default BASIC_AUTH) may exist in production

**Files to verify**:
- `frontend/.env` (production VPS)
- `backend/.env` (production VPS)

**Changes**:
```bash
# Remove these lines completely from production .env:
# OTP_BYPASS="000000"
# OTP_DEV_ECHO="1"
# BASIC_AUTH="admin:dixis_admin_pass"

# If BASIC_AUTH is needed for /ops pages, use strong password:
BASIC_AUTH="admin:$(openssl rand -base64 24)"
```

**Verification**:
```bash
# On VPS:
ssh deploy@147.93.126.235 "cd /var/www/dixis/frontend && grep -E '(OTP_BYPASS|OTP_DEV_ECHO)' .env"
# Should return: empty (no matches)
```

---

## Phase 2: MONITORING - Early Intrusion Detection (Days 2-3, ~4-6 hours)

### 2.1 CPU/Memory Alert System

**Files to create**:
- `/var/www/dixis/scripts/monitoring/resource-monitor.sh`
- Cron job: `/etc/cron.d/dixis-monitoring`

**Implementation**:
```bash
#!/bin/bash
# /var/www/dixis/scripts/monitoring/resource-monitor.sh

ALERT_LOG="/var/log/dixis/alerts.log"
CPU_THRESHOLD=80
MEM_THRESHOLD=85

# Get current usage
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print int($2)}')
MEM=$(free | grep Mem | awk '{print int($3/$2 * 100)}')

# Alert if thresholds exceeded
if [ "$CPU" -gt "$CPU_THRESHOLD" ]; then
    echo "[$(date)] ALERT: CPU at ${CPU}% (threshold: ${CPU_THRESHOLD}%)" >> $ALERT_LOG

    # Get top CPU processes
    ps aux --sort=-%cpu | head -6 >> $ALERT_LOG

    # Send webhook alert (optional)
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"⚠️ CPU ALERT: ${CPU}% on dixis.gr\"}"
fi

if [ "$MEM" -gt "$MEM_THRESHOLD" ]; then
    echo "[$(date)] ALERT: Memory at ${MEM}% (threshold: ${MEM_THRESHOLD}%)" >> $ALERT_LOG
    ps aux --sort=-%mem | head -6 >> $ALERT_LOG
fi
```

**Cron configuration**:
```bash
# /etc/cron.d/dixis-monitoring
*/5 * * * * deploy /var/www/dixis/scripts/monitoring/resource-monitor.sh
```

**Verification**:
```bash
# Test alert by lowering threshold temporarily:
CPU_THRESHOLD=1 /var/www/dixis/scripts/monitoring/resource-monitor.sh
tail -10 /var/log/dixis/alerts.log
```

---

### 2.2 Unauthorized Process Detection

**Files to create**:
- `/var/www/dixis/scripts/monitoring/process-scanner.sh`
- Cron job: `/etc/cron.d/dixis-monitoring` (append)

**Implementation**:
```bash
#!/bin/bash
# /var/www/dixis/scripts/monitoring/process-scanner.sh

BASELINE="/var/lib/dixis/process-baseline.txt"
ALERT_LOG="/var/log/dixis/alerts.log"
SUSPICIOUS_DIRS="/tmp /var/tmp /dev/shm"

# Create baseline if first run
if [ ! -f "$BASELINE" ]; then
    ps aux > "$BASELINE"
    echo "[$(date)] Process baseline created" >> $ALERT_LOG
    exit 0
fi

# Scan for suspicious binaries
for DIR in $SUSPICIOUS_DIRS; do
    FOUND=$(find $DIR -type f -executable 2>/dev/null | grep -vE '(systemd|snap)' || true)
    if [ -n "$FOUND" ]; then
        echo "[$(date)] ALERT: Suspicious executable(s) in $DIR:" >> $ALERT_LOG
        echo "$FOUND" >> $ALERT_LOG

        # Kill crypto miners
        pkill -9 -f 'xmrig|miner|crypto|kdevtmpfsi|kinsing' 2>/dev/null || true
    fi
done

# Detect process changes
CURRENT=$(ps aux | sort)
BASELINE_SORTED=$(cat "$BASELINE" | sort)

if ! diff -q <(echo "$CURRENT") <(echo "$BASELINE_SORTED") > /dev/null; then
    echo "[$(date)] ALERT: Process list changed" >> $ALERT_LOG
    diff <(echo "$BASELINE_SORTED") <(echo "$CURRENT") | head -20 >> $ALERT_LOG
fi

# Update baseline weekly (run on Sundays)
if [ "$(date +%u)" -eq 7 ]; then
    ps aux > "$BASELINE"
fi
```

**Cron configuration**:
```bash
# Run every 15 minutes
*/15 * * * * deploy /var/www/dixis/scripts/monitoring/process-scanner.sh
```

**Verification**:
```bash
# Create test suspicious file:
touch /tmp/fake-miner && chmod +x /tmp/fake-miner
/var/www/dixis/scripts/monitoring/process-scanner.sh
tail -10 /var/log/dixis/alerts.log
# Should show alert for /tmp/fake-miner
rm /tmp/fake-miner
```

---

### 2.3 Auth Failure Tracking

**Files to create**:
- `/var/www/dixis/scripts/monitoring/auth-monitor.sh`
- Cron job: `/etc/cron.d/dixis-monitoring` (append)

**Implementation**:
```bash
#!/bin/bash
# /var/www/dixis/scripts/monitoring/auth-monitor.sh

NGINX_LOG="/var/log/nginx/dixis-access.log"
ALERT_LOG="/var/log/dixis/alerts.log"
THRESHOLD=10  # failures per IP per hour

# Count 401s per IP in last hour
awk -v threshold=$THRESHOLD '
BEGIN { now = systime() }
{
    # Parse timestamp (assuming standard nginx format)
    if ($0 ~ /\[.*\]/) {
        if ($9 == "401") {
            ip = $1
            count[ip]++
        }
    }
}
END {
    for (ip in count) {
        if (count[ip] >= threshold) {
            print "[" strftime("%Y-%m-%d %H:%M:%S") "] ALERT: " count[ip] " failed auth attempts from " ip
        }
    }
}' "$NGINX_LOG" >> "$ALERT_LOG"
```

**Cron configuration**:
```bash
# Run every 30 minutes
*/30 * * * * deploy /var/www/dixis/scripts/monitoring/auth-monitor.sh
```

**Verification**:
```bash
# Simulate failed logins, then run:
/var/www/dixis/scripts/monitoring/auth-monitor.sh
tail -5 /var/log/dixis/alerts.log
```

---

### 2.4 Webhook Alerts to Slack/Email

**Files to modify**:
- All monitoring scripts above

**Setup**:

1. **Create Slack webhook** (if using Slack):
   - Go to https://api.slack.com/messaging/webhooks
   - Create webhook for `#ops-alerts` channel
   - Copy webhook URL

2. **Add webhook to .env**:
```bash
# backend/.env or create /var/www/dixis/scripts/monitoring/.env
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

3. **Update all monitoring scripts** to send webhooks:
```bash
# Add to each alert section:
if [ -f "/var/www/dixis/scripts/monitoring/.env" ]; then
    source /var/www/dixis/scripts/monitoring/.env
    curl -X POST "$ALERT_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"⚠️ SECURITY ALERT: [details here]\"}" \
      -s > /dev/null
fi
```

**Verification**:
```bash
# Test webhook:
curl -X POST "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test alert from dixis.gr monitoring"}'
# Check Slack channel for message
```

---

## Phase 3: HARDENING - Long-term Security (Week 2+, ~1-2 days)

### 3.1 Rate Limiting at Nginx Level

**Files to modify**:
- `/etc/nginx/sites-available/dixis.gr`

**Changes**:
```nginx
# Add above server block:
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=ops_limit:10m rate=1r/m;

server {
    # ... existing config

    location /api/v1/auth/ {
        limit_req zone=auth_limit burst=3 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3000;
    }

    location /api/ops/ {
        limit_req zone=ops_limit burst=1 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3000;
    }

    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3000;
    }
}
```

**Apply**:
```bash
sudo nginx -t  # Validate config
sudo systemctl reload nginx
```

**Verification**:
```bash
# Should get 429 after 5 requests/minute:
for i in {1..10}; do
  curl -w "%{http_code}\n" https://dixis.gr/api/v1/auth/login -X POST
done
```

---

### 3.2 File Integrity Monitoring with AIDE

**Installation**:
```bash
sudo apt install aide
sudo aideinit
sudo cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db
```

**Configuration**:
```bash
# /etc/aide/aide.conf - add monitored directories
/var/www/dixis R+b+sha256
/etc/nginx R+b+sha256
/etc/systemd/system R+b+sha256
```

**Cron**:
```bash
# /etc/cron.daily/aide-check
#!/bin/bash
aide --check | tee -a /var/log/dixis/aide.log
if [ $? -ne 0 ]; then
    echo "[$(date)] ALERT: File integrity violation detected" >> /var/log/dixis/alerts.log
fi
```

**Verification**:
```bash
# Make test change:
echo "# test" >> /var/www/dixis/frontend/package.json
sudo aide --check
# Should show violation
git checkout -- /var/www/dixis/frontend/package.json
```

---

### 3.3 Automated Security Updates

**Configuration**:
```bash
# Enable unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades

# /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "kourkoutisp@gmail.com";
```

**Verification**:
```bash
sudo unattended-upgrade --dry-run --debug
```

---

### 3.4 Centralized Logging (Optional - if resources allow)

**Option 1**: Grafana Loki (lightweight)
```bash
# Install Loki + Promtail
wget https://github.com/grafana/loki/releases/download/v2.9.3/loki-linux-amd64.zip
unzip loki-linux-amd64.zip
sudo mv loki-linux-amd64 /usr/local/bin/loki

# Configure to collect from:
# - /var/log/nginx/*.log
# - /var/log/dixis/*.log
# - PM2 logs
```

**Option 2**: Simple log aggregation script
```bash
#!/bin/bash
# /var/www/dixis/scripts/monitoring/log-aggregator.sh

# Aggregate all logs to single location for easier searching
cat /var/log/nginx/dixis-access.log >> /var/log/dixis/all.log
cat /var/log/nginx/dixis-error.log >> /var/log/dixis/all.log
cat ~/.pm2/logs/dixis-frontend-*.log >> /var/log/dixis/all.log
cat /var/log/dixis/alerts.log >> /var/log/dixis/all.log

# Rotate
find /var/log/dixis/all.log -size +100M -exec gzip {} \;
```

---

## Phase 4: VERIFICATION - Ensure Hardening Works (Day 3-4, ~2 hours)

### 4.1 Security Audit Checklist

**Run on VPS after Phase 1-3 complete**:

```bash
#!/bin/bash
# /var/www/dixis/scripts/security-audit.sh

echo "=== DIXIS VPS SECURITY AUDIT ==="
echo ""

# 1. Test login endpoint
echo "[1] Test login endpoint disabled:"
curl -s -X POST https://dixis.gr/api/v1/test/login | grep -q 404 && echo "✅ PASS" || echo "❌ FAIL"

# 2. CORS configuration
echo "[2] CORS restricted:"
grep -q "CORS_ALLOWED_ORIGINS=https://dixis.gr" /var/www/dixis/backend/.env && echo "✅ PASS" || echo "❌ FAIL"

# 3. OPS token strength
echo "[3] OPS token configured:"
[ -n "$(grep OPS_TOKEN /var/www/dixis/backend/.env | cut -d= -f2)" ] && echo "✅ PASS" || echo "❌ FAIL"

# 4. Admin middleware
echo "[4] Admin middleware exists:"
[ -f /var/www/dixis/backend/app/Http/Middleware/RequireAdmin.php ] && echo "✅ PASS" || echo "❌ FAIL"

# 5. Test credentials removed
echo "[5] No test credentials:"
! grep -q "OTP_BYPASS" /var/www/dixis/frontend/.env && echo "✅ PASS" || echo "❌ FAIL"

# 6. Monitoring scripts
echo "[6] Monitoring active:"
[ -f /etc/cron.d/dixis-monitoring ] && echo "✅ PASS" || echo "❌ FAIL"

# 7. Rate limiting
echo "[7] Nginx rate limiting:"
grep -q "limit_req_zone" /etc/nginx/sites-available/dixis.gr && echo "✅ PASS" || echo "❌ FAIL"

# 8. Firewall status
echo "[8] UFW firewall:"
sudo ufw status | grep -q "Status: active" && echo "✅ PASS" || echo "❌ FAIL"

# 9. fail2ban status
echo "[9] fail2ban active:"
sudo systemctl is-active fail2ban | grep -q "active" && echo "✅ PASS" || echo "❌ FAIL"

# 10. SSL certificate
echo "[10] SSL certificate valid:"
curl -sI https://dixis.gr 2>&1 | grep -q "HTTP/2 200" && echo "✅ PASS" || echo "❌ FAIL"

echo ""
echo "=== AUDIT COMPLETE ==="
```

**Run**:
```bash
bash /var/www/dixis/scripts/security-audit.sh
```

**Expected output**: All ✅ PASS

---

### 4.2 Penetration Testing Scenarios

**Test 1**: Unauthenticated admin access
```bash
# Should fail with 404:
curl -X POST https://dixis.gr/api/v1/test/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","role":"admin"}'
```

**Test 2**: Consumer accessing admin endpoints
```bash
# Login as consumer
TOKEN=$(curl -X POST https://dixis.gr/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer@example.com","password":"password"}' \
  | jq -r '.token')

# Should fail with 403:
curl https://dixis.gr/api/v1/admin/analytics/overview \
  -H "Authorization: Bearer $TOKEN"
```

**Test 3**: Rate limiting
```bash
# Should get 429 after threshold:
for i in {1..20}; do
  echo "Request $i:"
  curl -w "HTTP %{http_code}\n" https://dixis.gr/api/v1/auth/login \
    -X POST -d '{}' -H "Content-Type: application/json"
  sleep 5
done
```

**Test 4**: CORS restriction
```bash
# Should fail CORS preflight:
curl -X OPTIONS https://dixis.gr/api/v1/auth/login \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

## Summary: Files to Modify

### Configuration Files (Production VPS)
1. `/var/www/dixis/backend/.env` - Disable test flags, fix CORS, add strong tokens
2. `/var/www/dixis/frontend/.env` - Remove test credentials
3. `/etc/nginx/sites-available/dixis.gr` - Add rate limiting

### Code Files (Git repository)
4. `backend/app/Http/Middleware/RequireAdmin.php` - NEW: Admin middleware
5. `backend/app/Http/Kernel.php` - Register admin middleware
6. `backend/routes/api.php` - Apply admin middleware, strengthen OPS auth

### Monitoring Scripts (Production VPS)
7. `/var/www/dixis/scripts/monitoring/resource-monitor.sh` - CPU/memory alerts
8. `/var/www/dixis/scripts/monitoring/process-scanner.sh` - Process detection
9. `/var/www/dixis/scripts/monitoring/auth-monitor.sh` - Auth failure tracking
10. `/etc/cron.d/dixis-monitoring` - Cron jobs for all monitors

### Verification
11. `/var/www/dixis/scripts/security-audit.sh` - Automated audit script

---

## Implementation Timeline

| Phase | Duration | Priority | Effort |
|-------|----------|----------|--------|
| **Phase 1** (Critical Auth Fixes) | Day 1 | CRITICAL | 2-3 hours |
| **Phase 2** (Monitoring Setup) | Days 2-3 | HIGH | 4-6 hours |
| **Phase 3** (Advanced Hardening) | Week 2+ | MEDIUM | 1-2 days |
| **Phase 4** (Verification) | Days 3-4 | HIGH | 2 hours |

**Total**: ~10-15 hours over 1-2 weeks

---

## Success Criteria

✅ **All 10 security audit checks passing**
✅ **No test credentials in production .env files**
✅ **Admin endpoints return 403 for non-admin users**
✅ **CPU/memory alerts functional and tested**
✅ **Unauthorized process detection active**
✅ **Rate limiting enforced at nginx + application level**
✅ **Zero malware detected for 30 days post-hardening**
✅ **Slack/email alerts functioning for critical events**

---

## Post-Implementation Maintenance

### Daily (automated via cron)
- CPU/memory monitoring (every 5 min)
- Process scanning (every 15 min)
- Auth failure tracking (every 30 min)

### Weekly (manual)
- Review `/var/log/dixis/alerts.log` for patterns
- Check fail2ban bans: `sudo fail2ban-client status sshd`
- Verify PM2 restart count: `pm2 list` (should be low)

### Monthly (manual)
- Rotate OPS tokens: `openssl rand -base64 32`
- Review nginx access logs for anomalies
- Dependency updates: `pnpm audit`, `composer audit`
- SSL certificate renewal check: `sudo certbot renew --dry-run`

---

## Rollback Plan

If Phase 1 breaks production:

1. **Revert .env changes**:
```bash
cp /var/www/dixis/backend/.env.backup /var/www/dixis/backend/.env
cp /var/www/dixis/frontend/.env.backup /var/www/dixis/frontend/.env
pm2 restart dixis-frontend
```

2. **Revert nginx config**:
```bash
sudo cp /etc/nginx/sites-available/dixis.gr.backup /etc/nginx/sites-available/dixis.gr
sudo nginx -t && sudo systemctl reload nginx
```

3. **Disable cron jobs**:
```bash
sudo mv /etc/cron.d/dixis-monitoring /etc/cron.d/dixis-monitoring.disabled
```

**Backup strategy**: Create `.backup` copies before each change.

---

## Questions for User

Before implementing, clarify:

1. **Slack webhook**: Do you have a Slack workspace for alerts, or prefer email?
2. **OPS endpoints**: Are they used from a fixed IP (office/VPN) we can whitelist?
3. **Downtime tolerance**: Can we deploy during business hours, or wait for off-hours?
4. **Admin users**: Confirm list of valid admin email addresses for verification

---

**End of Plan**
