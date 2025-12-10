#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step H: HTTPS Setup with LetsEncrypt
# =============================================================================
# Run this with sudo after Step G
# Usage: sudo bash 07-nginx-https.sh

echo "=== Step H: HTTPS Setup with LetsEncrypt ==="

DOMAIN="dixis.gr"
WWW_DOMAIN="www.dixis.gr"

# 1. Verify DNS is pointing to this server
echo "→ Verifying DNS configuration..."

# Get server public IP
SERVER_IP=$(curl -s https://api.ipify.org || echo "unknown")
echo "  Server IP: $SERVER_IP"

# Check DNS for main domain
DOMAIN_IP=$(dig +short "$DOMAIN" @8.8.8.8 | tail -1 || echo "unknown")
echo "  $DOMAIN resolves to: $DOMAIN_IP"

WWW_IP=$(dig +short "$WWW_DOMAIN" @8.8.8.8 | tail -1 || echo "unknown")
echo "  $WWW_DOMAIN resolves to: $WWW_IP"

if [[ "$DOMAIN_IP" != "$SERVER_IP" ]]; then
    echo ""
    echo "⚠️  WARNING: DNS mismatch for $DOMAIN"
    echo "  Expected: $SERVER_IP"
    echo "  Got: $DOMAIN_IP"
    echo ""
    echo "LetsEncrypt requires DNS to point to this server."
    read -p "Continue anyway? (y/N): " CONTINUE

    if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
        echo "  Skipping HTTPS setup"
        echo "  You can run this script again after fixing DNS"
        exit 0
    fi
fi

# 2. Test HTTP is working
echo ""
echo "→ Testing HTTP endpoint..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1/" || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ ERROR: HTTP endpoint not responding (HTTP $HTTP_CODE)"
    echo "  Fix Nginx/PM2 configuration before enabling HTTPS"
    exit 1
fi

echo "  ✅ HTTP responding (HTTP $HTTP_CODE)"

# 3. Install certbot
echo ""
echo "→ Installing certbot..."

if command -v certbot &>/dev/null; then
    echo "  ✓ certbot already installed"
else
    echo "  Installing certbot and Nginx plugin..."
    apt-get update -qq
    apt-get install -y certbot python3-certbot-nginx
    echo "  ✓ certbot installed: $(certbot --version)"
fi

# 4. Obtain SSL certificate
echo ""
echo "→ Obtaining SSL certificate from LetsEncrypt..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  CERTBOT INTERACTIVE PROMPTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Certbot will ask for:"
echo "  1. Email address (for renewal notifications)"
echo "  2. Agree to Terms of Service"
echo "  3. Share email with EFF (optional)"
echo "  4. Redirect HTTP to HTTPS (choose option 2: Redirect)"
echo ""
read -p "Press Enter to continue with certbot..."

# Run certbot
certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN"

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Certbot failed"
    echo "  Common issues:"
    echo "  - DNS not pointing to this server"
    echo "  - Port 80/443 not accessible from internet"
    echo "  - Firewall blocking connections"
    exit 1
fi

echo ""
echo "  ✅ SSL certificate obtained successfully"

# 5. Verify HTTPS is working
echo ""
echo "→ Verifying HTTPS endpoint..."

HTTPS_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" "https://127.0.0.1/" || echo "000")
if [ "$HTTPS_CODE" == "200" ]; then
    echo "  ✅ HTTPS responding (HTTP $HTTPS_CODE)"
else
    echo "  ⚠️  HTTPS test returned HTTP $HTTPS_CODE"
    echo "  This may be normal if Nginx isn't listening on 127.0.0.1:443"
fi

# 6. Test auto-renewal
echo ""
echo "→ Testing certificate auto-renewal..."

certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo "  ✅ Auto-renewal test passed"
else
    echo "  ⚠️  Auto-renewal test failed"
    echo "  Check certbot timer: systemctl status certbot.timer"
fi

# 7. Show certificate info
echo ""
echo "=== Step H COMPLETE ==="
echo ""
echo "SSL Certificate:"
certbot certificates

echo ""
echo "Certificate Files:"
echo "  Fullchain: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
echo "Auto-Renewal:"
echo "  Timer status: $(systemctl is-active certbot.timer || echo 'inactive')"
echo "  Next renewal: $(systemctl status certbot.timer --no-pager -l 2>/dev/null | grep 'Trigger:' || echo 'N/A')"
echo ""
echo "Nginx Config:"
echo "  certbot has updated: /etc/nginx/sites-available/dixis.gr"
echo "  (Added SSL certificates and redirect rules)"
echo ""
echo "✅ HTTPS enabled successfully"
echo "→ Next: Run 08-final-check.sh to verify everything"
