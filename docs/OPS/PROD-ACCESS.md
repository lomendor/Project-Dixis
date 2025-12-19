# 🔐 PRODUCTION VPS ACCESS

**Last Updated**: 2025-12-17
**Purpose**: Canonical production server access documentation (NO SECRETS)

---

## 📋 CONNECTION DETAILS

```bash
Host:     147.93.126.235 (srv709397)
User:     deploy
Port:     22
Protocol: SSH (ed25519 key only)
```

---

## 🔑 SSH ACCESS

### Canonical SSH Command
```bash
ssh dixis-prod
```

**Host Alias Configuration** (`~/.ssh/config`):
```
Host dixis-prod
  HostName 147.93.126.235
  User deploy
  IdentityFile ~/.ssh/dixis_prod_ed25519
  IdentitiesOnly yes
  PreferredAuthentications publickey
```

### Access Policy
- ✅ **Primary**: GitHub Actions workflows (automated deployment)
- ⚠️ **Emergency only**: Interactive SSH (manual fixes)
- ❌ **Never**: Direct root access (root login disabled on server)

**SSH Key**: `dixis_prod_ed25519` (ed25519, stored in GitHub Secrets as `VPS_SSH_KEY`)
**SSH User**: `deploy` (only allowed user; root disabled)

---

## 🚀 DEPLOYED SERVICES

### PM2 Processes
```bash
pm2 list
# Expected processes:
# - dixis-backend   (Laravel API)
# - dixis-frontend  (Next.js production)
# - dixis-staging   (Next.js staging)
```

### Ports (Local)
```
8001  → Laravel backend (PHP 8.2 + artisan serve)
3000  → Next.js frontend (production)
3001  → Next.js staging
```

### Ports (Public)
```
80    → Nginx HTTP (redirects to 443)
443   → Nginx HTTPS
      ├─ /api/*     → proxy to 127.0.0.1:8001 (backend)
      ├─ /sanctum/* → proxy to 127.0.0.1:8001 (backend)
      └─ /*         → proxy to 127.0.0.1:3000 (frontend)
```

---

## 📂 DIRECTORY STRUCTURE

```
/var/www/dixis/
├── backend/              # Laravel 11 API
│   ├── .env             # Production secrets (NOT in repo)
│   ├── vendor/          # Composer dependencies
│   └── artisan          # Laravel CLI
├── frontend/            # Next.js 15 app
│   └── .env.production  # Frontend env (used as .env template)
└── current/             # Symlinks to active versions
```

---

## 🛠️ COMMON OPERATIONS

### Check Service Status
```bash
ssh dixis-prod "pm2 status && ss -lntp | grep -E ':(80|443|3000|8001)'"
```

### View Backend Logs
```bash
ssh dixis-prod "pm2 logs dixis-backend --lines 50"
```

### Restart Backend
```bash
ssh dixis-prod "pm2 restart dixis-backend"
```

### Test Endpoints
```bash
# Local (from VPS)
curl http://127.0.0.1:8001/api/health
curl http://127.0.0.1:3000/

# Public (from anywhere)
curl https://dixis.gr/api/health
curl https://dixis.gr/api/v1/public/products
```

---

## 🚨 EMERGENCY PROCEDURES

### Backend Down
```bash
# 1. Check PM2 status
pm2 status dixis-backend

# 2. View crash logs
pm2 logs dixis-backend --lines 100 --nostream

# 3. Common fixes:
# - Missing vendor/: composer install --no-dev
# - Missing .env: restore from /var/www/dixis/frontend/.env.production
# - Crash loop: check config/cors.php (avoid app()->environment())

# 4. Restart
pm2 restart dixis-backend
```

### Frontend Down
```bash
pm2 restart dixis-frontend
```

### Nginx Down
```bash
sudo systemctl status nginx
sudo systemctl start nginx
```

### Database Connection Issues
```bash
# Check .env database credentials
grep '^DB_' /var/www/dixis/backend/.env

# Test DB connection
cd /var/www/dixis/backend
php artisan tinker --execute="DB::connection()->getPdo();"
```

---

## ⚠️ SECURITY NOTES

1. **Never commit** `/var/www/dixis/backend/.env` to repo
2. **Single SSH key**: Use `dixis_prod_ed25519` only (no multiple keys)
3. **GitHub Secrets**: All prod credentials stored as secrets (see `SECRETS-MAP.md`)
4. **No password auth**: SSH key-based authentication only
5. **Firewall**: VPS firewall must allow GitHub Actions IPs for workflows

---

## 🔗 RELATED DOCS

- `docs/OPS/SECRETS-MAP.md` - Required GitHub Secrets
- `docs/OPS/BACKEND-REVIVE-QUICKREF.md` - Backend troubleshooting
- `.github/workflows/deploy-prod.yml` - Production deployment workflow

---

**Key Takeaway**: Prefer GitHub Actions workflows over manual SSH. Interactive SSH should only be used for emergency diagnostics.
