#!/bin/bash
#
# safe-frontend-deploy.sh
# Safe Next.js frontend deployment with backup, verification, and auto-rollback
#
# Usage: ./scripts/safe-frontend-deploy.sh
# Run from VPS at /var/www/dixis/current/frontend or specify FRONTEND_DIR
#

set -e

FRONTEND_DIR="${FRONTEND_DIR:-/var/www/dixis/current/frontend}"
BACKUP_DIR="/var/www/dixis/frontend-backup-$(date +%Y%m%d-%H%M%S)"

echo "=== STEP 1: Backup current working build ==="
if [ -d "$FRONTEND_DIR/.next" ]; then
  cp -r "$FRONTEND_DIR/.next" "$BACKUP_DIR"
  echo "Backed up to $BACKUP_DIR"
else
  echo "No existing .next directory - fresh build"
fi

echo ""
echo "=== STEP 2: Clean and rebuild ==="
cd "$FRONTEND_DIR"

# Remove old build artifacts (keep node_modules)
rm -rf .next

# Build with production env vars (already in .env)
echo "Running pnpm build..."
pnpm build 2>&1

echo ""
echo "=== STEP 3: Verify build artifacts ==="
ERRORS=""

if [ ! -f ".next/standalone/server.js" ]; then
    ERRORS="$ERRORS\n- Missing .next/standalone/server.js"
fi

if [ ! -d ".next/static" ]; then
    ERRORS="$ERRORS\n- Missing .next/static directory"
fi

if [ ! -d ".next/standalone/.next/static" ]; then
    echo "Copying static files to standalone..."
    cp -r .next/static .next/standalone/.next/
fi

# Check static files are in place
if [ ! -d ".next/standalone/.next/static" ]; then
    ERRORS="$ERRORS\n- Missing standalone static files"
fi

# Check public folder
if [ -d "public" ] && [ ! -d ".next/standalone/public" ]; then
    echo "Copying public folder to standalone..."
    cp -r public .next/standalone/
fi

if [ -n "$ERRORS" ]; then
    echo "BUILD VERIFICATION FAILED:"
    echo -e "$ERRORS"
    echo ""
    if [ -d "$BACKUP_DIR" ]; then
        echo "Rolling back to backup..."
        rm -rf .next
        cp -r "$BACKUP_DIR" .next
        echo "Rollback complete. Build failed."
    fi
    exit 1
fi

echo "Build verification PASSED"

echo ""
echo "=== STEP 4: Restart PM2 ==="
pm2 restart dixis-frontend || pm2 start .next/standalone/server.js --name dixis-frontend

echo ""
echo "=== STEP 5: Health check ==="
sleep 5
HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo "HEALTH CHECK FAILED (HTTP $HTTP_CODE)"
    if [ -d "$BACKUP_DIR" ]; then
        echo "Rolling back..."
        rm -rf .next
        cp -r "$BACKUP_DIR" .next
        pm2 restart dixis-frontend
        echo "Rollback complete."
    fi
    exit 1
fi

echo "Health check PASSED (HTTP $HTTP_CODE)"

echo ""
echo "=== DEPLOY SUCCESS ==="
echo "Backup kept at: $BACKUP_DIR"
echo "You can remove it after verifying everything works:"
echo "  rm -rf $BACKUP_DIR"
