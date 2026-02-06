# SOP: VPS Deploy (dixis.gr)

## When to use
After merging PRs to `main` that need to go live on production.

## Prerequisites
- SSH key: `~/.ssh/dixis_prod_ed25519_20260115`
- VPS IP: `147.93.126.235`
- Production URL: `https://dixis.gr`

---

## Procedure (copy/paste)

### 1. SSH into VPS
```bash
ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235
```

### 2. Backup frontend .env (CRITICAL)
```bash
cd /var/www/dixis/current
cp frontend/.env /tmp/frontend-env-backup 2>/dev/null || echo "No .env to backup"
```

> **Why?** The `.env` file contains DATABASE_URL and other critical config.
> It's correctly gitignored, but can be lost during deploy operations.
> Without it, the site falls back to demo mode ("DB offline").

### 3. Pull latest code
```bash
git pull origin main
```

### 4. Restore frontend files (CRITICAL)
```bash
git checkout -- frontend/
```

> **Why?** The `frontend/` directory is a symlink to `/var/www/dixis/current/frontend`.
> Many frontend files (tsconfig.json, next.config.ts, lib/*, components/*) get deleted
> from disk by an unknown mechanism (possibly an old deploy script).
> Without this step, `npm run build` will fail with missing module errors.
> This step is safe and idempotent — it restores git-tracked files to disk.

### 5. Restore .env if missing
```bash
if [ ! -f frontend/.env ]; then
  cp /tmp/frontend-env-backup frontend/.env 2>/dev/null || \
  cp /var/www/dixis/frontend-backup-*/standalone/.env frontend/.env
  echo "⚠️  .env was missing - restored from backup"
fi
```

### 6. Build frontend
```bash
cd frontend
npm run build
```

### 7. Restart process
```bash
pm2 restart dixis-frontend --update-env
```

### 8. Verify
```bash
curl -s https://dixis.gr/api/healthz | grep -o '"env":"[^"]*"'
```
**Expected:** `"env":"ok"`

If you see `"env":"missing"` or `missingEnv`, the .env was not restored properly.

---

## Quick one-liner (experienced use)
```bash
ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235 \
  "cd /var/www/dixis/current && cp frontend/.env /tmp/frontend-env-backup 2>/dev/null; git pull origin main && git checkout -- frontend/ && [ ! -f frontend/.env ] && cp /tmp/frontend-env-backup frontend/.env; cd frontend && npm run build && pm2 restart dixis-frontend --update-env && curl -s https://dixis.gr/api/healthz | grep -o '\"env\":\"[^\"]*\"'"
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Site shows "DB offline" / demo mode | Frontend `.env` deleted | Check `/api/healthz` for `missingEnv`, restore from `/tmp/frontend-env-backup` or `/var/www/dixis/frontend-backup-*/standalone/.env` |
| `Module not found` during build | Frontend files deleted | Run `git checkout -- frontend/` |
| `npm run build` OOM | Low VPS memory | `NODE_OPTIONS=--max-old-space-size=1536 npm run build` |
| Health check not 200 | pm2 not restarted | `pm2 restart dixis-frontend && pm2 logs dixis-frontend --lines 20` |
| Git pull conflicts | Local changes on VPS | `git stash && git pull origin main && git checkout -- frontend/` |

---

## Known issue: frontend file deletion
**Status**: Unresolved root cause (workaround in place)

The VPS has a mechanism (likely an old deploy script or cron) that deletes files from the
`frontend/` directory. The `git checkout -- frontend/` step is the reliable workaround.
If root cause is found, update this SOP accordingly.

---

_Created: 2026-02-06 | Last verified: 2026-02-06_
