# VPS Frontend Deploy Runbook

**Last Updated**: 2026-02-02
**Owner**: DevOps / Platform Team

## Overview

This runbook documents the VPS frontend deployment architecture and troubleshooting procedures.

## Architecture

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN/Proxy)   │
                    └────────┬────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                         VPS (nginx)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  location ^~ /api/producer/  → proxy_pass 127.0.0.1:3000│   │
│  │  location ^~ /api/healthz    → proxy_pass 127.0.0.1:3000│   │
│  │  location ^~ /api/health     → proxy_pass 127.0.0.1:3000│   │
│  │  location /api               → fastcgi (Laravel PHP-FPM)│   │
│  │  location /                  → proxy_pass 127.0.0.1:3000│   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                   │
│            ┌────────────────┼────────────────┐                 │
│            ▼                                  ▼                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Next.js (PM2)  │              │  Laravel (PHP-FPM)│        │
│  │   Port 3000      │              │  Unix Socket      │        │
│  └──────────────────┘              └──────────────────┘        │
└────────────────────────────────────────────────────────────────┘
```

## Paths & Files

| Component | Path |
|-----------|------|
| Frontend code | `/var/www/dixis/current/frontend/` |
| Frontend server | `/var/www/dixis/current/frontend/server.js` |
| Env source (shared) | `/var/www/dixis/shared/frontend.env` |
| Env symlink target | `/var/www/dixis/current/frontend/.env` |
| nginx config | `/etc/nginx/sites-enabled/dixis.gr` |
| PM2 ecosystem | `/var/www/dixis/ecosystem.config.js` |
| PM2 logs | `/root/.pm2/logs/dixis-frontend-*.log` |

## Environment Variables

The frontend requires these env vars (source: `/var/www/dixis/shared/frontend.env`):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe public key for payments |
| `NEXT_PUBLIC_API_BASE` | Yes | Base URL for API calls |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Yes | Server port (default: 3000) |

## nginx Configuration

The following location blocks **MUST** exist to route Next.js API routes correctly:

```nginx
# === FRONTEND API ROUTES (Next.js) ===
# These specific API routes are handled by Next.js, not Laravel
location ^~ /api/producer/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ^~ /api/healthz {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ^~ /api/health {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**IMPORTANT**: These blocks MUST appear BEFORE the general `/api` block that routes to Laravel.

## Verification Commands

### 1. Check .env symlink
```bash
ls -la /var/www/dixis/current/frontend/.env
# Expected: lrwxrwxrwx ... .env -> /var/www/dixis/shared/frontend.env
```

### 2. Verify env vars
```bash
grep -E "^[A-Z_]+=" /var/www/dixis/current/frontend/.env | cut -d= -f1
# Expected: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_API_BASE, etc.
```

### 3. Check nginx config
```bash
grep -q "api/producer" /etc/nginx/sites-enabled/dixis.gr && echo "OK" || echo "MISSING!"
```

### 4. PM2 status
```bash
pm2 list | grep dixis-frontend
# Expected: status = online, restarts = 0 (or low)
```

### 5. Port 3000 listener
```bash
ss -tulpn | grep :3000
# Expected: LISTEN ... users:(("node",pid=XXXX,fd=XX))
```

### 6. Health check
```bash
curl -sS https://dixis.gr/api/healthz
# Expected: {"status":"ok",...}
```

### 7. Security check (API auth)
```bash
curl -sS -X POST https://dixis.gr/api/producer/orders/test/status \
  -H "Content-Type: application/json" -d '{"status":"shipped"}'
# Expected: {"error":"..."} with HTTP 401 (NOT Laravel HTML 404)
```

## Troubleshooting

### Deploy fails: ".env file not found"

**Cause**: rsync `--delete` removed the .env symlink

**Fix**:
```bash
ssh dixis-prod 'ln -sfn /var/www/dixis/shared/frontend.env /var/www/dixis/current/frontend/.env'
```

### API returns Laravel 404 HTML instead of JSON

**Cause**: nginx routing missing `/api/producer/*` block

**Fix**:
1. SSH to VPS
2. Edit `/etc/nginx/sites-enabled/dixis.gr`
3. Add the location blocks from "nginx Configuration" section above
4. Test: `nginx -t`
5. Reload: `systemctl reload nginx`

### PM2 crash loop (EADDRINUSE port 3000)

**Cause**: Orphan process holding port 3000

**Fix**:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
fuser -k 3000/tcp

# Restart pm2
pm2 delete all
pm2 start /var/www/dixis/ecosystem.config.js
```

### PM2 not starting

**Fix**:
```bash
# Check server.js exists
ls -la /var/www/dixis/current/frontend/server.js

# Check logs
pm2 logs dixis-frontend --err --lines 50

# Manual start for debugging
cd /var/www/dixis/current/frontend
NODE_ENV=production PORT=3000 node server.js
```

## Deployment Workflow

The GitHub Actions workflow (`deploy-frontend.yml`) performs:

1. Build Next.js with standalone output
2. **Precheck**: Verify `.env` exists on VPS
3. **Prepare**: Fix permissions
4. **Deploy**: rsync standalone bundle to VPS
5. **Symlink**: Recreate `.env` symlink (new in OPS-DEPLOY-GUARD-01)
6. **nginx check**: Verify routing config (new in OPS-DEPLOY-GUARD-01)
7. **Configure**: Update env vars, restart pm2
8. **Health check**: Verify 20x requests pass
9. **Smoke tests**: Verify homepage and API auth

## Emergency Rollback

If deploy breaks production:

```bash
# 1. SSH to VPS
ssh dixis-prod

# 2. Check recent deploys (pm2 logs)
pm2 logs dixis-frontend --lines 100

# 3. If needed, restore from backup
# (Future: implement git-based rollback)

# 4. Restart pm2
pm2 restart dixis-frontend
```

## Related Documentation

- [Pass-OPS-DEPLOY-GUARD-01](../AGENT/TASKS/Pass-OPS-DEPLOY-GUARD-01.md)
- [P0-SEC-01 Security Fix](../../frontend/tests/e2e/api-producer-order-status-auth.spec.ts)
