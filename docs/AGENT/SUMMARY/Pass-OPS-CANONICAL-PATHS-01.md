# Pass OPS-CANONICAL-PATHS-01 - Summary

**Date**: 2026-01-14
**Duration**: ~15 minutes
**Result**: PARTIAL SUCCESS (backend deploy OK, frontend blocked by missing env var)

## TL;DR

Fixed deploy workflow path checks to match canonical prod structure: `/var/www/dixis/current/{frontend,backend}`. Backend deploy passes. Frontend deploy correctly finds the env file but is blocked by missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Problem

Deploy workflows used inconsistent paths:
- Frontend: `/var/www/dixis/frontend/` → should be `/var/www/dixis/current/frontend/`
- Backend: `/var/www/dixis/backend` → should be `/var/www/dixis/current/backend`

## Solution

PR #2201: Updated 4 path references across both deploy workflows.

## Proof

| Item | Link |
|------|------|
| Backend deploy | https://github.com/lomendor/Project-Dixis/actions/runs/21012280130 |
| Frontend deploy | https://github.com/lomendor/Project-Dixis/actions/runs/21012280905 |
| PR #2201 | https://github.com/lomendor/Project-Dixis/pull/2201 |

## Prod Sanity (all pass)

```bash
curl -sI https://dixis.gr/                    # 200 OK
curl -s https://dixis.gr/api/v1/public/products  # 200 OK, JSON
curl -s -X POST 'https://dixis.gr/api/auth/request-otp' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+306999999999"}'               # 200 OK, success
```

## Decisions

- Canonical prod root is `/var/www/dixis/current/`
- Deploy verification should validate the canonical paths, not legacy ones

## Next Steps (requires VPS access)

Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `/var/www/dixis/current/frontend/.env` to unblock frontend deploys.
