# Dixis Production Credentials & Access

**⚠️ CONFIDENTIAL - DO NOT COMMIT TO GIT**

## VPS Access

### SSH Connection
- **Host**: `147.93.126.235` (dixis.gr)
- **User**: `root`
- **SSH Key**: `~/.ssh/dixis_prod_ed25519`

**Connection command**:
```bash
ssh -i ~/.ssh/dixis_prod_ed25519 root@147.93.126.235
```

### Application Paths
- **Frontend**: `/var/www/dixis/releases/20251105-201811/frontend`
- **Current symlink**: `/var/www/dixis/current/frontend`

### Service Management
**Note**: NOT using PM2! Direct Node.js process.

```bash
# Check running process
lsof -i :3000

# Kill server
pkill -9 -f "next-server"

# Start server
cd /var/www/dixis/releases/20251105-201811/frontend
NEXT_PUBLIC_BASE_URL=https://dixis.gr nohup pnpm start > /tmp/nextjs.log 2>&1 &

# View logs
tail -f /tmp/nextjs.log
```

---

## GitHub Secrets (lomendor/Project-Dixis)

### Required Secrets for Deployments
- **VPS_SSH_KEY**: Content of `~/.ssh/dixis_prod_ed25519`
- **VPS_USER**: `root`
- **VPS_HOST**: `147.93.126.235`
- **DATABASE_URL_PROD**: Neon PostgreSQL connection string (raw/unpooled)
- **RUNTIME_DATABASE_URL_PROD**: Neon pooled connection (optional)

### Update Command
```bash
# Update SSH key
gh secret set VPS_SSH_KEY -R lomendor/Project-Dixis < ~/.ssh/dixis_prod_ed25519

# Update user/host
gh secret set VPS_USER -R lomendor/Project-Dixis -b "root"
gh secret set VPS_HOST -R lomendor/Project-Dixis -b "147.93.126.235"
```

---

## Deployment Workflows

### Manual Deployment (SSH)
```bash
ssh -i ~/.ssh/dixis_prod_ed25519 root@147.93.126.235 'bash -s' <<'EOF'
cd /var/www/dixis/releases/20251105-201811/frontend

# Pull latest
git fetch origin && git checkout main && git reset --hard origin/main

# Install & build
pnpm install --frozen-lockfile
NEXT_PUBLIC_BASE_URL=https://dixis.gr pnpm run build

# Restart
pkill -9 -f "next-server"
NEXT_PUBLIC_BASE_URL=https://dixis.gr nohup pnpm start > /tmp/nextjs.log 2>&1 &

# Verify
sleep 5
curl -s https://dixis.gr/api/products | jq '{source, count: (.items|length)}'
EOF
```

### GitHub Actions Deployment
```bash
# Trigger deployment workflow
gh workflow run "deploy-prod (dixis.gr)" --repo lomendor/Project-Dixis --ref main

# Watch deployment
RUN_ID=$(gh run list -R lomendor/Project-Dixis --workflow="deploy-prod (dixis.gr)" --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch $RUN_ID -R lomendor/Project-Dixis --interval 5
```

---

## Health Checks

### API Endpoints
```bash
# Products API (should return source:"demo", count:8)
curl -s https://dixis.gr/api/products | jq '{source, count: (.items|length)}'

# Demo feed
curl -s https://dixis.gr/api/demo-products | jq '.items | length'

# Health endpoint
curl -sI https://dixis.gr/api/healthz
```

### Expected Responses
```json
// /api/products (demo mode)
{
  "source": "demo",
  "count": 8
}

// /api/products (DB mode - when activated)
{
  "source": "db",
  "count": <varies>
}
```

---

## Neon DB Integration (AG116.16)

### Current Status
✅ **Code deployed**: PR #915 merged
✅ **Fallback working**: Demo feed active (8 items)
⏸️ **DB mode**: NOT activated (no USE_DB_PRODUCTS flag)

### To Activate DB Mode
1. **Set environment variables** on VPS:
   ```bash
   export USE_DB_PRODUCTS=1
   export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
   ```

2. **Restart with env**:
   ```bash
   pkill -9 -f "next-server"
   USE_DB_PRODUCTS=1 DATABASE_URL="..." nohup pnpm start > /tmp/nextjs.log 2>&1 &
   ```

3. **Verify**:
   ```bash
   curl -s https://dixis.gr/api/products | jq '.source'
   # Should return: "db"
   ```

---

## Troubleshooting

### Build Errors
**Issue**: Prisma conflict between .env and prisma/.env
**Fix**: Remove conflicting files before build
```bash
rm -f .env .env.production prisma/.env
pnpm run build
```

### Port 3000 In Use
```bash
# Find PID
PID=$(lsof -ti :3000)
# Kill
kill -9 $PID
```

### Git Ownership Errors
```bash
git config --global --add safe.directory /var/www/dixis/releases/20251105-201811
```

---

## SSH Keys Inventory

Available keys in `~/.ssh/`:
- `dixis_prod_ed25519` ✅ **WORKING** (root@147.93.126.235)
- `dixis_staging`
- `dixis_deploy_key`
- `dixis_github_deploy`
- `dixis_vps_key`
- `dixis_new_key`
- `hostinger_dixis_key`
- `hostinger_dixis_rsa`

---

**Last Updated**: 2025-11-20
**PR**: #915 (AG116.16: Neon DB integration with safe fallback)
**Status**: ✅ Production deployment successful
