#!/bin/bash
#
# Dixis Frontend Deploy Script
# ============================
# Usage: ./scripts/deploy.sh
#
# This script deploys the frontend to production VPS.
# It protects .env from being deleted by rsync.
#

set -e  # Exit on any error

# === Configuration ===
SERVER="root@147.93.126.235"
SSH_KEY="$HOME/.ssh/dixis_prod_ed25519_20260115"
REMOTE_DIR="/var/www/dixis/current/frontend"
SHARED_ENV="/var/www/dixis/shared/frontend.env"
LOCAL_FRONTEND="frontend/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Dixis Deploy Script ===${NC}"
echo ""

# === Pre-flight checks ===
echo -e "${YELLOW}[1/5] Pre-flight checks...${NC}"

# Check SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}ERROR: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

# Check frontend directory exists
if [ ! -d "$LOCAL_FRONTEND" ]; then
    echo -e "${RED}ERROR: Frontend directory not found. Run from repo root.${NC}"
    exit 1
fi

# Check if build exists
if [ ! -d "$LOCAL_FRONTEND/.next" ]; then
    echo -e "${RED}ERROR: No .next build found. Run 'npm run build' first.${NC}"
    exit 1
fi

echo -e "${GREEN}  Checks passed!${NC}"

# === rsync with exclusions ===
echo ""
echo -e "${YELLOW}[2/5] Syncing files to VPS...${NC}"
echo "  (Excluding: node_modules, .git, .env)"

rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='.env.local' \
    -e "ssh -i $SSH_KEY" \
    $LOCAL_FRONTEND $SERVER:$REMOTE_DIR/

echo -e "${GREEN}  Sync complete!${NC}"

# === Restore .env from shared ===
echo ""
echo -e "${YELLOW}[3/5] Restoring .env from shared...${NC}"

ssh -i $SSH_KEY $SERVER "cp $SHARED_ENV $REMOTE_DIR/.env"

echo -e "${GREEN}  .env restored!${NC}"

# === Restart PM2 ===
echo ""
echo -e "${YELLOW}[4/5] Restarting PM2...${NC}"

ssh -i $SSH_KEY $SERVER "cd $REMOTE_DIR && pm2 restart dixis-frontend --update-env"

echo -e "${GREEN}  PM2 restarted!${NC}"

# === Health check ===
echo ""
echo -e "${YELLOW}[5/5] Health check...${NC}"

sleep 3  # Wait for server to start

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://dixis.gr/api/healthz)

if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}  Health check passed! (HTTP $HEALTH)${NC}"
else
    echo -e "${RED}  WARNING: Health check returned HTTP $HEALTH${NC}"
fi

# === Done ===
echo ""
echo -e "${GREEN}=== Deploy Complete ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Test admin login: https://dixis.gr/auth/admin-login"
echo "  2. Check products: https://dixis.gr/admin/products"
echo ""
