# SOP: VPS Deploy (dixis.gr)

**Last Updated**: 2026-02-14

## When to use
After merging PRs to `main` that need to go live on production.

## Prerequisites
- SSH alias: `dixis-prod` (configured in `~/.ssh/config`)
- SSH user: **`deploy`** (root login is disabled)
- SSH key: `~/.ssh/dixis_prod_ed25519_20260115`
- VPS IP: `147.93.126.235`
- Production URL: `https://dixis.gr`

---

## Preferred Method: Automated Script

```bash
bash scripts/prod-deploy-clean.sh
```

This handles everything: preflight, hard sync, clean install, build, PM2 restart, verification.

> **Note**: The script requires `https://dixis.gr` to be reachable from your network for preflight checks. If not reachable (e.g., DNS/CloudFlare issue), use Manual Method below.

---

## Manual Method (when script fails or network blocks public URL)

### 1. SSH into VPS
```bash
ssh dixis-prod
```

### 2. Fetch and hard reset to latest main
```bash
cd /var/www/dixis/current
git fetch origin main
git reset --hard origin/main
```

> **Why `reset --hard`?** Ensures exact match with GitHub. `git pull` can fail on conflicts or leave drift.

### 3. Check .env symlink is intact
```bash
ls -la frontend/.env
# Should show: frontend/.env -> /var/www/dixis/shared/frontend.env
```

If missing, restore:
```bash
ln -sfn /var/www/dixis/shared/frontend.env frontend/.env
```

### 4. Clean install and build frontend
```bash
cd frontend
rm -rf .next node_modules
pnpm install --frozen-lockfile
npx prisma generate
NODE_OPTIONS='--max-old-space-size=2048' pnpm build
```

### 5. Prepare standalone bundle
```bash
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

### 6. Restore .env in standalone
```bash
ln -sfn /var/www/dixis/shared/frontend.env .next/standalone/.env
```

### 7. Restart PM2
```bash
pm2 restart dixis-frontend --update-env
```

### 8. Verify
```bash
curl -sS http://127.0.0.1:3000/api/healthz
```
**Expected:** `{"status":"ok","env":"ok",...}`

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| SSH "Permission denied" | Using root (disabled) | Use `ssh dixis-prod` (user=deploy) |
| Site shows "DB offline" | `.env` symlink broken | `ln -sfn /var/www/dixis/shared/frontend.env frontend/.env` |
| `Module not found` during build | Stale node_modules | `rm -rf node_modules .next && pnpm install --frozen-lockfile` |
| OOM during build | Low VPS memory | `NODE_OPTIONS='--max-old-space-size=2048' pnpm build` |
| PM2 crash loop | Port 3000 in use | `fuser -k 3000/tcp && pm2 restart dixis-frontend` |
| Public URL unreachable | CloudFlare/DNS issue | Use `curl http://127.0.0.1:3000/api/healthz` from inside VPS |
| Script preflight fails | Can't reach dixis.gr | Use manual method above |

---

## Architecture Reference

```
CloudFlare (CDN/Proxy)
       |
nginx (proxy_pass)
  |-- /api/producer/* --> Next.js (port 3000)
  |-- /api/healthz    --> Next.js
  |-- /api/*          --> Laravel PHP-FPM
  |-- /*              --> Next.js (port 3000)
```

| Path | Value |
|------|-------|
| Frontend code | `/var/www/dixis/current/frontend/` |
| Shared .env | `/var/www/dixis/shared/frontend.env` |
| PM2 app name | `dixis-frontend` |
| PM2 logs | `pm2 logs dixis-frontend` |
| nginx config | `/etc/nginx/sites-enabled/dixis.gr` |

---

_Created: 2026-02-06 | Last updated: 2026-02-14 (deploy user, pnpm, prod-deploy-clean.sh)_
