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

### 2. Pull latest code
```bash
cd /var/www/dixis/current
git pull origin main
```

### 3. Restore frontend files (CRITICAL)
```bash
git checkout -- frontend/
```

> **Why?** The `frontend/` directory is a symlink to `/var/www/dixis/current/frontend`.
> Many frontend files (tsconfig.json, next.config.ts, lib/*, components/*) get deleted
> from disk by an unknown mechanism (possibly an old deploy script).
> Without this step, `npm run build` will fail with missing module errors.
> This step is safe and idempotent — it restores git-tracked files to disk.

### 4. Build frontend
```bash
cd frontend
npm run build
```

### 5. Restart process
```bash
pm2 restart dixis-frontend
```

### 6. Verify
```bash
curl -sI https://dixis.gr/api/healthz
```
**Expected:** `HTTP/2 200`

---

## Quick one-liner (experienced use)
```bash
ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235 \
  "cd /var/www/dixis/current && git pull origin main && git checkout -- frontend/ && cd frontend && npm run build && pm2 restart dixis-frontend && curl -sI https://dixis.gr/api/healthz | head -1"
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
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
