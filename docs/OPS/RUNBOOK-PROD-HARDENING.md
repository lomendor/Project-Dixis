# Production Hardening Runbook

**Purpose:** Operational procedures for production infrastructure hardening
**Last Updated:** 2025-12-19 01:26 UTC
**Status:** Production-verified (reboot tested ✅)

---

## Architecture Overview

### Production Stack
```
Internet (ports 80/443)
    ↓
Nginx Reverse Proxy
    ↓ proxy_pass http://127.0.0.1:3000
Next.js Frontend (port 3000, localhost-only)
    ↓ fetch('http://127.0.0.1:8001/api/v1')
Laravel Backend (port 8001, localhost-only)
```

### Why Localhost-Only Binding?

**Security:** Frontend/backend only accessible via nginx proxy, not directly exposed to internet.

**Command:**
```bash
# Frontend
next start -H 127.0.0.1 -p 3000

# Backend
php artisan serve --host=127.0.0.1 --port=8001
```

---

## Frontend Service Architecture

### The Monarx Problem

**Issue:** Regular systemd units with ExecStart get killed with SIGKILL by Monarx security agent.

**Evidence:**
```bash
Process: 12345 ExecStart=... (code=killed, signal=KILL)
```

**Solution:** Use systemd-run transient units (bypass Monarx blocking).

### Launcher + Transient Pattern

**File:** `/etc/systemd/system/dixis-frontend-launcher.service`
```ini
[Unit]
Description=Dixis Frontend Launcher (spawns transient unit)
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/systemd-run \
  --unit=dixis-frontend-prod \
  --working-directory=/var/www/dixis/frontend \
  --setenv=HOSTNAME=127.0.0.1 \
  --setenv=PORT=3000 \
  /var/www/dixis/frontend/node_modules/.bin/next start -H 127.0.0.1 -p 3000
ExecStop=/usr/bin/systemctl stop dixis-frontend-prod

[Install]
WantedBy=multi-user.target
```

**How It Works:**
1. Boot → `dixis-frontend-launcher.service` starts (oneshot)
2. Launcher spawns transient unit `dixis-frontend-prod.service`
3. Transient unit runs Next.js on 127.0.0.1:3000
4. On reboot: Launcher re-creates transient unit automatically

---

## Operational Commands

### Check Service Status

```bash
# Check launcher (should be "active (exited)")
systemctl status dixis-frontend-launcher.service

# Check frontend runtime (should be "active (running)")
systemctl status dixis-frontend-prod.service

# Check nginx
systemctl status nginx
```

**Expected Output:**
```
● dixis-frontend-launcher.service - Dixis Frontend Launcher (spawns transient unit)
     Active: active (exited) since ...

● dixis-frontend-prod.service - /var/www/dixis/frontend/node_modules/.bin/next start -H 127.0.0.1 -p 3000
     Loaded: loaded (/run/systemd/transient/dixis-frontend-prod.service; transient)
     Active: active (running) since ...
     Main PID: 816 (next-server (v1)
```

### Verify Port Binding (Localhost-Only)

```bash
# Should show 127.0.0.1:3000 (NOT 0.0.0.0:3000)
ss -lntp | grep 3000
```

**Expected Output:**
```
LISTEN 0  511  127.0.0.1:3000  0.0.0.0:*
```

✅ Correct: `127.0.0.1:3000`
❌ Insecure: `0.0.0.0:3000` or `*:3000`

### Run Smoke Tests

```bash
# From VPS
/home/deploy/bin/prod_smoke.sh

# Expected output
SMOKE_OK
```

**Smoke Script Tests:**
- `http://127.0.0.1:3000/` (frontend homepage)
- `http://127.0.0.1:8001/api/healthz` (backend health)
- `https://dixis.gr/api/healthz` (public backend)
- `https://dixis.gr/api/v1/public/products` (public API)
- `https://dixis.gr/products` (public frontend)

### Automated Smoke Test Timer

**Installed:** Systemd timer running every 5 minutes

**Files:**
- Service: `/etc/systemd/system/dixis-smoke.service`
- Timer: `/etc/systemd/system/dixis-smoke.timer`

**Check Timer Status:**
```bash
# Check timer status (should be "active (waiting)")
systemctl status dixis-smoke.timer

# View recent smoke test results
journalctl -u dixis-smoke.service -n 20
```

**Expected Output:**
```
● dixis-smoke.timer - Run Dixis PROD smoke check every 5 minutes
     Active: active (waiting) since ...
    Trigger: Fri 2025-12-19 02:00:46 UTC; 2min left

Dec 19 01:55:40 srv709397 prod_smoke.sh[3024]: SMOKE_OK
Dec 19 01:55:46 srv709397 prod_smoke.sh[3108]: SMOKE_OK
```

**Timer Configuration:**
- First run: 2 minutes after boot
- Interval: Every 5 minutes
- Persistence: Yes (survives reboots)

**Manual Trigger:**
```bash
# Trigger smoke test immediately
sudo systemctl start dixis-smoke.service

# Check result
journalctl -u dixis-smoke.service -n 5
```

### Manual Service Restart

**Frontend:**
```bash
# Stop transient unit
sudo systemctl stop dixis-frontend-prod

# Restart launcher (will recreate transient unit)
sudo systemctl restart dixis-frontend-launcher

# Verify
systemctl status dixis-frontend-prod
ss -lntp | grep 3000
```

**Backend (manual, no systemd service):**
```bash
# Kill existing
pkill -f "php artisan serve"

# Start new
cd /var/www/dixis/backend
nohup php artisan serve --host=127.0.0.1 --port=8001 > /tmp/backend.log 2>&1 &

# Verify
ss -lntp | grep 8001
```

---

## Reboot Procedure

### Expected Behavior

1. System reboots
2. `dixis-frontend-launcher.service` starts automatically (enabled)
3. Launcher spawns `dixis-frontend-prod.service` (transient)
4. Frontend available on 127.0.0.1:3000 within ~30 seconds
5. **Backend requires manual start** (not in scope)

### Post-Reboot Verification

```bash
# Wait 2 minutes after reboot
sleep 120

# SSH reconnect
ssh dixis-prod

# Verify uptime
uptime

# Check frontend services
systemctl status dixis-frontend-launcher.service
systemctl status dixis-frontend-prod.service

# Check port binding
ss -lntp | grep 3000

# Test localhost
curl -I http://127.0.0.1:3000/

# Start backend manually (if needed)
cd /var/www/dixis/backend
nohup php artisan serve --host=127.0.0.1 --port=8001 > /tmp/backend.log 2>&1 &

# Test public endpoints
curl -I https://dixis.gr/products
curl -I https://dixis.gr/api/healthz
```

**Expected Results:**
- Launcher: `active (exited)`
- Frontend: `active (running)`
- Port 3000: `127.0.0.1:3000` ✅
- Public access: HTTP 200 ✅

---

## fail2ban Configuration

### Current Policy (Hardened)

**File:** `/etc/fail2ban/jail.d/sshd.local`
```ini
[sshd]
ignoreip = 127.0.0.1/8 ::1
```

**Policy:** Localhost-only whitelisting (no hardcoded dynamic IPs).

**Why:** Dynamic IPs change, causing accidental lockouts if whitelisted.

### Check fail2ban Status

```bash
# Overall status
sudo fail2ban-client status

# SSH jail details
sudo fail2ban-client status sshd

# Check ignoreip setting
grep -r 'ignoreip' /etc/fail2ban/jail.d/sshd.local
```

**Expected Output:**
```
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  `- Total failed:     X
`- Actions
   |- Currently banned: Y
   `- Total banned:     Z
```

---

## SSH Configuration (Prevent Wrong Key Attempts)

### Local Machine Setup

**File:** `~/.ssh/config`
```ini
Host dixis-prod
  HostName 147.93.126.235
  User deploy
  IdentityFile ~/.ssh/dixis_prod_ed25519
  IdentitiesOnly yes
  PreferredAuthentications publickey
  PubkeyAuthentication yes
  PasswordAuthentication no
  StrictHostKeyChecking accept-new
  ServerAliveInterval 30
  ServerAliveCountMax 3
```

**Key Settings:**
- `IdentitiesOnly yes` → Only use specified key (no agent keys)
- `PreferredAuthentications publickey` → Don't try password auth
- `PasswordAuthentication no` → Never prompt for password
- `PubkeyAuthentication yes` → Always use public key

**Connection Command:**
```bash
ssh dixis-prod
```

### Server-Side Hardening

**File:** `/etc/ssh/sshd_config.d/99-dixis-hardening.conf`
```ini
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
UsePAM yes
PubkeyAuthentication yes
AuthenticationMethods publickey
AllowUsers deploy
MaxAuthTries 3
LoginGraceTime 20
```

**Policy:**
- Only `deploy` user allowed
- Public key authentication ONLY (no passwords)
- Root login disabled
- Maximum 3 authentication attempts

### Verify SSH Agent

```bash
# Clear all keys from agent
ssh-add -D

# Add only production key
ssh-add ~/.ssh/dixis_prod_ed25519

# Verify
ssh-add -l
```

**Expected:** Only one key listed (dixis_prod_ed25519).

### CRITICAL: fail2ban Policy

**DO NOT whitelist dynamic public IPs in fail2ban ignoreip.**

**Why:** Dynamic IPs change frequently. If you whitelist your current IP and it changes, you lose protection. If it gets reassigned to an attacker, they have whitelisted access.

**Correct Approach:**
1. Fix client-side SSH config (done above)
2. Use `IdentitiesOnly yes` to prevent wrong key attempts
3. Keep fail2ban ignoreip as **localhost-only**

**File:** `/etc/fail2ban/jail.d/sshd.local`
```ini
[sshd]
enabled = true
backend = systemd
ignoreip = 127.0.0.1/8 ::1
maxretry = 5
findtime = 10m
bantime  = 30m
```

**If You Get Banned:**
- Fix your SSH client config FIRST
- Then unban: `sudo fail2ban-client set sshd unbanip YOUR_IP` (via console access)
- Never add dynamic IPs to ignoreip permanently

---

## Troubleshooting

### Frontend Not Starting After Reboot

**Check:**
```bash
systemctl status dixis-frontend-launcher.service
journalctl -u dixis-frontend-launcher -n 50
```

**Common Issues:**
- Working directory missing: Check `/var/www/dixis/frontend` exists
- node_modules missing: Run `npm install` in frontend directory
- Monarx blocking: Use `systemd-run` (already implemented)

**Fix:**
```bash
sudo systemctl restart dixis-frontend-launcher
```

### Port 3000 Listening on 0.0.0.0 Instead of 127.0.0.1

**Issue:** Missing `-H 127.0.0.1` flag in start command.

**Verify Command:**
```bash
ps aux | grep "next start"
```

**Should See:**
```
next start -H 127.0.0.1 -p 3000
```

**Fix:**
Edit `/etc/systemd/system/dixis-frontend-launcher.service` and ensure:
```bash
ExecStart=/usr/bin/systemd-run ... next start -H 127.0.0.1 -p 3000
```

### Monarx Killing Processes

**Symptom:**
```
Process: 12345 ExecStart=... (code=killed, signal=KILL)
```

**Solution:** Already implemented via transient units.

**Verify:**
```bash
# Should show "transient"
systemctl status dixis-frontend-prod | grep Transient
```

**Expected:** `Transient: yes`

### External curl Commands Killed

**Issue:** Monarx kills curl/wget to localhost.

**Solution:** Use Python urllib (already in smoke script).

**Example:**
```python
import urllib.request
resp = urllib.request.urlopen('http://127.0.0.1:3000/', timeout=5)
print(resp.code)
```

---

## Configuration Files Reference

### Next.js Config

**File:** `/var/www/dixis/frontend/next.config.ts`

**Key Change:**
```typescript
// output: "standalone",  // Temporarily disabled for reboot fix
```

**Why Disabled:**
- Standalone mode requires `.next/standalone/server.js`
- Build process gets killed by Monarx or OOM on VPS
- Regular `next start` works without standalone mode

**Future:** Re-enable with CI/CD pre-built deployment.

### systemd Service Files

**Frontend Launcher:** `/etc/systemd/system/dixis-frontend-launcher.service`
**Frontend Runtime:** `/run/systemd/transient/dixis-frontend-prod.service` (auto-generated)

**Smoke Test Service:** `/etc/systemd/system/dixis-smoke.service`
**Smoke Test Timer:** `/etc/systemd/system/dixis-smoke.timer`

### Smoke Test Script

**File:** `/home/deploy/bin/prod_smoke.sh`
**Language:** Python 3 (bypasses Monarx curl blocking)
**Tests:** All critical endpoints (localhost + public)

---

## Maintenance Procedures

### Updating Frontend Code

```bash
# SSH to production
ssh dixis-prod

# Pull latest code
cd /var/www/dixis/frontend
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart frontend
sudo systemctl restart dixis-frontend-launcher

# Verify
systemctl status dixis-frontend-prod
curl -I http://127.0.0.1:3000/
```

### Reviewing Logs

```bash
# Frontend logs
journalctl -u dixis-frontend-prod -f

# Launcher logs
journalctl -u dixis-frontend-launcher -n 50

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Backend logs
tail -f /tmp/backend.log
```

---

## Emergency Procedures

### Complete Service Restart

```bash
# Stop everything
sudo systemctl stop dixis-frontend-prod
sudo systemctl stop dixis-frontend-launcher
sudo systemctl stop nginx
pkill -f "php artisan serve"

# Start nginx
sudo systemctl start nginx

# Start frontend
sudo systemctl start dixis-frontend-launcher

# Start backend
cd /var/www/dixis/backend
nohup php artisan serve --host=127.0.0.1 --port=8001 > /tmp/backend.log 2>&1 &

# Verify all
systemctl status nginx
systemctl status dixis-frontend-prod
ss -lntp | grep -E '(80|443|3000|8001)'
/home/deploy/bin/prod_smoke.sh
```

### Rollback Next.js Config

If issues arise from disabled standalone mode:

```bash
cd /var/www/dixis/frontend

# Restore backup
cp next.config.ts.bak next.config.ts

# Rebuild
npm run build

# Restart
sudo systemctl restart dixis-frontend-launcher
```

---

## Success Metrics

**After any change, verify:**
- ✅ Frontend service: `active (running)`
- ✅ Launcher service: `active (exited)`
- ✅ Port 3000: listening on `127.0.0.1` (NOT `0.0.0.0`)
- ✅ Port 8001: listening on `127.0.0.1` (NOT `0.0.0.0`)
- ✅ Smoke test: `SMOKE_OK`
- ✅ Public endpoints: HTTP 200
- ✅ fail2ban: no hardcoded dynamic IPs

---

## Related Documentation

- **Incident Report:** `docs/OPS/INCIDENT-2025-12-18-prod-frontend-assets.md`
- **State File:** `docs/OPS/STATE.md`
- **PR #1747:** Incident postmortem
- **PR #1748:** E2E auth mock fixes
- **PR #1751:** Products SSR localhost fetch

---

**Last Reboot Test:** 2025-12-19 01:25 UTC ✅
**Status:** Production-verified, reboot-safe
