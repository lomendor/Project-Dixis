# Proof: OPS-DEPLOY-SSH-RETRY-01 Deploy with Retry

**Date**: 2026-01-22T23:17:47Z
**Merged Commit**: `6f7e1499bacff4faac1f4f27a91f53e63b1658fc`
**PR**: #2408
**Result**: **PASS**

---

## Summary

First production deploy with SSH retry + post-deploy proof completed successfully.

| Check | Status |
|-------|--------|
| PR Merge | ✅ MERGED (squash) |
| Deploy Frontend (VPS) | ✅ SUCCESS (3m47s) |
| Deploy Backend (VPS) | ✅ SUCCESS (17s) |
| prod-facts.sh | ✅ ALL CHECKS PASSED |
| perf-baseline.sh | ✅ ALL < 300ms TTFB |
| Health endpoint | ✅ `{"status":"ok"}` |

---

## Deploy Workflow Runs

| Workflow | Run ID | Status | Duration |
|----------|--------|--------|----------|
| Deploy Frontend (VPS) | [21268269263](https://github.com/lomendor/Project-Dixis/actions/runs/21268269263) | SUCCESS | 3m47s |
| Deploy Backend (VPS) | [21268269271](https://github.com/lomendor/Project-Dixis/actions/runs/21268269271) | SUCCESS | 17s |

### Frontend Deploy Steps (all PASS)

```
✓ Precheck VPS env files (with retry)
✓ Prepare VPS directory (with retry)
✓ Deploy standalone to VPS (with retry)
✓ Configure and start app
✓ Post-deploy proof (prod == main)
```

The `(with retry)` suffix confirms the retry wrapper is active.

---

## Post-Deploy Verification

### Health Endpoint

```bash
curl -sS https://dixis.gr/api/healthz
```

```json
{
  "status": "ok",
  "database": "connected",
  "payments": {"cod": "enabled", "card": {"flag": "enabled", "stripe_configured": true}},
  "email": {"flag": "enabled", "mailer": "resend", "configured": true},
  "timestamp": "2026-01-22T23:17:47.229434Z",
  "version": "12.38.1"
}
```

### prod-facts.sh

```
✅ Backend Health: 200
✅ Products API: 200
✅ Products List Page: 200
✅ Product Detail Page: 200
✅ Login Page: 200
✅ ALL CHECKS PASSED
```

### perf-baseline.sh (key endpoints)

| Endpoint | Median TTFB |
|----------|-------------|
| `/` (homepage) | 183ms |
| `/products` | 180ms |
| `/api/v1/public/products` | 256ms |

All endpoints < 300ms threshold.

---

## Retry Configuration (Reference)

From `.github/workflows/deploy-frontend.yml`:

```yaml
env:
  SSH_RETRY_MAX: 3
  SSH_RETRY_DELAY_SECONDS: 10

- name: Deploy standalone to VPS (with retry)
  uses: nick-fields/retry@v3
  with:
    timeout_minutes: 5
    max_attempts: ${{ env.SSH_RETRY_MAX }}
    retry_wait_seconds: ${{ env.SSH_RETRY_DELAY_SECONDS }}
```

---

## Conclusion

**PASS**: SSH retry mechanism deployed and operational. Post-deploy proof verifies production health automatically.

---

_Proof-OPS-DEPLOY-SSH-RETRY-01 | Agent: Claude_
