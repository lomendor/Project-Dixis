# Production Outage Incident - Next.js IPv6 Binding Issue

**Date**: 2025-12-21
**Duration**: ~2 hours (07:20 - 09:45 UTC)
**Severity**: CRITICAL (PROD completely down, 502 Bad Gateway)
**Status**: ✅ RESOLVED

---

## Executive Summary

**Root Cause**: Next.js 15.5.0 changed default network binding from IPv4 (`0.0.0.0`) to IPv6 (`::`) causing `EADDRINUSE` error on VPS despite port 3000 being free. VPS IPv6 configuration incompatible with Next.js IPv6 binding.

**Solution**: Created systemd launcher service with explicit `HOSTNAME=127.0.0.1` environment variable forcing IPv4-only binding.

**Impact**: Frontend completely unavailable for ~2 hours. Backend remained operational.

---

## Timeline

### 07:00-07:15 UTC - Deployment Attempt
- PR #1804 merged (fixed `/orders` 404 route conflict)
- PR #1806 merged (removed `output: 'standalone'` incompatibility)
- Git pulled to VPS, frontend rebuilt successfully
- Old frontend process (PID 111790, from Dec 19) still running

### 07:20 UTC - Outage Begins
- Old frontend process crashed/killed
- PM2 attempted auto-restart
- **SYMPTOM**: `EADDRINUSE: address already in use :::3000`
- **PARADOX**: `lsof -i :3000` and `ss -lntp` showed NO process on port 3000
- Frontend entered crash loop (exit on startup)
- PROD returned 502 Bad Gateway

### 07:20-09:30 UTC - Investigation
- **Initial hypothesis**: OOM killer (exit 137) - REJECTED (6.5GB available memory, no dmesg OOM)
- **Secondary hypothesis**: PM2 daemon corrupted - PARTIALLY CORRECT (daemon from Dec 19)
- **Root cause identified**: IPv6 binding issue
  - Next.js tries to bind to `:::3000` (IPv6 all interfaces)
  - VPS IPv6 environment misconfigured
  - Gets `EADDRINUSE` despite port being free
- **Verification test**:
  ```bash
  PORT=3000 npm start                    # FAILS (IPv6)
  PORT=3000 HOSTNAME=127.0.0.1 npm start # SUCCESS (IPv4)
  ```

### 09:30-09:45 UTC - Recovery
- VPS reboot cleared stuck PM2 state
- Created systemd launcher service with `HOSTNAME=127.0.0.1`
- Frontend started successfully on `127.0.0.1:3000`
- PROD endpoints returned 200
- PM2 frontend removed (redundant, systemd manages frontend now)

---

## Root Cause Analysis

### Primary Cause: Next.js 15.5.0 IPv6 Binding

**What changed**:
- Older Next.js versions: bind to `0.0.0.0` (IPv4 all interfaces)
- Next.js 15.5.0: bind to `::` (IPv6 all interfaces, with IPv4 dual-stack)

**Why it failed**:
- VPS environment has IPv6 misconfiguration or `net.ipv6.bindv6only = 1`
- Binding to `::` fails with `EADDRINUSE` despite port being free
- Next.js doesn't fall back to IPv4

**Evidence**:
```
Error: listen EADDRINUSE: address already in use :::3000
                                           ^^^ IPv6 syntax
  address: '::'   ← IPv6 all interfaces
  port: 3000
```

### Secondary Issue: PM2 Crash Loop

**Contributing factors**:
1. No restart delay (`restart_delay: null`)
2. Socket in TIME_WAIT state after crash
3. Immediate restart attempts (no backoff)
4. PM2 daemon from Dec 19 (stale state)

**Result**: Frontend crashed on every restart attempt, never recovered.

### Why Port Appeared Free

**Socket state after crash**:
- TCP socket enters TIME_WAIT (Linux default: 60 seconds)
- `lsof` and `ss` don't show TIME_WAIT sockets with default flags
- Next.js tries to bind before kernel releases socket
- Gets EADDRINUSE even though no active listener

---

## Solution Implemented

### Systemd Launcher Service (Persistent)

**File**: `/etc/systemd/system/dixis-frontend-launcher.service`

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

**Key features**:
- ✅ Enabled (auto-starts on boot)
- ✅ Sets `HOSTNAME=127.0.0.1` environment variable
- ✅ Uses `-H 127.0.0.1` flag (belt-and-suspenders)
- ✅ Creates transient `dixis-frontend-prod.service`
- ✅ System-level management (more reliable than PM2)

### PM2 Configuration Cleanup

**Before**: PM2 managed both frontend + backend
**After**: PM2 manages backend only, systemd manages frontend

**Rationale**:
- systemd launcher already working with HOSTNAME fix
- More reliable than PM2 (system-level, root-owned)
- No daemon dependency
- Clear separation of concerns

---

## Verification

### PROD Health Check (2025-12-21 10:16 UTC)

```bash
curl https://dixis.gr/api/healthz  # 200 ✅
curl https://dixis.gr/products     # 200 ✅
curl https://dixis.gr/orders       # 200 ✅
```

### VPS Process State

```
Port 3000: LISTEN on 127.0.0.1 (IPv4 only) ✅
Process: next-server (v15.5.0), PID 720, user root
Manager: systemd (dixis-frontend-prod.service)
Launcher: enabled (auto-starts on boot)
```

### Reboot Test

**Expected behavior after reboot**:
1. systemd starts `dixis-frontend-launcher.service`
2. Launcher creates transient `dixis-frontend-prod.service`
3. Frontend binds to `127.0.0.1:3000` with IPv4
4. PROD returns 200

**Status**: Not yet tested (next maintenance window)

---

## Lessons Learned

### 1. Next.js Version Upgrades Require Testing

**Issue**: Next.js 15.5.0 breaking change (IPv6 binding) went undetected

**Prevention**:
- Test major/minor Next.js upgrades in staging first
- Always set explicit `HOSTNAME` in production environment
- Document network binding requirements

### 2. VPS Environment Assumptions

**Issue**: Assumed VPS supports IPv6 dual-stack binding

**Prevention**:
- Audit VPS network configuration (`net.ipv6.*` kernel params)
- Test IPv6 compatibility before deploying IPv6-default software
- Consider disabling IPv6 if not actively used

### 3. PM2 Configuration Gaps

**Issue**: No restart delay, no min uptime threshold

**Prevention**:
- Configure PM2 with proper restart policies:
  ```javascript
  {
    restart_delay: 5000,      // Wait 5s before restart
    min_uptime: 10000,        // Must run 10s to be "stable"
    max_restarts: 10          // Limit crash loops
  }
  ```

### 4. Deployment Verification Checklist

**Issue**: Deployment succeeded but process didn't start (went unnoticed until old process crashed)

**Prevention**:
- Verify new process starts after deployment (don't rely on old process)
- Test PROD endpoints immediately after deploy
- Automated smoke tests every 15 minutes (now implemented)

---

## Action Items

### Completed ✅

- [x] VPS reboot to clear stuck state
- [x] Create systemd launcher with HOSTNAME fix
- [x] Remove redundant PM2 frontend config
- [x] Verify PROD health (all 200)
- [x] Document incident

### Follow-up (Future)

- [ ] Test VPS reboot to verify launcher auto-starts correctly
- [ ] Audit VPS IPv6 kernel configuration (`sysctl net.ipv6.*`)
- [ ] Consider adding `HOSTNAME=127.0.0.1` to frontend `.env` (defense-in-depth)
- [ ] Update deployment docs with systemd management notes
- [ ] Review PM2 backend config (add restart policies)

---

## References

- **Next.js Server Options**: https://nextjs.org/docs/app/api-reference/next-config-js/server
- **systemd.run**: https://www.freedesktop.org/software/systemd/man/systemd-run.html
- **IPv6 Socket Binding**: https://man7.org/linux/man-pages/man7/ipv6.7.html
- **PR #1804**: Fix /orders route (Next.js routing conflict)
- **PR #1806**: Remove standalone output (PM2 incompatibility)
- **Root Cause Analysis**: `docs/OPS/VPS-DEPLOYMENT-BLOCKER-ANALYSIS.md` (450+ lines)
- **Deployment Audit**: `docs/OPS/PASS13-DEPLOYMENT-AUDIT.md`
- **Pass 13 Root Cause**: `docs/OPS/PASS13-ROOTCAUSE-ANALYSIS.md`

---

## Incident Classification

**Type**: Configuration incompatibility (software upgrade + environment mismatch)
**Detection**: Manual (PROD returned 502 during deployment verification)
**Recovery**: Manual (VPS reboot + systemd service creation)
**Prevention**: Partially automated (scheduled smoke tests now catch 404/502)

**Total Downtime**: ~2 hours
**Business Impact**: Medium (no active users reported, but complete service unavailability)
**Technical Impact**: High (required root cause investigation + architectural change)

---

**Incident Closed**: 2025-12-21 10:16 UTC
**Documented By**: Claude Code (AI-assisted incident response)
**Approved By**: [Pending human review]
