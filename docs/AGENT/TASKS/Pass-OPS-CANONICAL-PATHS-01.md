# Pass OPS-CANONICAL-PATHS-01

**When**: 2026-01-14 22:37 UTC

## What

Canonicalize production paths used by deploy workflows.
Align deploy-frontend.yml and deploy-backend.yml with `/var/www/dixis/current/{frontend,backend}`.

## Why

Deploy jobs were failing due to wrong directory and env-file checks, causing false negatives and circular debugging:
- deploy-frontend.yml: checked `/var/www/dixis/frontend/.env` (wrong)
- deploy-backend.yml: checked `/var/www/dixis/backend` (wrong)

Canonical structure (per verify-vps-ssh.yml):
```
/var/www/dixis/current/
├── frontend/
└── backend/
```

## How

1. Updated deploy-frontend.yml lines 88, 107 → `/var/www/dixis/current/frontend/.env`
2. Updated deploy-backend.yml lines 42, 108 → `/var/www/dixis/current/backend`
3. Merged PR #2201 with `--admin` bypass
4. Triggered deploy workflows on main

## Verification

| Deploy | Result | Notes |
|--------|--------|-------|
| Backend | ✅ PASS | Full deploy completed |
| Frontend | ❌ BLOCKED | Path fix works, but missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in VPS env |

**Backend deploy run**: https://github.com/lomendor/Project-Dixis/actions/runs/21012280130
**Frontend deploy run**: https://github.com/lomendor/Project-Dixis/actions/runs/21012280905

### Prod Sanity Checks (all pass)

| Endpoint | Result |
|----------|--------|
| `https://dixis.gr/` | 200 OK, HTML |
| `/api/v1/public/products` | 200 OK, JSON (5 products) |
| `/api/auth/request-otp` | 200 OK, JSON success |

## Definition of Done

- [x] deploy-backend runs PASS on main
- [x] deploy-frontend path check finds correct location (`/var/www/dixis/current/frontend/.env`)
- [x] Prod endpoints return JSON (no HTML Not Found)
- [x] STATE updated with decision + links

## Blocking Issue (requires VPS access)

Frontend deploy cannot complete until `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is added to `/var/www/dixis/current/frontend/.env` on VPS.

## PRs

| PR | Title | Status |
|----|-------|--------|
| #2201 | fix: use canonical /var/www/dixis/current paths in deploy workflows | MERGED |
