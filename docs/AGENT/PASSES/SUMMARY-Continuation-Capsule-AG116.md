# AG116 Continuation Capsule - Staging CI Deploy Pipeline

**Pass**: AG116 (Staging CI Deploy Pipeline)
**Status**: ✅ **COMPLETE**
**Date**: 2025-12-15
**Duration**: ~2 hours (2 PRs: #1681 ssh-keyscan, #1682 health check)

---

## ✅ DONE

### PR #1681: SSH Setup Fix (ssh-keyscan + KNOWN_HOSTS)
- **Problem**: ssh-keyscan failed with exit 1, blocking staging deployments
- **Root Cause**: KNOWN_HOSTS secret not set, ssh-keyscan unreliable
- **Fix**:
  - Added KNOWN_HOSTS secret fallback (preflight check)
  - Added DNS resolution + SSH:22 connectivity checks
  - Made ssh-keyscan non-fatal (best-effort)
- **Result**: ✅ Staging deploy progressed past SSH setup
- **PR**: https://github.com/lomendor/Project-Dixis/pull/1681
- **Merged**: 2025-12-15 11:05 EET

### PR #1682: Health Check Timeout Fix (PORT discovery + curl timeout)
- **Problem**: Staging deploy hung at Health Check for 5+ minutes, exit 255 (broken pipe)
- **Root Cause**:
  - PORT discovery returned multiline "3000\n3001\n3001"
  - curl had no timeout, hung indefinitely
  - SSH connection broke after ~5 minutes
- **Fix**:
  - Added `| head -1` to PORT grep (take first match only)
  - Added PORT validation with fallback to 3001
  - Added `curl -m 30` timeout (prevent indefinite hangs)
  - Changed heredoc to single-quoted `<<'HEALTH_CHECK'`
  - Improved error handling with explicit curl exit code check
- **Result**: ✅ Deployment Run 20230094323 PASSED in 2m42s
- **PR**: https://github.com/lomendor/Project-Dixis/pull/1682
- **Merged**: 2025-12-15 11:11 EET
- **Verification Run**: https://github.com/lomendor/Project-Dixis/actions/runs/20230094323

---

## ❌ NOT DONE

### External Staging SSL
- **Issue**: `curl -fsS https://staging.dixis.io/api/healthz` returns exit 35 (SSL error)
- **Impact**: Non-blocking (internal health check via SSH localhost works)
- **Follow-up**: Investigate staging SSL certificate configuration (future task)

---

## 📋 NEXT STEPS

### Immediate (if user requests):
1. **Verify Next Staging Deploy**: Trigger manual deployment to confirm fix persists
   ```bash
   gh workflow run deploy-staging.yml --ref main
   gh run watch $(gh run list --workflow=deploy-staging.yml --limit 1 --json databaseId -q '.[0].databaseId')
   ```

### Monitoring (optional):
2. **Watch Staging Health**: Monitor automated deployments on main branch pushes
   ```bash
   gh run list --workflow=deploy-staging.yml --limit 5
   ```

3. **Check PM2 Status on VPS** (requires SSH access):
   ```bash
   ssh $STAGING_USER@$STAGING_HOST "pm2 list && pm2 logs dixis-staging --lines 20"
   ```

---

## 🔍 VERIFICATION COMMANDS

### CI Deployment Status
```bash
# Check latest staging deployment status:
gh run list --workflow=deploy-staging.yml --limit 1

# Watch live deployment:
gh workflow run deploy-staging.yml --ref main && sleep 5 && \
  gh run watch $(gh run list --workflow=deploy-staging.yml --limit 1 --json databaseId -q '.[0].databaseId')
```

### Health Check (Internal - requires VPS SSH)
```bash
# SSH to staging VPS and check health locally:
ssh $STAGING_USER@$STAGING_HOST "curl -fsS -m 10 http://localhost:3001/api/healthz"
# Expected: {"status":"ok","basicAuth":false,"devMailbox":false,"ts":"2025-12-15T..."}
```

### Health Check (External - has SSL issues currently)
```bash
# External health check (will fail with SSL error currently):
curl -fsS -m 10 https://staging.dixis.io/api/healthz
# Current: exit 35 (SSL error) - non-blocking, internal check works
```

---

## ⚠️ RISKS & MITIGATIONS

### Risk 1: PORT Discovery Fails (New)
**Scenario**: `pm2 jlist` returns unexpected JSON format, PORT discovery fails
**Mitigation**:
- PORT validation with fallback to 3001 (default staging port)
- Fallback logic added in lines 165-168 of deploy-staging.yml

### Risk 2: curl Timeout Too Short
**Scenario**: Health endpoint takes >30s to respond (unlikely)
**Mitigation**:
- 30s timeout is generous for simple JSON endpoint
- If needed, increase timeout to 60s in future

### Risk 3: Heredoc Variable Expansion
**Scenario**: Unquoted heredoc causes variable expansion issues
**Mitigation**:
- Changed to single-quoted `<<'HEALTH_CHECK'` to prevent expansion
- All variables now use remote shell's environment

---

## 📄 FILES MODIFIED

### .github/workflows/deploy-staging.yml
**Lines 156-187** (Health check step):
```yaml
- name: Health check
  run: |
    echo "🩺 Staging health check..."
    sleep 3
    ssh -i ~/.ssh/id_ed25519 ${STAGING_USER}@${STAGING_HOST} bash <<'HEALTH_CHECK'
    set -euo pipefail

    # Discover PORT from PM2 (take first match only)
    PORT=$(pm2 jlist | grep -A 5 'dixis-staging' | grep -oP '"PORT":\s*"\K\d+' | head -1)
    if [ -z "$PORT" ]; then
      echo "⚠️  No PORT found in PM2, defaulting to 3001"
      PORT="3001"
    fi
    echo "🔍 Health check on port $PORT"

    # Call healthz endpoint with timeout
    if ! RESPONSE=$(curl -fsS -m 30 http://localhost:$PORT/api/healthz 2>&1); then
      echo "❌ Health check FAILED - curl error: $RESPONSE"
      exit 1
    fi
    echo "📋 Response: $RESPONSE"

    # Validate JSON response contains "status":"ok"
    if echo "$RESPONSE" | grep -q '"status":"ok"'; then
      echo "✅ Health check PASSED"
      exit 0
    else
      echo "❌ Health check FAILED - invalid response"
      exit 1
    fi
    HEALTH_CHECK
    echo "✅ Staging deployment successful!"
```

**Key Changes**:
- `| head -1` added to PORT discovery (line 164)
- PORT validation + fallback to 3001 (lines 165-168)
- `curl -m 30` timeout added (line 172)
- Heredoc changed to single-quoted `<<'HEALTH_CHECK'` (line 160)
- Explicit curl exit code check (lines 172-175)

---

## 🎯 SUCCESS CRITERIA

- [x] Staging deployment completes without timeout
- [x] Health check executes in <30 seconds
- [x] Internal health endpoint returns 200 OK
- [x] PM2 process restart successful
- [x] No exit 255 errors
- [x] PRODUCTION UNTOUCHED (zero changes to prod workflow)

---

## 📊 CURRENT STATE

### Production Status
- **Domain**: https://dixis.gr
- **Status**: 🟢 **ONLINE**
- **Health**: `/api/healthz` → 200 OK
- **Server**: Next.js standalone (PM2)
- **SSL**: Valid certificate, auto-renewing

### Staging Status
- **Domain**: https://staging.dixis.io
- **Status**: 🟢 **DEPLOYED** (via CI Run 20230094323)
- **Health**: Internal localhost check → ✅ PASS
- **SSL**: ⚠️ External HTTPS has SSL error (non-blocking)
- **CI Pipeline**: ✅ GREEN (all steps pass, health check <30s)

---

## 🔗 REFERENCES

- **PR #1681 (ssh-keyscan fix)**: https://github.com/lomendor/Project-Dixis/pull/1681
- **PR #1682 (health check fix)**: https://github.com/lomendor/Project-Dixis/pull/1682
- **Successful Deployment Run**: https://github.com/lomendor/Project-Dixis/actions/runs/20230094323
- **Pass Summary**: `docs/AGENT/PASSES/SUMMARY-Pass-AG116.md`
- **OPS State**: `docs/OPS/STATE.md` (AG116 entry added)

---

**Generated**: 2025-12-15 11:15 EET
**Pass**: AG116 (Staging CI Deploy Pipeline)
**Status**: ✅ COMPLETE
