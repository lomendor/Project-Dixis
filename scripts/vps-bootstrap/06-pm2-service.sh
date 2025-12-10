#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step G: PM2 Service & Health Check
# =============================================================================
# Run this as deploy user (NO sudo) after Step F
# Usage: bash 06-pm2-service.sh

echo "=== Step G: PM2 Service & Health Check ==="

FRONTEND_DIR="/var/www/dixis/frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ ERROR: Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# 1. Create PM2 ecosystem file
echo "→ Creating PM2 ecosystem configuration..."

ECOSYSTEM_FILE="$FRONTEND_DIR/ecosystem.config.js"

cat > "$ECOSYSTEM_FILE" <<'EOF'
// ===== DIXIS PM2 ECOSYSTEM CONFIGURATION =====
// Managed by PM2 process manager

module.exports = {
  apps: [
    {
      name: 'dixis-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/dixis/frontend',
      instances: 1,
      exec_mode: 'fork',

      // Environment variables (production)
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Restart policy
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Logging
      error_file: '/home/deploy/.pm2/logs/dixis-frontend-error.log',
      out_file: '/home/deploy/.pm2/logs/dixis-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Health monitoring
      health_check: {
        enabled: true,
        url: 'http://127.0.0.1:3000/api/healthz',
        interval: 30000, // 30 seconds
        timeout: 5000,
      },
    },
  ],
};
EOF

echo "  ✓ PM2 ecosystem file created: $ECOSYSTEM_FILE"

# 2. Stop any existing PM2 processes
echo ""
echo "→ Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || echo "  No existing processes"

# 3. Start application with PM2
echo ""
echo "→ Starting application with PM2..."

pm2 start "$ECOSYSTEM_FILE"

# Wait for app to start
echo "  Waiting for app to start..."
sleep 5

# 4. Check PM2 status
echo ""
echo "→ PM2 Status:"
pm2 list

# 5. Test health endpoint
echo ""
echo "→ Testing health endpoint..."

HEALTH_URL="http://127.0.0.1:3000/api/healthz"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

    if [ "$HTTP_CODE" == "200" ]; then
        echo "  ✅ Health check passed (HTTP $HTTP_CODE)"
        HEALTH_RESPONSE=$(curl -s "$HEALTH_URL" || echo "{}")
        echo "  Response: $HEALTH_RESPONSE"
        break
    elif [ "$HTTP_CODE" == "404" ]; then
        echo "  ⚠️  Health endpoint not found (HTTP 404)"
        echo "  This is OK if /api/healthz doesn't exist yet"
        echo "  Testing root endpoint instead..."

        ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/" || echo "000")
        if [ "$ROOT_CODE" == "200" ]; then
            echo "  ✅ Root endpoint responding (HTTP $ROOT_CODE)"
            break
        fi
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "  Attempt $RETRY_COUNT/$MAX_RETRIES: HTTP $HTTP_CODE (waiting...)"
        sleep 3
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "  ❌ Health check failed after $MAX_RETRIES attempts"
    echo ""
    echo "  PM2 logs:"
    pm2 logs dixis-frontend --lines 50 --nostream
    exit 1
fi

# 6. Save PM2 process list
echo ""
echo "→ Saving PM2 process list..."
pm2 save
echo "  ✓ PM2 process list saved"

# 7. Show PM2 info
echo ""
echo "=== Step G COMPLETE ==="
echo ""
echo "PM2 Process:"
pm2 info dixis-frontend

echo ""
echo "PM2 Logs:"
echo "  Error log: ~/.pm2/logs/dixis-frontend-error.log"
echo "  Output log: ~/.pm2/logs/dixis-frontend-out.log"
echo ""
echo "PM2 Commands:"
echo "  Status:  pm2 list"
echo "  Logs:    pm2 logs dixis-frontend"
echo "  Restart: pm2 restart dixis-frontend"
echo "  Stop:    pm2 stop dixis-frontend"
echo "  Monitor: pm2 monit"
echo ""
echo "✅ Application running with PM2"
echo "→ Next: Run 07-nginx-https.sh (with sudo) for HTTPS setup"
