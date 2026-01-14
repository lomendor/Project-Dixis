# Pass OPS-VERIFY-01 Summary

**Date**: 2026-01-14
**Duration**: ~30 minutes
**Result**: SUCCESS

## TL;DR

Deploy workflow was failing because `sudo ss -lntp` requires passwordless sudo, which the `deploy` user doesn't have. Fixed by replacing with curl-based checks. Documented the 3-point verification proof standard.

## Problem

```
sudo: a password is required
```

The `deploy` user is intentionally configured without passwordless sudo for security. The deploy workflow used `sudo ss -lntp` to check if port 3000 was listening.

## Solution

1. **PR #2195**: Replace `sudo ss -lntp` with `curl -s http://127.0.0.1:3000/`
2. **PR #2197**: Document verification standard in `docs/OPS/DEPLOY-VERIFY-PROOF.md`

## Verification Standard (3-Point Proof)

| Check | Command | Success |
|-------|---------|---------|
| Port listener | `curl -s http://127.0.0.1:3000/` | 0 exit code |
| Health endpoint | `curl /api/healthz` | `"status":"ok"` |
| Deep health | `curl /api/healthz?deep=1` | `"db":"connected"` |

Plus OPS-PM2-01: 20x consecutive curl requests must all return 200/204.

## Decision

**No sudo in deploy verify** — All post-deploy checks use curl-based proofs that run as the unprivileged `deploy` user.

## Links

- PR #2195: https://github.com/lomendor/Project-Dixis/pull/2195
- PR #2197: https://github.com/lomendor/Project-Dixis/pull/2197
- Docs: `docs/OPS/DEPLOY-VERIFY-PROOF.md`
- STATE: `docs/OPS/STATE.md` (updated)
