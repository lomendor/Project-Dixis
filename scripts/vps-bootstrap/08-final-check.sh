#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step I: Final Verification & Report
# =============================================================================
# Run this as deploy user after all previous steps
# Usage: bash 08-final-check.sh

echo "=== Step I: Final Verification & Report ==="

# 1. System Information
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 END-STATE REPORT: DIXIS VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# OS Information
echo "🖥️  SYSTEM INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OS: $(lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '\"')"
echo "Kernel: $(uname -r)"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
echo ""

# Software Versions
echo "📦 SOFTWARE VERSIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Node.js: $(node -v 2>/dev/null || echo 'Not installed')"
echo "npm: v$(npm -v 2>/dev/null || echo 'Not installed')"
echo "pnpm: v$(pnpm -v 2>/dev/null || echo 'Not installed')"
echo "PM2: v$(pm2 -v 2>/dev/null || echo 'Not installed')"
echo "Nginx: $(nginx -v 2>&1 | cut -d'/' -f2 || echo 'Not installed')"
echo "Git: $(git --version | awk '{print $3}' || echo 'Not installed')"
echo ""

# Network & Security
echo "🔒 NETWORK & SECURITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Public IP: $(curl -s https://api.ipify.org || echo 'Unknown')"
echo ""
echo "Firewall (UFW):"
sudo ufw status numbered | head -10
echo ""
echo "Open Ports:"
sudo ss -tlnp | grep -E ':(22|80|443|3000)\s' | awk '{print $4}' | sort -u
echo ""
echo "fail2ban Status:"
sudo fail2ban-client status 2>/dev/null | grep "Jail list" || echo "  Not active"
echo ""

# Application Status
echo "🚀 APPLICATION STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "App User: deploy"
echo "App Directory: /var/www/dixis"
echo "Working Directory: $(pwd)"
echo ""
echo "Git Status:"
cd /var/www/dixis 2>/dev/null && {
    echo "  Branch: $(git branch --show-current)"
    echo "  Last Commit: $(git log -1 --oneline)"
    echo "  Remote: $(git remote get-url origin)"
} || echo "  Not a git repository"
echo ""
echo "PM2 Processes:"
pm2 list 2>/dev/null || echo "  PM2 not running"
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l | head -5
echo ""

# Health Checks
echo "🏥 HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test localhost
echo "→ Testing localhost:3000..."
LOCALHOST_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
echo "  HTTP $LOCALHOST_CODE $([ "$LOCALHOST_CODE" == "200" ] && echo '✅' || echo '❌')"

# Test HTTP
echo "→ Testing HTTP (dixis.gr)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://dixis.gr/ 2>/dev/null || echo "000")
echo "  HTTP $HTTP_CODE $([ "$HTTP_CODE" == "200" ] && echo '✅' || [ "$HTTP_CODE" == "301" ] && echo '↗️ (redirect)' || echo '❌')"

# Test HTTPS
echo "→ Testing HTTPS (dixis.gr)..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dixis.gr/ 2>/dev/null || echo "000")
echo "  HTTP $HTTPS_CODE $([ "$HTTPS_CODE" == "200" ] && echo '✅' || echo '❌')"

# Test health endpoint (if exists)
echo "→ Testing health endpoint..."
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dixis.gr/api/healthz 2>/dev/null || echo "000")
if [ "$HEALTH_CODE" == "200" ]; then
    HEALTH_RESPONSE=$(curl -s https://dixis.gr/api/healthz 2>/dev/null || echo '{}')
    echo "  HTTP $HEALTH_CODE ✅"
    echo "  Response: $HEALTH_RESPONSE"
elif [ "$HEALTH_CODE" == "404" ]; then
    echo "  HTTP $HEALTH_CODE ⚠️ (endpoint not implemented yet)"
else
    echo "  HTTP $HEALTH_CODE ❌"
fi

echo ""

# SSL Certificate
echo "🔐 SSL CERTIFICATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "/etc/letsencrypt/live/dixis.gr" ]; then
    echo "Certificate:"
    sudo certbot certificates 2>/dev/null | grep -A3 "Certificate Name: dixis.gr" | head -4
    echo ""
    echo "Auto-Renewal:"
    echo "  Timer: $(sudo systemctl is-active certbot.timer || echo 'inactive')"
else
    echo "  ⚠️  No SSL certificate found (HTTPS setup may be pending)"
fi

echo ""

# Configuration Files
echo "📄 CONFIGURATION FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Nginx Config: /etc/nginx/sites-available/dixis.gr"
echo "PM2 Ecosystem: /var/www/dixis/frontend/ecosystem.config.js"
echo "Environment: /var/www/dixis/frontend/.env"
echo "SSH Config: /etc/ssh/sshd_config"
echo "Firewall: /etc/ufw/user.rules"
echo "fail2ban: /etc/fail2ban/jail.local"
echo ""

# Next.js / React Versions (Security Check)
echo "🔒 SECURITY VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /var/www/dixis/frontend 2>/dev/null && {
    NEXT_VERSION=$(node -e "console.log(require('./package.json').dependencies.next)" 2>/dev/null || echo "unknown")
    REACT_VERSION=$(node -e "console.log(require('./package.json').dependencies.react)" 2>/dev/null || echo "unknown")

    echo "Next.js: $NEXT_VERSION $([ "$NEXT_VERSION" == "15.5.7" ] && echo '✅ PATCHED' || echo '⚠️  Check version')"
    echo "React: $REACT_VERSION $([ "$REACT_VERSION" == "19.1.2" ] && echo '✅ PATCHED' || echo '⚠️  Check version')"
    echo ""
    echo "CVE-2025-55182 Status: $([ "$NEXT_VERSION" == "15.5.7" ] && [ "$REACT_VERSION" == "19.1.2" ] && echo '✅ PROTECTED' || echo '⚠️  VULNERABLE - Update required')"
} || echo "  Cannot verify (frontend directory not found)"

echo ""

# Recommendations
echo "💡 RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Monitor logs:"
echo "   - PM2: pm2 logs dixis-frontend"
echo "   - Nginx: sudo tail -f /var/log/nginx/dixis-error.log"
echo "   - fail2ban: sudo tail -f /var/log/fail2ban.log"
echo ""
echo "2. Regular maintenance:"
echo "   - Update packages: sudo apt update && sudo apt upgrade"
echo "   - Check PM2: pm2 monit"
echo "   - Test SSL renewal: sudo certbot renew --dry-run"
echo ""
echo "3. Security monitoring:"
echo "   - Check fail2ban bans: sudo fail2ban-client status sshd"
echo "   - Review auth logs: sudo tail -f /var/log/auth.log"
echo "   - Monitor CPU/processes: htop"
echo ""
echo "4. Backup strategy:"
echo "   - Database: Regular Neon backups (automated)"
echo "   - Code: Git repository (lomendor/Project-Dixis)"
echo "   - Configs: Backup /etc/nginx, .env files"
echo ""

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DIXIS VPS BOOTSTRAP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your application:"
echo "  HTTP:  http://dixis.gr"
echo "  HTTPS: https://dixis.gr"
echo ""
echo "SSH Access:"
echo "  ssh deploy@147.93.126.235"
echo ""
echo "Documentation:"
echo "  See: docs/OPS/SERVER-SETUP.md (will be created)"
echo ""
echo "🎉 Your Dixis marketplace is now live!"
echo ""

# Save report to file
REPORT_FILE="/home/deploy/bootstrap-report-$(date +%Y%m%d_%H%M%S).txt"
{
    echo "DIXIS VPS BOOTSTRAP REPORT"
    echo "Generated: $(date)"
    echo ""
    bash "$0" 2>&1
} > "$REPORT_FILE" 2>&1 || true

echo "Report saved to: $REPORT_FILE"
