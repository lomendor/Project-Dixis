# Frontend Deployment Guide (DEPRECATED)

> **⚠️ DEPRECATED** — Do NOT follow this guide. Use instead:
> - **Automated**: `bash scripts/prod-deploy-clean.sh`
> - **Manual**: [`docs/AGENT/SOPs/SOP-VPS-DEPLOY.md`](../AGENT/SOPs/SOP-VPS-DEPLOY.md)
> - **SSH config**: [`docs/AGENT/SYSTEM/ssh-access.md`](../AGENT/SYSTEM/ssh-access.md)
>
> **Key change (2026-02-14)**: Root login DISABLED. User is now `deploy`. Use `ssh dixis-prod`.

**Last Updated**: 2026-02-14 (deprecated)

## Quick Reference (OUTDATED — see SOP-VPS-DEPLOY.md)

```bash
# SSH to VPS (CURRENT — use alias)
ssh dixis-prod

# Old command (BROKEN — root login disabled):
# ssh -i ~/.ssh/dixis_prod_ed25519 root@147.93.126.235
```

## Safe Deploy Script

Location: `scripts/safe-frontend-deploy.sh`

The script performs a 5-step deployment with automatic rollback:

1. **Backup** - Copies current `.next` to timestamped backup
2. **Clean Build** - Removes old artifacts, runs `pnpm build`
3. **Verify** - Checks for `standalone/server.js`, static files
4. **Restart** - PM2 restart with fallback to fresh start
5. **Health Check** - Verifies HTTP 200 on localhost:3000

If any step fails, the script rolls back to the backup automatically.

## Environment Variables

These must be set in VPS `.env` BEFORE building (they're baked into the Next.js bundle):

```bash
# Required for production
NEXT_PUBLIC_API_BASE_URL=https://dixis.gr/api/v1
NEXT_PUBLIC_APP_URL=https://dixis.gr
NEXT_PUBLIC_SITE_URL=https://dixis.gr

# Feature flags
NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true  # Enable card payments
NEXT_PUBLIC_PAYMENT_PROVIDER=stripe  # stripe or viva
```

## Common Issues

### Build on Mac → Deploy to VPS = BROKEN

**Never rsync a local Mac build to VPS.** Mac builds have embedded paths that don't work on Linux.

**Correct approach**: Always build on VPS:
```bash
ssh dixis-vps
cd /var/www/dixis/current/frontend
./scripts/safe-frontend-deploy.sh
```

### PM2 Not Restarting

If PM2 shows errors after deploy:
```bash
pm2 logs dixis-frontend --lines 50
pm2 delete dixis-frontend
pm2 start .next/standalone/server.js --name dixis-frontend
pm2 save
```

### Missing Static Files

The standalone build needs static files copied manually:
```bash
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

The deploy script handles this automatically.

## Rollback

If production breaks after deploy:

```bash
# Find most recent backup
ls -la /var/www/dixis/frontend-backup-*

# Restore
rm -rf .next
cp -r /var/www/dixis/frontend-backup-YYYYMMDD-HHMMSS .next
pm2 restart dixis-frontend
```

## Verification Commands

```bash
# Local health check
curl -sS http://127.0.0.1:3000/ -o /dev/null -w "%{http_code}"

# External health check
curl -sS https://dixis.gr/api/healthz

# PM2 status
pm2 status

# Check card payments visible
curl -sS https://dixis.gr/checkout | grep -o 'payment-card'
```

## Deploy History

| Date | Change | Result |
|------|--------|--------|
| 2025-01-03 | Fixed Mac build artifacts issue, enabled card flag | ✅ Card payments visible |
| 2025-01-02 | VPS rebuild with safe-frontend-deploy.sh | ✅ Production stable |
