# Production Monitoring

**Last Updated**: 2025-12-21

## Overview

Automated production endpoint monitoring via GitHub Actions scheduled workflow. Probes critical dixis.gr endpoints every 15 minutes to detect regressions early.

## What is Monitored

### 1. Health Check (`/api/healthz`)
- **URL**: `https://dixis.gr/api/healthz`
- **Expected**: HTTP 200
- **Purpose**: Verify backend Laravel API is responsive

### 2. API Products Endpoint (`/api/v1/public/products`)
- **URL**: `https://dixis.gr/api/v1/public/products`
- **Expected**: HTTP 200 + response contains `"data"` key
- **Purpose**: Verify public API returns product data

### 3. Products Page (`/products`)
- **URL**: `https://dixis.gr/products`
- **Expected**: HTTP 200
- **Purpose**: Verify frontend products listing page renders

### 4. Auth Redirects (`/login`, `/register`)
- **URL**: `https://dixis.gr/login` and `/register`
- **Expected**: HTTP 307 or 302 (redirect to `/auth/login` or `/auth/register`)
- **Purpose**: Verify auth routing works

### 5. Orders Page (`/orders`) - TODO
- **URL**: `https://dixis.gr/orders`
- **Current Behavior**: HTTP 404 (unauthenticated users)
- **Expected Behavior**: HTTP 307/302 (redirect to `/auth/login`) OR HTTP 200 (if public)
- **Status**: ⚠️ KNOWN ISSUE - Workflow logs this but does not fail
- **Fix Required**: Update `/orders` page to redirect unauthenticated users to login
- **Tracked In**: Pass 12 completion notes

## Schedule

- **Frequency**: Every 15 minutes
- **Cron**: `*/15 * * * *` (GitHub Actions syntax)
- **Workflow**: `.github/workflows/prod-smoke.yml`

## Manual Execution

### Via GitHub Actions UI
1. Go to: https://github.com/lomendor/Project-Dixis/actions/workflows/prod-smoke.yml
2. Click "Run workflow" dropdown
3. Select branch (usually `main`)
4. Click "Run workflow" button

### Via CLI
```bash
gh workflow run prod-smoke.yml
```

### Local Testing
Run the same checks locally:

```bash
# Quick smoke (anonymous)
echo "=== PROD SMOKE (anonymous) ==="
curl -sS -o /dev/null -w "healthz=%{http_code}\n" https://dixis.gr/api/healthz
curl -sS -o /dev/null -w "api_products=%{http_code}\n" https://dixis.gr/api/v1/public/products
curl -sS -o /dev/null -w "products_page=%{http_code}\n" https://dixis.gr/products
curl -sS -o /dev/null -w "login=%{http_code} redir=%{redirect_url}\n" https://dixis.gr/login
curl -sS -o /dev/null -w "register=%{http_code} redir=%{redirect_url}\n" https://dixis.gr/register
curl -sS -o /dev/null -w "orders=%{http_code} redir=%{redirect_url}\n" https://dixis.gr/orders
```

Expected output:
```
=== PROD SMOKE (anonymous) ===
healthz=200
api_products=200
products_page=200
login=307 redir=https://dixis.gr/auth/login
register=307 redir=https://dixis.gr/auth/register
orders=404  # TODO: should be 307
```

## What to Do on Failure

### 1. Check Workflow Run
- Go to: https://github.com/lomendor/Project-Dixis/actions/workflows/prod-smoke.yml
- Click on the failing run
- Expand failed step to see error details

### 2. Quick Local Verification
Run the curl commands above to reproduce the failure locally.

### 3. Check Recent Deployments
```bash
# List recent production deployments
gh run list --workflow=deploy-prod.yml --limit 5

# Check if recent PR broke something
gh pr list --state merged --limit 10
```

### 4. Investigate Root Cause
Common failure scenarios:

| Failure | Possible Causes | Quick Fix |
|---------|----------------|-----------|
| `healthz=000` | Backend down, VPS offline, DNS issue | SSH to VPS, check `pm2 status`, check nginx |
| `healthz=500` | Backend error, DB connection lost | Check Laravel logs: `ssh dixis-vps tail -f /var/www/dixis/current/backend/storage/logs/laravel.log` |
| `api_products=000` | Backend down | Same as healthz |
| `api_products=500` | DB query error, missing data | Check Laravel logs + DB |
| `products_page=000` | Frontend down, nginx misconfigured | Check `pm2 status`, check nginx config |
| `products_page=404` | Frontend routing broken | Check Next.js build, verify `(storefront)/products/page.tsx` exists |
| `login` not 307 | Middleware or routing change | Check frontend auth redirects |

### 5. Escalation
If the issue persists and affects users:
1. Create a GitHub Issue with the workflow run URL
2. Label it `priority:high` and `bug`
3. Notify the team
4. Consider rolling back recent deployments if needed

## Timeout & Retry Configuration

All checks use:
- **Connect timeout**: 10 seconds
- **Max time**: 20 seconds
- **Retries**: 3 attempts with 2-second delay between retries
- **Total timeout per check**: ~70 seconds worst case

This provides resilience against transient network issues while failing fast on real problems.

## Adding New Checks

To add a new endpoint to monitor:

1. Edit `.github/workflows/prod-smoke.yml`
2. Add a new step following the existing pattern:

```yaml
- name: Check PROD <endpoint-name>
  run: |
    echo "=== Checking <endpoint-name> ==="
    HTTP_CODE=$(curl --fail --retry 3 --retry-delay 2 \
      --connect-timeout 10 --max-time 20 \
      -sS -o /dev/null -w '%{http_code}' \
      https://dixis.gr/<path>)

    echo "<endpoint> HTTP code: $HTTP_CODE"

    if [ "$HTTP_CODE" != "<expected-code>" ]; then
      echo "❌ FAIL: <endpoint> returned $HTTP_CODE (expected <expected-code>)"
      exit 1
    fi

    echo "✅ PASS: <endpoint> check passed"
```

3. Update this document with the new check details
4. Create a PR with the changes

## Known Limitations

- **No authentication**: Checks only anonymous/public endpoints
- **No E2E flows**: Does not test full user journeys (cart → checkout → order)
- **No database writes**: Read-only checks to avoid side effects
- **GitHub Actions cron limitations**: Cron jobs can be delayed during high load (typically <15min delay)

For authenticated or complex flow testing, see:
- E2E tests: `frontend/tests/e2e/`
- Backend tests: `backend/tests/Feature/`

## History

- **2025-12-21** (Pass 12): Initial scheduled smoke monitoring created
  - Checks: healthz, api products, products page, auth redirects, orders page (with TODO)
  - Frequency: every 15 minutes
  - Known issue: `/orders` returns 404 (should redirect)

## References

- Workflow: `.github/workflows/prod-smoke.yml`
- Production endpoint verification: `docs/OPS/PROD-FACTS-LAST.md`
- VPS access: `docs/OPS/SSH-SETUP.md`
