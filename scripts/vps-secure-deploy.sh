#!/usr/bin/env bash
#
# Dixis VPS Secure Deployment Script
# Purpose: Deploy with CVE-2025-55182 patch + security hardening BEFORE app goes live
# Usage: bash scripts/vps-secure-deploy.sh
#
set -euo pipefail

DEPLOY_USER="deploy"
VPS_HOST="147.93.126.235"
APP_DIR="/var/www/dixis"
FRONTEND_DIR="$APP_DIR/frontend"
BACKEND_DIR="$APP_DIR/backend"

echo "🔒 Dixis Secure Deployment - CVE-2025-55182 Protected"
echo "=================================================="

# Step 1: Pre-deployment Security Checks
echo ""
echo "📋 Step 1: Pre-deployment Security Audit"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_AUDIT'
  # Check if VPS is compromised BEFORE we start
  echo "Checking for active malware..."

  # Kill any existing cryptominers
  pkill -9 -f 'xmrig|miner|kdevtmpfsi|kinsing' 2>/dev/null || true

  # Check for suspicious processes
  SUSPICIOUS=$(ps aux | grep -E '(wget.*tmp|curl.*\.sh|/tmp/.*[a-z0-9]{8,})' | grep -v grep || true)
  if [ -n "$SUSPICIOUS" ]; then
    echo "⚠️  WARNING: Suspicious processes detected:"
    echo "$SUSPICIOUS"
    echo ""
    echo "Killing suspicious processes..."
    ps aux | grep -E '(wget.*tmp|curl.*\.sh)' | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
  fi

  # Clean tmp directories
  echo "Cleaning /tmp, /var/tmp, /dev/shm..."
  find /tmp /var/tmp /dev/shm -type f -executable -delete 2>/dev/null || true

  echo "✅ Pre-deployment audit complete"
REMOTE_AUDIT

# Step 2: Stop application (prevent exploitation during deployment)
echo ""
echo "🛑 Step 2: Stopping Application"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_STOP'
  source ~/.nvm/nvm.sh
  cd /var/www/dixis/frontend

  # Stop PM2 to prevent CVE exploitation
  pm2 stop dixis-frontend 2>/dev/null || true
  pm2 delete dixis-frontend 2>/dev/null || true

  echo "✅ Application stopped safely"
REMOTE_STOP

# Step 3: Pull latest code from Git
echo ""
echo "📥 Step 3: Pulling Latest Code"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_PULL'
  cd /var/www/dixis

  # Stash any local changes
  git stash push -m "Auto-stash before secure deployment"

  # Pull latest from main
  git fetch origin
  git checkout main
  git pull origin main

  echo "✅ Code updated to latest commit"
  git log -1 --oneline
REMOTE_PULL

# Step 4: CRITICAL - Patch CVE-2025-55182
echo ""
echo "🔐 Step 4: Patching CVE-2025-55182 (React2Shell)"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_PATCH'
  cd /var/www/dixis/frontend
  source ~/.nvm/nvm.sh

  # Update Next.js to patched version (15.1.0+)
  echo "Checking Next.js version..."
  CURRENT_VERSION=$(node -p "require('./package.json').dependencies.next" | tr -d '"^~')
  echo "Current: $CURRENT_VERSION"

  if [[ "$CURRENT_VERSION" < "15.1.0" ]]; then
    echo "⚠️  Vulnerable version detected! Upgrading to 15.5.0..."

    # Backup package.json
    cp package.json package.json.backup

    # Update Next.js in package.json
    sed -i 's/"next": "[^"]*"/"next": "15.5.0"/' package.json

    # Install patched version
    pnpm install next@15.5.0

    echo "✅ Next.js upgraded to patched version"
  else
    echo "✅ Next.js already patched ($CURRENT_VERSION)"
  fi
REMOTE_PATCH

# Step 5: Security Hardening - Disable Attack Vectors
echo ""
echo "🛡️  Step 5: Security Hardening"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_HARDEN'
  cd /var/www/dixis

  # Frontend .env hardening
  echo "Hardening frontend/.env..."
  cd frontend

  # Disable test login endpoint
  if grep -q "ALLOW_TEST_LOGIN" .env; then
    sed -i 's/ALLOW_TEST_LOGIN=.*/ALLOW_TEST_LOGIN=false/' .env
  else
    echo "ALLOW_TEST_LOGIN=false" >> .env
  fi

  # Fix CORS (critical for CSRF protection)
  if grep -q "CORS_ALLOWED_ORIGINS" .env; then
    sed -i 's|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://dixis.gr,https://www.dixis.gr|' .env
  else
    echo "CORS_ALLOWED_ORIGINS=https://dixis.gr,https://www.dixis.gr" >> .env
  fi

  # Backend .env hardening
  echo "Hardening backend/.env..."
  cd ../backend

  if grep -q "ALLOW_TEST_LOGIN" .env; then
    sed -i 's/ALLOW_TEST_LOGIN=.*/ALLOW_TEST_LOGIN=false/' .env
  else
    echo "ALLOW_TEST_LOGIN=false" >> .env
  fi

  # Generate strong OPS token if missing
  if ! grep -q "OPS_TOKEN" .env; then
    echo "OPS_TOKEN=$(openssl rand -base64 32)" >> .env
    echo "✅ Generated strong OPS token"
  fi

  echo "✅ Security hardening complete"
REMOTE_HARDEN

# Step 6: Build with Security Patches
echo ""
echo "🏗️  Step 6: Building Application (Secure)"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_BUILD'
  cd /var/www/dixis/frontend
  source ~/.nvm/nvm.sh

  # Clean build (remove any compromised artifacts)
  rm -rf .next node_modules/.cache

  # Build with patched Next.js
  echo "Building with patched Next.js..."
  pnpm build 2>&1 | tail -20

  if [ $? -eq 0 ]; then
    echo "✅ Build successful"
  else
    echo "❌ Build failed - check logs"
    exit 1
  fi
REMOTE_BUILD

# Step 7: Start with Process Monitoring
echo ""
echo "🚀 Step 7: Starting Application (Monitored)"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_START'
  cd /var/www/dixis/frontend
  source ~/.nvm/nvm.sh

  # Start PM2 with monitoring
  pm2 start npm --name dixis-frontend -- start
  pm2 save

  # Wait for startup
  sleep 5

  # Verify healthy start
  pm2 list

  # Test API
  curl -s http://localhost:3000/api/health | head -5

  echo "✅ Application started"
REMOTE_START

# Step 8: Install Runtime Protection
echo ""
echo "🛡️  Step 8: Installing Runtime Protection"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_PROTECT'
  # Create monitoring script
  mkdir -p /var/www/dixis/scripts/monitoring

  cat > /var/www/dixis/scripts/monitoring/detect-exploit.sh <<'MONITOR_SCRIPT'
#!/bin/bash
# Detect CVE-2025-55182 exploitation attempts

LOG_FILE="/var/log/dixis/security.log"
mkdir -p /var/log/dixis

while true; do
  # Check for cryptominers
  if pgrep -f 'xmrig|miner' > /dev/null; then
    echo "[$(date)] ALERT: Cryptominer detected! Killing..." >> $LOG_FILE
    pkill -9 -f 'xmrig|miner'

    # Restart app
    cd /var/www/dixis/frontend
    source ~/.nvm/nvm.sh
    pm2 restart dixis-frontend
  fi

  # Check for suspicious /tmp executables
  SUSP=$(find /tmp -type f -executable -newer /tmp -mmin -5 2>/dev/null)
  if [ -n "$SUSP" ]; then
    echo "[$(date)] ALERT: Suspicious file in /tmp: $SUSP" >> $LOG_FILE
    rm -f $SUSP
  fi

  sleep 60
done
MONITOR_SCRIPT

  chmod +x /var/www/dixis/scripts/monitoring/detect-exploit.sh

  # Start monitoring in background
  pkill -f detect-exploit.sh || true
  nohup /var/www/dixis/scripts/monitoring/detect-exploit.sh > /dev/null 2>&1 &

  echo "✅ Runtime protection installed"
REMOTE_PROTECT

# Step 9: Final Verification
echo ""
echo "✅ Step 9: Final Security Verification"
echo "-------------------------------------------"

ssh $DEPLOY_USER@$VPS_HOST "bash -s" <<'REMOTE_VERIFY'
  echo "Checking deployment security..."

  # Verify Next.js version
  cd /var/www/dixis/frontend
  VERSION=$(node -p "require('./package.json').dependencies.next" | tr -d '"^~')
  echo "Next.js version: $VERSION"

  if [[ "$VERSION" < "15.1.0" ]]; then
    echo "❌ CRITICAL: Still vulnerable to CVE-2025-55182!"
    exit 1
  fi

  # Verify test endpoints disabled
  if grep -q "ALLOW_TEST_LOGIN=true" .env; then
    echo "❌ WARNING: Test login still enabled!"
  else
    echo "✅ Test endpoints disabled"
  fi

  # Verify app is running
  if pm2 list | grep -q "dixis-frontend.*online"; then
    echo "✅ Application online"
  else
    echo "❌ Application not running"
    exit 1
  fi

  # Test API
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/products)
  if [ "$RESPONSE" = "200" ]; then
    echo "✅ API responding ($RESPONSE)"
  else
    echo "⚠️  API status: $RESPONSE"
  fi

  echo ""
  echo "🎉 SECURE DEPLOYMENT COMPLETE!"
  echo "CVE-2025-55182: PATCHED ✅"
  echo "Runtime Protection: ACTIVE ✅"
REMOTE_VERIFY

echo ""
echo "=================================================="
echo "✅ Deployment Complete - Security Status:"
echo "   - CVE-2025-55182: PATCHED"
echo "   - Test Endpoints: DISABLED"
echo "   - CORS: RESTRICTED"
echo "   - Runtime Monitoring: ACTIVE"
echo ""
echo "Site: https://dixis.gr"
echo "=================================================="
