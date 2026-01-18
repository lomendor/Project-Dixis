# Pass OPS-VERIFY-01: Deploy Verification Proof Standard

**Date**: 2026-01-14
**Status**: COMPLETE

## What

Establish a curl-based deploy verification standard for the frontend deployment workflow. Remove all `sudo` commands since the `deploy` user lacks passwordless sudo access.

## Why

1. **Deploy failures**: The deploy workflow was failing with "sudo: password required" because `sudo ss -lntp` requires passwordless sudo
2. **No sudo access**: The `deploy` user is intentionally configured without passwordless sudo for security
3. **Need for proof standard**: Post-deploy verification must prove the app is healthy without elevated privileges

## How

### 1. Remove sudo from workflow (PR #2195)

Replaced `sudo ss -lntp` with curl-based port listener check:

```bash
# Before (broken)
sudo ss -lntp | grep :3000

# After (works)
curl -s --max-time 3 http://127.0.0.1:3000/ > /dev/null || { echo "FAIL: NO_LISTENER_3000"; exit 1; }
```

### 2. Document verification standard (PR #2197)

Created `docs/OPS/DEPLOY-VERIFY-PROOF.md` with:
- 3-point verification proof (port, health, deep health)
- OPS-PM2-01 20x curl stability proof
- Troubleshooting with non-sudo options

## Verification

- PR #2195 merged: Deploy workflow no longer uses sudo
- PR #2197 merged: Documentation complete
- Deploy workflow succeeds without permission errors

## PRs

| PR | Title | Status |
|----|-------|--------|
| #2195 | fix: remove sudo from deploy verify | MERGED |
| #2197 | docs: deploy verification proof standard | MERGED |

## Files Changed

- `.github/workflows/deploy-frontend.yml` — Line 253 updated
- `docs/OPS/DEPLOY-VERIFY-PROOF.md` — New file (104 lines)
