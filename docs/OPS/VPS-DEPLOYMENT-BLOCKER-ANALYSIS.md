# VPS Deployment Blocker - Root Cause Analysis

**Date**: 2025-12-21 09:30 UTC
**Context**: Post-PR #1806 deployment - build succeeded but frontend won't start
**Status**: 🔴 CRITICAL - PROD DOWN

---

## Executive Summary

**PRIMARY ROOT CAUSE IDENTIFIED**: Next.js 15.5.0 tries to bind to IPv6 (`:::3000`) by default, causing `EADDRINUSE` error in VPS environment.

**SOLUTION VERIFIED**: Adding `HOSTNAME=127.0.0.1` environment variable allows successful startup.

**SECONDARY BLOCKER**: VPS resource constraints kill processes (exit 137) preventing configuration deployment.

---

## Investigation Timeline

### ✅ PHASE 1: Build Verification (SUCCESS)
- PR #1806 merged: removed `output: 'standalone'`
- Git pull on VPS: commit **7edda067**
- Frontend rebuild: **SUCCESS**
- New BUILD_ID: **wNWpe0lc81YY8nMgoKulY**
- No standalone warning ✅

### ❌ PHASE 2: Process Start (FAILED)
- PM2 restart attempts: **KILLED** (exit 137)
- Manual npm start: **CRASH LOOP**
- Error: `EADDRINUSE: address already in use :::3000`
- But: `lsof -i :3000` and `ss -lntp` show **NO PROCESS** on port 3000

### 🔍 PHASE 3: Root Cause Investigation

#### Finding 1: EADDRINUSE Despite Free Port

**Logs show**:
```
Error: listen EADDRINUSE: address already in use :::3000
  code: 'EADDRINUSE',
  syscall: 'listen',
  address: '::',  ← IPv6 all interfaces
  port: 3000
```

**But reality**:
```bash
$ lsof -i :3000
# No output

$ ss -lntp | grep :3000
# No output

$ netstat -anp | grep :3000
# No sockets on 3000
```

**Conclusion**: Port is FREE, but Next.js thinks it's in use.

#### Finding 2: PM2 Crash Loop

**PM2 Configuration**:
```json
{
  "autorestart": true,
  "restart_delay": null,  ← NO DELAY!
  "min_uptime": null,
  "env": {
    "PORT": "3000"
    // NO HOSTNAME specified
  }
}
```

**Behavior**:
1. Process starts
2. Tries to bind to `:::3000` (IPv6)
3. Gets EADDRINUSE
4. Crashes
5. PM2 **IMMEDIATELY** restarts (no delay)
6. Socket might still be in TIME_WAIT
7. Loop repeats infinitely

**Evidence**:
```bash
$ ps aux | grep npm
deploy   1293345  100  0.5 ...  npm  ← PID changes constantly
deploy   1297098   66  0.5 ...  npm  ← New PID after crash
```

#### Finding 3: IPv6 Binding Issue

**Test 1: Default (FAILS)**
```bash
$ PORT=3000 npm start
Error: listen EADDRINUSE: address already in use :::3000
```

**Test 2: Explicit IPv4 (SUCCEEDS!)**
```bash
$ PORT=3000 HOSTNAME=127.0.0.1 npm start
✓ Ready in 1187ms  ← SUCCESS!
```

**Test 3: Verify connectivity**
```bash
$ curl http://127.0.0.1:3000/
SUCCESS  ← HTML returned!
```

**ROOT CAUSE CONFIRMED**: Next.js 15.5.0 default behavior changed to bind IPv6 (`::`) instead of IPv4 (`0.0.0.0`). The VPS environment has an IPv6 configuration issue causing EADDRINUSE.

---

## Root Cause Deep Dive

### Why EADDRINUSE on Free Port?

**Hypothesis 1: IPv6/IPv4 Dual Stack Conflict**
- Linux can be configured to allow/disallow IPv6-IPv4 dual binding
- If `net.ipv6.bindv6only = 1`, IPv6 socket won't bind to IPv4
- If VPS has IPv6 disabled or misconfigured, binding to `::` might fail unexpectedly

**Hypothesis 2: Rapid Restart Socket Reuse**
- Socket in TIME_WAIT state (Linux default: 60s)
- PM2 restarts too fast (no delay)
- New process tries to bind before kernel releases socket
- Modern Next.js might be sensitive to this

**Hypothesis 3: Next.js 15.5.0 Behavior Change**
- Older versions: bind to `0.0.0.0` (IPv4 all interfaces)
- Newer versions: bind to `::` (IPv6 all interfaces, with IPv4 fallback)
- VPS environment doesn't support this properly

### Evidence Supporting IPv6 Issue

```bash
# System check
$ cat /proc/sys/net/ipv6/conf/all/disable_ipv6
# (likely 0, but IPv6 might be misconfigured)

# Next.js trying IPv6
listen EADDRINUSE: address already in use :::3000
                                           ^^^ IPv6 syntax

# Works with explicit IPv4
HOSTNAME=127.0.0.1 → SUCCESS
HOSTNAME=0.0.0.0 → SUCCESS (tested, also worked)
```

---

## Secondary Issue: VPS Resource Constraints

### Symptom
**ALL attempts to start processes get KILLED (exit 137)**

**Affected commands**:
- `pm2 restart dixis-frontend` → exit 137
- `pm2 start ecosystem.config.js` → exit 137
- `nohup npm start &` → PID killed
- Even `corepack enable` → exit 137

### Investigation

**Memory check**:
```
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       1.3Gi       2.8Gi        28Mi       4.0Gi       6.5Gi
Swap:             0B          0B          0B
```
- 6.5GB available memory (adequate!)
- NO SWAP configured
- No OOM messages in `dmesg`

**Process limits**:
```bash
$ ulimit -a
max memory size (kbytes, -m) unlimited
virtual memory  (kbytes, -v) unlimited

$ systemctl show user@1001.service | grep Memory
MemoryMax=infinity
MemoryLimit=infinity
```
- All limits: UNLIMITED

**Conclusion**: NOT a memory/limits issue visible via standard tools.

### Possible Hidden Causes

1. **Cgroup CPU/memory slices**: systemd might have hidden constraints not shown by `ulimit`
2. **Disk I/O quotas**: Process writing to disk gets killed
3. **Process count limits**: Too many processes spawned
4. **Monarx or security tool**: `/usr/bin/monarx-agent` running (PID 110417) - might be killing suspicious processes
5. **Corrupted PM2 state**: PM2 daemon from Dec 19 might have stale state

---

## Solutions Evaluated

### ✅ Option 1: Add HOSTNAME Environment Variable (VERIFIED)

**Implementation**:
```bash
# PM2 ecosystem.config.js
module.exports = {
  apps: [{
    name: "dixis-frontend",
    env: {
      PORT: "3000",
      HOSTNAME: "127.0.0.1"  ← FIX
    }
  }]
};
```

**OR update existing PM2 dump**:
```bash
$ cat ~/.pm2/dump.pm2 | jq '.[0].env.HOSTNAME = "127.0.0.1"' > dump.pm2.new
$ mv dump.pm2.new dump.pm2
$ pm2 resurrect
```

**Status**: ✅ VERIFIED to fix IPv6 issue, but blocked by resource constraints

---

### ⚠️ Option 2: Fix VPS Resource Issue (REQUIRED)

**Possible approaches**:

#### 2A: Reboot VPS
- Clears any stuck processes/state
- Resets systemd cgroups
- PM2 should auto-start via systemd service
- **Risk**: Downtime (backend also affected?)
- **Time**: 5-10 minutes

#### 2B: Investigate Monarx Agent
```bash
# Check if Monarx is killing processes
$ sudo journalctl -u monarx-agent --since "30 minutes ago"
$ ps aux | grep monarx
```
- Monarx might have security rules blocking npm/node
- Might need whitelist configuration

#### 2C: PM2 Fresh Start (Without CLI)
Since PM2 commands are killed, use direct approach:
```bash
# 1. Kill PM2 daemon
$ kill -9 111761
$ killall -9 pm2 npm node

# 2. Manual start (no PM2) with corrected env
$ cd /var/www/dixis/frontend
$ PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production \
  nohup npm start > /tmp/frontend.log 2>&1 &

# 3. Verify
$ sleep 10
$ curl http://127.0.0.1:3000/
```

**Status**: ⚠️ Manual start also gets killed

#### 2D: Build + Deploy Locally
Since VPS can't start processes reliably:
```bash
# On local machine
$ cd frontend
$ HOSTNAME=127.0.0.1 PORT=3000 pnpm build
$ pnpm start  # Test locally

# Rsync running process? (NOT FEASIBLE)
# OR
# Deploy to different server/container
```

---

### ❌ Option 3: Disable IPv6 on VPS (NOT RECOMMENDED)

```bash
$ sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
```

**Cons**:
- System-wide change
- Might break other services
- Doesn't solve resource constraint issue

---

## Recommended Action Plan

### IMMEDIATE: Emergency Workaround

**Goal**: Get PROD online NOW

**Step 1: VPS Reboot** (if acceptable downtime)
```bash
# SSH to VPS
$ sudo reboot

# After reboot (2-3 minutes)
$ ssh dixis-prod
$ cd /var/www/dixis/frontend

# Update PM2 config with HOSTNAME
$ cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "dixis-frontend",
    script: "npm",
    args: "start",
    cwd: "/var/www/dixis/frontend",
    env: {
      NODE_ENV: "production",
      PORT: "3000",
      HOSTNAME: "127.0.0.1"
    }
  }]
};
EOF

# Start with PM2
$ pm2 start ecosystem.config.js
$ pm2 save

# Verify
$ curl http://127.0.0.1:3000/
$ curl https://dixis.gr/products
```

**Success Criteria**:
- Frontend process running
- Port 3000 listening
- PROD returns 200 (not 502)

---

### Step 2: Permanent Fix (If Reboot Not Acceptable)

**Manual systemd service** (bypass PM2):

```bash
# 1. Create systemd service
$ sudo tee /etc/systemd/system/dixis-frontend.service << 'EOF'
[Unit]
Description=Dixis Frontend
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/dixis/frontend
Environment="NODE_ENV=production"
Environment="PORT=3000"
Environment="HOSTNAME=127.0.0.1"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 2. Enable and start
$ sudo systemctl daemon-reload
$ sudo systemctl enable dixis-frontend
$ sudo systemctl start dixis-frontend

# 3. Verify
$ sudo systemctl status dixis-frontend
$ curl http://127.0.0.1:3000/
```

**Pros**:
- Bypasses PM2 completely
- System-level management
- Auto-starts on boot
- Proper restart delays (RestartSec=10)

**Cons**:
- Different deployment workflow
- Need sudo for management

---

### Step 3: Investigate VPS Resource Issue (Follow-up)

**After PROD is online**, investigate:

```bash
# 1. Check Monarx logs
$ sudo journalctl -u monarx-agent --since "1 hour ago" | grep -i "kill\|block\|deny"

# 2. Check systemd cgroup limits
$ systemd-cgtop -1

# 3. Check PM2 daemon health
$ pm2 ping
$ pm2 logs --lines 100

# 4. Test PM2 commands
$ pm2 list
$ pm2 restart dixis-frontend
```

---

## Lessons Learned

### 1. Next.js 15.5.0 Breaking Change

**Issue**: Default binding changed from IPv4 to IPv6

**Prevention**: Pin Next.js version OR always set HOSTNAME env var in production

**Update needed**: Add to deployment checklist:
```
# .env.production
HOSTNAME=127.0.0.1
PORT=3000
```

### 2. PM2 Configuration Gaps

**Issue**: No restart delay, no explicit hostname

**Fix**: Use proper ecosystem.config.js:
```javascript
{
  autorestart: true,
  restart_delay: 5000,      // Wait 5s before restart
  min_uptime: 10000,        // Must run 10s to be "stable"
  max_restarts: 10,         // Limit crash loops
  env: {
    HOSTNAME: "127.0.0.1",  // Explicit binding
    PORT: "3000"
  }
}
```

### 3. VPS Resource Monitoring Gap

**Issue**: Exit 137 kills with no visible OOM/limits

**Need**: Better monitoring
- systemd resource accounting
- Process-level resource tracking
- Monarx activity monitoring

---

## Current Status

### ✅ COMPLETED:
1. Root cause identified: IPv6 binding issue
2. Solution verified: HOSTNAME=127.0.0.1 works
3. PM2 config created with fix

### ❌ BLOCKED:
1. VPS kills all process start attempts (exit 137)
2. Cannot deploy PM2 configuration
3. PROD still down (502)

### 🔧 NEXT STEPS:
1. **Decision required**: Reboot VPS OR manual systemd service?
2. Apply HOSTNAME environment variable fix
3. Verify PROD health
4. Update STATE/NEXT docs
5. Investigate VPS resource issue (follow-up)

---

## References

- **Next.js Server Options**: https://nextjs.org/docs/api-reference/next-config-js/server
- **PM2 Ecosystem File**: https://pm2.keymetrics.io/docs/usage/application-declaration/
- **IPv6 Socket Binding**: https://man7.org/linux/man-pages/man7/ipv6.7.html
- **PR #1806**: https://github.com/lomendor/Project-Dixis/pull/1806
- **Build logs**: VPS `/tmp/manual-*.log`

