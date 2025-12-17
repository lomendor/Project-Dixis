# 🔐 GITHUB SECRETS MAP

**Last Updated**: 2025-12-17
**Purpose**: Required GitHub Secrets for production deployment (NO ACTUAL VALUES)

---

## 📋 REQUIRED SECRETS

### VPS SSH Access

| Secret Name | Type | Used By | Description |
|-------------|------|---------|-------------|
| `VPS_SSH_KEY` | SSH Private Key (ed25519) | All VPS workflows | Private key matching `dixis_prod_ed25519.pub` on VPS `/home/deploy/.ssh/authorized_keys` |
| `VPS_HOST` | String | All VPS workflows | VPS IP address: `147.93.126.235` |
| `VPS_USER` | String | All VPS workflows | SSH user: `deploy` |
| `KNOWN_HOSTS` | String (optional) | All VPS workflows | SSH known_hosts entry for VPS (fallback: auto-scan) |

---

## 🔧 BACKEND SECRETS

| Secret Name | Type | Used By | Description |
|-------------|------|---------|-------------|
| `BACKEND_ENV_PRODUCTION` | Multi-line String | `deploy-backend.yml` | Complete Laravel `.env` file content for production |
| `APP_KEY` | String | Backend deploy | Laravel encryption key (generate: `php artisan key:generate --show`) |
| `DB_HOST` | String | Backend deploy | Neon PostgreSQL host |
| `DB_PORT` | String | Backend deploy | PostgreSQL port (default: `5432`) |
| `DB_DATABASE` | String | Backend deploy | Database name: `dixis_prod` |
| `DB_USERNAME` | String | Backend deploy | Database user |
| `DB_PASSWORD` | String | Backend deploy | Database password |

---

## 🎨 FRONTEND SECRETS

| Secret Name | Type | Used By | Description |
|-------------|------|---------|-------------|
| `FRONTEND_ENV_PRODUCTION` | Multi-line String | `deploy-frontend.yml` | Complete Next.js `.env.production` file |
| `NEXT_PUBLIC_API_BASE_URL` | String | Frontend deploy | Backend API URL: `https://dixis.gr/api/v1` |
| `NEXT_PUBLIC_APP_URL` | String | Frontend deploy | Frontend URL: `https://dixis.gr` |
| `NEXT_PUBLIC_SITE_URL` | String | Frontend deploy | Site canonical URL: `https://dixis.gr` |

---

## 🔗 CORS & SESSION SECRETS

| Secret Name | Type | Used By | Description |
|-------------|------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | String (comma-separated) | Backend | Allowed origins: `https://dixis.gr,https://www.dixis.gr` |
| `SANCTUM_STATEFUL_DOMAINS` | String (comma-separated) | Backend | Stateful domains: `dixis.gr,www.dixis.gr` |
| `SESSION_DOMAIN` | String | Backend | Cookie domain: `.dixis.gr` |

---

## 📝 HOW TO ADD SECRETS

### Via GitHub CLI
```bash
# Single secret
gh secret set VPS_HOST --body "147.93.126.235"

# From file
gh secret set VPS_SSH_KEY < ~/.ssh/dixis_prod_ed25519

# Multi-line (e.g., .env file)
gh secret set BACKEND_ENV_PRODUCTION < /path/to/production.env
```

### Via GitHub Web UI
1. Go to: `https://github.com/lomendor/Project-Dixis/settings/secrets/actions`
2. Click "New repository secret"
3. Enter name and value
4. Click "Add secret"

---

## ✅ VERIFICATION

Check all secrets are set:
```bash
gh secret list
```

Expected output should include:
```
VPS_SSH_KEY              Updated 2025-12-17
VPS_HOST                 Updated 2025-12-17
VPS_USER                 Updated 2025-12-17
APP_KEY                  Updated 2025-12-17
DB_HOST                  Updated 2025-12-17
DB_PASSWORD              Updated 2025-12-17
...
```

---

## 🚨 SECURITY POLICY

1. **Never commit** secrets to repo (even in `.env.example`)
2. **Rotate keys** if exposed (regenerate SSH key, Laravel APP_KEY, DB password)
3. **Limit access**: Only repo admins should manage secrets
4. **Audit regularly**: Review secret usage in workflow runs
5. **Use environment-specific**: Separate secrets for staging vs production

---

## 🔗 RELATED DOCS

- `docs/OPS/PROD-ACCESS.md` - VPS connection details
- `.github/workflows/deploy-backend.yml` - Backend deployment (uses secrets)
- `.github/workflows/vps-backend-env-fix.yml` - Emergency backend fix workflow

---

**Key Takeaway**: All production credentials live in GitHub Secrets. No secrets in repo files. No manual secret management on VPS.
