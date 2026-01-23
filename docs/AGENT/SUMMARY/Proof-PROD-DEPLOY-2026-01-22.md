# Proof: Production Deploy Verification (2026-01-22)

**Date**: 2026-01-22T22:25:48Z
**Target Commit**: 14132130
**Pass ID**: PROD-DEPLOY-PROOF-01
**Result**: **PASS**

---

## Executive Summary

| Check | Status | Notes |
|-------|--------|-------|
| Deploy workflow success | **PASS** | Run 21266577496 (workflow_dispatch) |
| Health endpoint | **PASS** | `{"status":"ok","database":"connected"}` |
| Producer Orders Link | **PASS** | `user-menu-producer-orders` now visible in prod |
| Playwright proof | **PASS** | 5/5 tests passed |

**Verdict**: `prod == main` (commit 14132130 confirmed deployed)

---

## Timeline

| Time (UTC) | Event |
|------------|-------|
| 2026-01-22 19:51 | PR #2406 merged (UX-DASHBOARD-ENTRYPOINTS-01) |
| 2026-01-22 19:51 | Auto-deploy failed (SSH timeout: `dial tcp ...22 i/o timeout`) |
| 2026-01-22 22:05 | Manual redeploy triggered (workflow_dispatch) |
| 2026-01-22 22:09 | Redeploy completed **SUCCESS** (run 21266577496) |
| 2026-01-22 22:25 | Post-redeploy proof **PASS** |

---

## Evidence

### 1. Deploy Workflow Status

```bash
gh run list --repo lomendor/Project-Dixis --workflow="Deploy Frontend (VPS)" --limit=3
```

| Status | Commit | Workflow | Trigger | Run ID | Duration | Time |
|--------|--------|----------|---------|--------|----------|------|
| **success** | (manual) | Deploy Frontend (VPS) | workflow_dispatch | 21266577496 | 3m32s | 22:05:52Z |
| failure | 14132130 | Deploy Frontend (VPS) | push | 21262732101 | 2m57s | 19:51:42Z |
| success | 7a58103f | Deploy Frontend (VPS) | push | 21260898910 | 3m33s | 18:52:25Z |

### 2. Health Endpoint

```bash
curl -sS https://dixis.gr/api/healthz
```

```json
{
  "status": "ok",
  "database": "connected",
  "payments": {"cod": "enabled", "card": {"flag": "enabled", "stripe_configured": true}},
  "email": {"flag": "enabled", "mailer": "resend", "configured": true},
  "timestamp": "2026-01-22T22:25:15.280583Z",
  "version": "12.38.1"
}
```

### 3. HTTP Headers (Production)

```
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

### 4. Playwright Proof Test

```bash
cd frontend
BASE_URL=https://dixis.gr E2E_EXTERNAL=true npx playwright test tests/e2e/header-screenshot-proof.spec.ts --reporter=line
```

**Output:**
```
Running 5 tests using 1 worker

[PASS] PROOF: Guest header state
[PASS] PROOF: Consumer (logged-in) header state
[PASS] PROOF: Producer header state
       Producer Orders Link Visible: true   <-- KEY PROOF
[PASS] PROOF: Admin header state
[PASS] PROOF: Mobile header (guest)

5 passed (7.1s)
```

### 5. Screenshot Artifacts

| Screenshot | File | Size |
|------------|------|------|
| Producer menu open | `header-producer-menu-open.png` | 88KB |
| Producer closed | `header-producer-closed.png` | 78KB |
| Guest | `header-guest.png` | 79KB |
| Consumer menu | `header-consumer-menu-open.png` | 86KB |
| Admin menu | `header-admin-menu-open.png` | 86KB |
| Mobile menu | `header-mobile-guest-menu-open.png` | 49KB |

Path: `frontend/test-results/header-proof/`

---

## Before vs After

| Feature | Before (stale) | After (deployed) |
|---------|----------------|------------------|
| Commit on prod | Unknown (pre-14132130) | 14132130 |
| `user-menu-producer-orders` | NOT visible | **VISIBLE** |
| Producer Dashboard link | Present | Present |
| Playwright proof | PARTIAL | **5/5 PASS** |

---

## Root Cause: Initial Deploy Failure

The auto-deploy on PR #2406 merge failed due to SSH connectivity:

```
dial tcp [VPS_IP]:22: i/o timeout
```

This is a transient network/Hostinger VPS issue, not a code bug. Manual redeploy via `workflow_dispatch` succeeded.

**Mitigation**: Monitor for recurring SSH timeouts. If frequent, investigate:
- Hostinger VPS firewall rules
- fail2ban configuration
- SSH port 22 allowlist

---

## Conclusion

**PASS**: Production now matches main (commit 14132130). The `user-menu-producer-orders` link is visible for producers.

---

_Proof-PROD-DEPLOY-2026-01-22 | Release Lead: Claude_
