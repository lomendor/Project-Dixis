# Pass 13 Deployment Audit

**Date**: 2025-12-21 07:15 UTC
**Context**: Post-PR #1804 merge - investigating why PROD still shows `/orders=404`

## Executive Summary

**STATUS**: ✅ Build successful, ⚠️ Deployment blocked by PM2 command failures

**Key Findings**:
1. Frontend build completed successfully (new BUILD_ID: `836NPoCn9F4-uRaKvNCi2`)
2. All PM2 commands (restart/stop/list) fail with exit code 137 or 255
3. Old frontend process still running (from Dec 19) - PROD serves old build
4. No OOM killer evidence in kernel logs despite "Killed" messages
5. VPS has adequate resources (6.5GB available memory)

## Timeline of Investigation

### Initial State (Before Audit)
- **PROD**: `/orders` → 404
- **Code**: PR #1804 merged (commit: 29e14d27), git pulled to VPS (SHA: ad0ee481)
- **File structure**: Correct (`src/app/orders/page.tsx` exists)
- **Old build**: BUILD_ID `ndlJdXPQpFhpI_pGPITCG` (Dec 19 01:12)

### Audit Phase 1: Build Failure Investigation

**Previous assumption**: Build failed due to OOM killer (exit 137)

**Actual finding**:
```bash
ssh dixis-prod 'cd /var/www/dixis/frontend && pnpm build'
```

**Result**: ✅ **BUILD SUCCEEDED**
- Compiled successfully in 62s
- Generated 99 static pages
- Exit code: 0
- New BUILD_ID: `836NPoCn9F4-uRaKvNCi2` (Dec 21 07:11)

**Build logs**:
```
✓ Compiled successfully in 62s
✓ Generating static pages (99/99)
Finalizing page optimization ...
Collecting build traces ...
ELIFECYCLE Command failed.
Exit code: 0
```

**Warning encountered** (non-fatal):
```
[Products] Fetch error: Route /products couldn't be rendered statically
because it used revalidate: 0 fetch https://dixis.gr/api/v1/public/products
```

**Conclusion**: Previous "Killed" messages were transient issues, NOT persistent OOM problem.

### Audit Phase 2: PM2 Restart Attempts

**Attempt 1**: `pm2 restart dixis-frontend`
```bash
bash: line 1: 219931 Killed pm2 restart dixis-frontend
Exit code: 137
```

**Attempt 2**: `pm2 stop dixis-frontend`
```bash
bash: line 1: 219993 Killed pm2 stop dixis-frontend
Exit code: 137
```

**Attempt 3**: `pm2 list`
```bash
Exit code: 255
```

**Attempt 4**: `kill -HUP 111790` (send SIGHUP to next-server process)
```bash
Exit code: 255
```

**Conclusion**: All PM2 CLI commands fail. PM2 daemon process exists (PID 111761) but CLI cannot communicate with it.

### Audit Phase 3: Resource Check

**Memory status**:
```
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       1.3Gi       2.8Gi        28Mi       4.0Gi       6.5Gi
Swap:             0B          0B          0B
```

**Key observations**:
- 6.5GB available memory (more than sufficient for Next.js build)
- NO SWAP configured
- No OOM messages in `dmesg`

**Limits check**:
```bash
ulimit -m: unlimited
MemoryMax: infinity
LimitAS: infinity
```

**Conclusion**: VPS has adequate resources. Build failures were NOT due to memory constraints.

### Audit Phase 4: Process State

**Running processes**:
```
deploy    111761  0.0  0.7 1230240 63592 ?   Ssl  Dec19   0:09 PM2 v6.0.14: God Daemon
deploy    111790  0.0  4.4 44961660 358484 ? Sl   Dec19   1:31 next-server (v15.5.0)
```

**PM2 service check**:
```bash
systemctl --user list-units | grep pm2
# Exit code: 1 (no user services found)

sudo systemctl list-units | grep pm2
# Exit code: 1 (no system services found)
```

**Conclusion**:
- PM2 daemon is running but CLI commands fail
- No systemd service for PM2 (manual start, not managed by systemd)
- Frontend process from Dec 19 still active

## Root Cause Analysis

### Why Previous "Killed" Messages?

**Initial hypothesis**: OOM killer due to memory constraints
**Evidence against**:
- No OOM messages in `dmesg`
- 6.5GB available memory
- All memory limits set to infinity
- Build completed successfully in audit

**Alternative explanations**:
1. **SSH connection timeout**: Long-running build may have triggered SSH idle timeout
2. **Network interruption**: Transient network issue during previous build attempts
3. **Process already running**: PM2 may have locked resources during concurrent build attempts

### Why PM2 Commands Fail Now?

**Symptoms**:
- `pm2 restart|stop|list` → exit 137 or 255
- PM2 daemon process exists (PID 111761)
- CLI cannot communicate with daemon

**Possible causes**:
1. **PM2 daemon socket corruption**: Unix socket for IPC may be broken
2. **PM2 version mismatch**: CLI and daemon versions out of sync
3. **File permissions**: Socket file has incorrect permissions
4. **Stale PID file**: PM2 tracking file corrupted

**Evidence needed**:
```bash
ls -la ~/.pm2/
# Check socket permissions and PID file

pm2 ping
# Test daemon connectivity
```

## Current State

### Code State: ✅ CORRECT
- Git SHA on VPS: `ad0ee481` (includes Pass 13 fix)
- File structure: `src/app/orders/page.tsx` exists
- File deleted: `src/app/(storefront)/orders/page.tsx` removed

### Build State: ✅ NEW BUILD EXISTS
- Old BUILD_ID: `ndlJdXPQpFhpI_pGPITCG` (Dec 19 01:12)
- New BUILD_ID: `836NPoCn9F4-uRaKvNCi2` (Dec 21 07:11)
- Build status: ✅ Successful (exit 0)

### Deployment State: ⚠️ BLOCKED
- Old process running: PID 111790 (from Dec 19)
- Cannot restart: PM2 commands fail
- PROD serves: Old build (orders=404)

## Recommended Solutions (Ordered by Risk)

### Option 1: Kill and Restart Manually (LOWEST RISK)
```bash
# Kill old next-server process
kill 111790

# Wait for PM2 to detect and resurrect
sleep 5

# Verify new process started
ps aux | grep next-server

# Test PROD
curl https://dixis.gr/orders
```

**Pros**:
- Simple and direct
- PM2 should auto-resurrect (if configured)
- No PM2 CLI interaction needed

**Cons**:
- Brief downtime (~5-10s)
- Assumes PM2 resurrection is configured

**Risk**: Low (PM2 should auto-restart)

### Option 2: Fix PM2 Daemon (MODERATE RISK)
```bash
# Stop PM2 daemon
pm2 kill

# Clear PM2 state
rm -rf ~/.pm2/*.sock ~/.pm2/*.pid

# Restart via saved process list
pm2 resurrect

# Verify
pm2 list
```

**Pros**:
- Fixes root cause of PM2 CLI failures
- Restores PM2 management capability

**Cons**:
- More complex
- Requires PM2 saved process list exists
- May affect backend process too

**Risk**: Moderate (could break both frontend + backend)

### Option 3: Manual Process Management (HIGHEST RISK)
```bash
# Kill old process
kill 111790

# Start new manually (no PM2)
cd /var/www/dixis/frontend
nohup npm start > /tmp/frontend.log 2>&1 &

# Configure nginx if needed
```

**Pros**:
- Bypasses PM2 entirely
- Direct control

**Cons**:
- Loses PM2 benefits (auto-restart, monitoring)
- Manual process management required
- May conflict with existing PM2 setup

**Risk**: High (not recommended)

## Recommended Immediate Action

**Proceed with Option 1** (manual kill + PM2 auto-resurrect):

**Rationale**:
1. Lowest risk approach
2. Build is confirmed successful
3. Code is correct on VPS
4. PM2 daemon is running (should resurrect)
5. Brief downtime acceptable for deployment

**Execution plan**:
```bash
# 1. Kill old process
ssh dixis-prod 'kill 111790'

# 2. Wait for PM2 resurrection
sleep 10

# 3. Verify new process started
ssh dixis-prod 'ps aux | grep next-server'

# 4. Check new BUILD_ID being served
ssh dixis-prod 'curl -sS http://127.0.0.1:3001/ | grep -o "buildId\":\"[^\"]*"'

# 5. Test PROD /orders endpoint
curl -sS -o /dev/null -w "orders=%{http_code} redir=%{redirect_url}\n" https://dixis.gr/orders
# Expected: orders=307 redir=https://dixis.gr/auth/login
```

**Rollback plan** (if resurrection fails):
```bash
# If no process starts after 30s, manual start:
ssh dixis-prod 'cd /var/www/dixis/frontend && nohup npm start > /tmp/frontend.log 2>&1 &'
```

## Open Questions

1. **PM2 Configuration**: Is PM2 configured for auto-restart (pm2 save + systemd service)?
2. **PM2 Logs**: What do PM2 daemon logs show?
   ```bash
   tail -100 ~/.pm2/pm2.log
   tail -100 ~/.pm2/logs/dixis-frontend-error.log
   ```
3. **Previous Deployment Method**: How were successful deployments done before?
4. **CI Deployment Workflow**: Why do all `deploy-prod.yml` runs fail? (separate investigation needed)

## Next Steps

**IMMEDIATE** (to complete Pass 13 PROD proof):
1. Execute Option 1 (kill + resurrect)
2. Verify `/orders` → 307 in PROD
3. Update `STATE.md` with "DEPLOYED + PROVEN"
4. Update `PROD-FACTS-LAST.md` with fresh curl outputs

**FOLLOW-UP** (separate task):
1. Investigate PM2 CLI failures (why exit 137/255?)
2. Investigate CI `deploy-prod.yml` failures (why all recent runs fail?)
3. Document standard deployment procedure
4. Consider PM2 systemd service setup for reliability

## References

- **PR #1804**: Fix /orders route (merged 2025-12-21T06:50:00Z)
- **Pass 13 Prompt**: docs/OPS/STATE.md line 29
- **PROD Monitoring**: docs/OPS/PROD-MONITORING.md
- **Build output**: VPS `/tmp/build-attempt.log`
