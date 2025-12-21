# Pass 13 Root Cause Analysis & Recommendation

**Date**: 2025-12-21 09:30 UTC
**Status**: PROD DOWN (502 Bad Gateway)
**Severity**: CRITICAL

## Executive Summary

**Root Cause**: Next.js `output: standalone` configuration incompatible with PM2 `npm start` command. VPS build does NOT generate `.next/standalone/` directory (while local build does), causing frontend crash loop.

**Impact**: Production frontend completely down since ~07:20 UTC (after old process crash)

**Recommended Solution**: **Option 2A** - Remove standalone config + rebuild + restart PM2 (15-20 min, reversible)

---

## Timeline of Events

### Dec 19 → Dec 21 06:50
- ✅ **PROD WORKING**: Frontend running on old build (PID 111790)
- Configuration: `next.config.ts` has `output: 'standalone'` (since Nov 15)
- PM2 running: `npm start` (calls `next start`)
- **Status**: Working DESPITE configuration mismatch (why?)

### Dec 21 07:00-07:15 (Audit Phase)
- Git pull: VPS updated to ad0ee481 (Pass 13 code)
- Build attempt: Succeeded (exit 0), new BUILD_ID created
- **Problem detected**: `.next/standalone/` directory NOT created on VPS
- Old process (111790) still running

### Dec 21 07:15-07:20 (Process Crash)
- Old process (111790) disappeared (crashed or killed)
- PM2 attempted auto-restart
- New process started (PID 280424) at 07:20 UTC

### Dec 21 07:20+ (Current State)
- Frontend process crashes on startup
- Error: `"next start" does not work with "output: standalone"`
- Permission errors: Cannot write to `.next/cache/fetch-cache/`
- **Result**: PROD returns 502 Bad Gateway

---

## Root Cause Analysis

### The Configuration Mismatch

**next.config.ts** (line 55):
```typescript
output: 'standalone',
```

**PM2 Configuration** (dump.pm2):
```json
"args": ["-c", "npm start"]
```

**package.json**:
```json
"start": "next start"
```

### Expected Behavior (Standalone Mode)

When `output: 'standalone'`:
1. `next build` creates `.next/standalone/` directory
2. Generates standalone `server.js` with all dependencies
3. **Start command should be**: `node .next/standalone/server.js`
4. **NOT**: `next start` (incompatible)

### Actual Behavior

**LOCAL BUILD** (macOS):
```bash
$ pnpm build
# Creates:
# .next/standalone/
# .next/standalone/server.js  ← THIS EXISTS
```

**VPS BUILD** (Ubuntu Linux):
```bash
$ pnpm build
# Creates:
# .next/  ← standard build
# .next/standalone/  ← MISSING!
# Exit code: 0 (but "ELIFECYCLE Command failed")
```

### Why VPS Build Doesn't Create Standalone?

**Build log analysis**:
```
✓ Generating static pages (99/99)
Finalizing page optimization ...
Collecting build traces ...      ← STOPS HERE
ELIFECYCLE Command failed.       ← Exits with code 0 (!)
```

**Hypothesis**: Build process interrupted during "Collecting build traces" phase (when standalone output is generated). Possible causes:
1. **Memory spike**: Trace collection requires extra memory
2. **Disk I/O limits**: Writing standalone files triggers limit
3. **Process signals**: Build receives SIGTERM/SIGHUP during trace phase
4. **Next.js bug**: Known issue with standalone in certain environments

**Evidence supporting interrupted build**:
- Exit code 0 (misleading - build reports success but incomplete)
- Standalone directory missing
- Build artifacts (.next/) exist but incomplete

### Why Did It Work Before?

**Question**: If config had `output: standalone` since Nov 15, why did it work until now?

**Answer**: Old build (Dec 19) likely:
1. **ALSO** didn't have standalone directory, OR
2. Had standalone but PM2 was using different start command, OR
3. Next.js warning was NON-FATAL and process started anyway

**Current situation**: Recent Next.js versions made this error FATAL (process exits)

---

## Detailed Findings

### Configuration State

| Component | Configuration | Status |
|-----------|--------------|--------|
| next.config.ts | `output: 'standalone'` | ✅ Present (line 55) |
| PM2 args | `npm start` | ✅ Confirmed |
| package.json | `"start": "next start"` | ✅ Confirmed |
| .next/standalone/ (VPS) | Missing | ❌ NOT CREATED |
| .next/standalone/ (local) | Present with server.js | ✅ CREATED CORRECTLY |

### Process State

| Process | PID | Status | Details |
|---------|-----|--------|---------|
| Old frontend | 111790 | Dead | Crashed/killed ~07:20 UTC |
| PM2 daemon | 111761 | Running | Alive but CLI commands fail |
| New frontend | 280424 | Crash loop | Starts → errors → hangs → killed |
| Backend | Running | OK | Not affected |

### VPS Resource State

```
Memory: 6.5GB available (adequate)
Swap: 0B (but not needed)
Disk: 88GB free (adequate)
CPU: Normal
Limits: All unlimited
```

**Conclusion**: Resources are adequate. Build interruption likely due to process management or I/O limits.

### Error Messages

**PM2 Error Log** (`~/.pm2/logs/dixis-frontend-error.log`):
```
Failed to update prerender cache for 36ac7a03... [Error: EACCES: permission denied]
Hangup
⚠ "next start" does not work with "output: standalone" configuration.
Use "node .next/standalone/server.js" instead.
Killed
```

**Interpretation**:
1. Process starts successfully
2. Permission errors writing cache (non-fatal warnings)
3. Next.js detects standalone config
4. Next.js **REFUSES** to run with `next start`
5. Process hangs (waiting for something?)
6. PM2 or system kills it (timeout/healthcheck)

---

## Solution Options

### Option 1: Fix Standalone Build ⚠️ COMPLEX

**Approach**: Make VPS build generate `.next/standalone/` directory correctly

**Steps**:
1. Investigate why VPS build doesn't create standalone
2. Fix underlying issue (memory/disk/process limits)
3. Rebuild to generate standalone
4. Update PM2 to use `node .next/standalone/server.js`
5. Restart PM2

**Pros**:
- Uses intended configuration (standalone is best for production)
- Smaller deployment footprint
- Better performance

**Cons**:
- Root cause unclear (time-consuming to debug)
- May require VPS changes (swap, limits, etc.)
- Complex PM2 config update
- Higher risk

**Estimated time**: 2-4 hours
**Risk**: HIGH

---

### Option 2A: Remove Standalone Config (RECOMMENDED) ✅

**Approach**: Remove `output: 'standalone'` from next.config, rebuild with standard output

**Steps**:
```bash
# 1. Edit next.config.ts (remove line 55: output: 'standalone')
# 2. Rebuild on VPS
ssh dixis-prod 'cd /var/www/dixis/frontend && pnpm build'

# 3. Kill old process (PM2 will auto-restart)
ssh dixis-prod 'kill 280424'

# 4. Verify new process starts correctly
# 5. Test PROD /orders endpoint
```

**Pros**:
- ✅ Simple and fast (15-20 min)
- ✅ Uses standard Next.js output (well-tested)
- ✅ PM2 config stays unchanged (npm start works)
- ✅ Reversible (can re-add standalone later)
- ✅ Low risk

**Cons**:
- Slightly larger deployment size (includes node_modules)
- Slightly slower cold starts

**Estimated time**: 15-20 minutes
**Risk**: LOW
**Reversibility**: HIGH (git revert + rebuild)

---

### Option 2B: Build Locally + Rsync ⚠️ WORKAROUND

**Approach**: Use local standalone build, rsync to VPS, update PM2

**Steps**:
```bash
# 1. Local build (already done - standalone exists)
cd frontend && pnpm build

# 2. Rsync standalone to VPS
rsync -az --delete .next/standalone/ dixis-prod:/var/www/dixis/frontend/.next/standalone/

# 3. Update PM2 config to use node .next/standalone/server.js

# 4. PM2 restart
```

**Pros**:
- Uses intended standalone configuration
- Bypasses VPS build issue

**Cons**:
- Requires PM2 config change
- Deployment workflow becomes complex (local build dependency)
- Rsync needs static files too (.next/static/, public/)
- Not sustainable long-term

**Estimated time**: 30-40 minutes
**Risk**: MODERATE

---

### Option 3: Fix PM2 CLI + Resurrect ⚠️ INCOMPLETE

**Approach**: Fix PM2 daemon issues, update config, restart properly

**Steps**:
1. Kill PM2 daemon
2. Clear PM2 state (sockets, PIDs)
3. Update PM2 ecosystem.config.js with correct standalone command
4. Resurrect processes

**Pros**:
- Fixes PM2 CLI issues
- Could restore proper process management

**Cons**:
- Doesn't solve the core problem (standalone build missing on VPS)
- PM2 config update complex
- May affect backend process
- Higher risk

**Estimated time**: 45-60 minutes
**Risk**: HIGH

---

## Recommended Action Plan

### IMMEDIATE: Option 2A (Remove Standalone)

**Rationale**:
1. **Fastest path to recovery** (15-20 min)
2. **Lowest risk** (standard Next.js output is battle-tested)
3. **No PM2 changes** (existing config works)
4. **Fully reversible** (can experiment with standalone later offline)

**Execution Plan**:

```bash
## PHASE 1 — Update Configuration (local)
cd /Users/panagiotiskourkoutis/Dixis\ Project\ 2/Project-Dixis
git checkout -b fix/remove-standalone-output

# Edit frontend/next.config.ts
# Remove line 55: output: 'standalone',

git add frontend/next.config.ts
git commit -m "fix(frontend): Remove standalone output to fix PM2 compatibility

- Remove output: 'standalone' from next.config.ts
- Allows 'next start' to work correctly with PM2
- Fixes PROD 502 frontend crash (Pass 13 deployment issue)

Root cause: VPS build doesn't generate .next/standalone/ directory,
causing 'next start' to fail with standalone config warning.

Standalone can be re-enabled later after investigating VPS build issue."

## PHASE 2 — Rebuild on VPS
ssh dixis-prod 'cd /var/www/dixis/frontend && \
  git fetch origin fix/remove-standalone-output && \
  git checkout fix/remove-standalone-output && \
  pnpm build'

# Verify build succeeded and NO standalone warning

## PHASE 3 — Restart Frontend
# Kill current crash-looping process
ssh dixis-prod 'kill 280424 || true'

# PM2 should auto-restart with new build
sleep 10

# Verify process is running
ssh dixis-prod 'ps aux | grep -E "next-server|next start" | grep -v grep'

## PHASE 4 — PROD Proof
curl -sS -o /dev/null -w "orders=%{http_code} redir=%{redirect_url}\n" https://dixis.gr/orders
# Expected: orders=307 redir=https://dixis.gr/auth/login

## PHASE 5 — Merge & Document
# If PROD proof successful:
git push origin fix/remove-standalone-output
gh pr create --title "fix(frontend): Remove standalone output for PM2 compatibility" \
  --body "Fixes PROD frontend crash. See docs/OPS/PASS13-ROOTCAUSE-ANALYSIS.md"

# Update STATE.md after merge
```

**Success Criteria**:
1. ✅ Build completes without standalone warning
2. ✅ Frontend process starts and stays running
3. ✅ `/orders` returns 307 or 200 (NOT 404 or 502)
4. ✅ No crash loops in PM2 logs
5. ✅ PROD stable for 10+ minutes

**Rollback Plan** (if it fails):
```bash
# Revert to main branch
ssh dixis-prod 'cd /var/www/dixis/frontend && git checkout main'
# Previous build artifacts (.next/) still exist
# Kill process, PM2 will restart with old build
```

---

### FOLLOW-UP: Investigate Standalone Issue (Later)

**After PROD is stable**, create task to investigate:

1. **Why VPS build doesn't create standalone directory**
   - Test builds with different Node versions
   - Check for filesystem/permission issues
   - Compare local vs VPS build environments
   - Check Next.js GitHub issues for known bugs

2. **If standalone is needed**:
   - Set up proper PM2 configuration for standalone mode
   - Test deployment workflow end-to-end
   - Document PM2 standalone setup

3. **Alternative**: Consider Docker deployment
   - Standalone mode works well with Docker
   - Consistent build environments
   - Better reproducibility

---

## Why This Happened

### Contributing Factors

1. **Hidden incompatibility**: `output: standalone` added Nov 15, but issue didn't manifest until now
   - Old build may have worked despite config (Next.js behavior changed?)
   - Old process was long-running (no restarts since Dec 19)

2. **Build verification gap**: No check that standalone directory was created
   - Build exits 0 even when standalone generation fails
   - CI/CD doesn't verify deployment artifacts

3. **PM2 configuration not updated**: When standalone was added (Nov 15), PM2 wasn't updated to use `node server.js`

4. **VPS resource constraints**: May have limits that prevent standalone generation (not visible in `free -h`)

### Lessons Learned

1. **Test configuration changes end-to-end**: `output: standalone` should have been tested with full deploy cycle
2. **Monitor build artifacts**: Verify expected outputs (.next/standalone/) exist after build
3. **Document deployment requirements**: Standalone mode requires different PM2 config
4. **Separate build from deploy**: Consider building in CI and deploying artifacts

---

## Open Questions

1. **Why did Dec 19 build work?**
   - Did it have standalone directory, or did it also lack it but didn't crash?
   - When did Next.js start enforcing the standalone incompatibility?

2. **What's killing VPS builds?**
   - Why does `rm -rf .next` get killed (exit 137)?
   - Is there a cgroup limit, systemd slice limit, or other resource constraint?

3. **Is there a PM2 systemd service?**
   - How is PM2 started on boot?
   - Why do PM2 CLI commands fail with exit 137/255?

---

## References

- **Next.js Standalone Docs**: https://nextjs.org/docs/advanced-features/output-file-tracing
- **Next.js Issue**: "next start" warning added in: https://github.com/vercel/next.js/pull/XXXXX (TODO: find PR)
- **PM2 Configuration**: https://pm2.keymetrics.io/docs/usage/application-declaration/
- **Pass 13 Audit**: docs/OPS/PASS13-DEPLOYMENT-AUDIT.md
- **Current State**: docs/OPS/STATE.md

---

## Appendix: Technical Evidence

### next.config.ts (Current)
```typescript
// Line 55
output: 'standalone',
```

### PM2 dump.pm2 (Current)
```json
{
  "name": "dixis-frontend",
  "args": ["-c", "npm start"],
  "pm_exec_path": "/usr/bin/bash",
  "pm_cwd": "/var/www/dixis/frontend"
}
```

### Local Build Output (Working)
```
.next/standalone/
├── .env
├── .next/
├── node_modules/
├── package.json
├── public/
├── server.js  ← Standalone entry point
└── src/
```

### VPS Build Output (Broken)
```
.next/
├── BUILD_ID (836NPoCn9F4-uRaKvNCi2)
├── cache/
├── server/
├── static/
└── [no standalone/ directory]
```

### Error from PM2 Logs
```
⚠ "next start" does not work with "output: standalone" configuration.
Use "node .next/standalone/server.js" instead.
```

