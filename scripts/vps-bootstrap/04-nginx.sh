#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step E: Nginx & Reverse Proxy
# =============================================================================
# Run this with sudo after Step D
# Usage: sudo bash 04-nginx.sh

echo "=== Step E: Nginx & Reverse Proxy ==="

# 1. Install Nginx
echo "→ Installing Nginx..."

if command -v nginx &>/dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    echo "  ✓ Nginx already installed: $NGINX_VERSION"
else
    apt-get update -qq
    apt-get install -y nginx
    echo "  ✓ Nginx installed: $(nginx -v 2>&1 | cut -d'/' -f2)"
fi

# 2. Create Nginx config for dixis.gr
echo ""
echo "→ Creating Nginx reverse proxy config..."

NGINX_CONF="/etc/nginx/sites-available/dixis.gr"
NGINX_ENABLED="/etc/nginx/sites-enabled/dixis.gr"

cat > "$NGINX_CONF" <<'EOF'
# ===== DIXIS.GR NGINX CONFIGURATION =====
# Next.js App Reverse Proxy
# Applied: $(date)

# Redirect HTTP to HTTPS (will be enabled after LetsEncrypt setup)
# server {
#     listen 80;
#     listen [::]:80;
#     server_name dixis.gr www.dixis.gr;
#     return 301 https://$server_name$request_uri;
# }

# HTTP Server (temporary, before HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name dixis.gr www.dixis.gr;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/dixis-access.log;
    error_log /var/log/nginx/dixis-error.log warn;

    # Max upload size
    client_max_body_size 10M;

    # Proxy to Next.js app (running on localhost:3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (bypass proxy cache)
    location /api/healthz {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Static files optimization (Next.js)
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Favicon
    location = /favicon.ico {
        proxy_pass http://127.0.0.1:3000;
        access_log off;
        log_not_found off;
    }

    # robots.txt
    location = /robots.txt {
        proxy_pass http://127.0.0.1:3000;
        access_log off;
        log_not_found off;
    }
}

# HTTPS Server (will be configured by certbot)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name dixis.gr www.dixis.gr;
#
#     # SSL certificates (managed by certbot)
#     # ssl_certificate /etc/letsencrypt/live/dixis.gr/fullchain.pem;
#     # ssl_certificate_key /etc/letsencrypt/live/dixis.gr/privkey.pem;
#
#     # ... rest of config same as HTTP ...
# }
EOF

echo "  ✓ Nginx config created: $NGINX_CONF"

# 3. Enable site (create symlink)
echo "  Enabling site..."
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
echo "  ✓ Site enabled"

# 4. Remove default Nginx site
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo "  Removing default Nginx site..."
    rm -f /etc/nginx/sites-enabled/default
fi

# 5. Test Nginx config
echo ""
echo "→ Testing Nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Nginx config test failed"
    exit 1
fi

echo "  ✓ Nginx config is valid"

# 6. Restart Nginx
echo ""
echo "→ Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

echo "  ✓ Nginx restarted and enabled"

# 7. Show status
echo ""
echo "=== Step E COMPLETE ==="
echo ""
echo "Nginx Status:"
systemctl status nginx --no-pager -l | head -20
echo ""
echo "Nginx Config:"
echo "  Available: $NGINX_CONF"
echo "  Enabled: $NGINX_ENABLED"
echo ""
echo "Listening Ports:"
ss -tlnp | grep nginx || true
echo ""
echo "✅ Nginx reverse proxy configured"
echo "→ Next: Run 05-clone-repo.sh (as deploy user, NO sudo)"
