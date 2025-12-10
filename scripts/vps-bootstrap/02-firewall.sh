#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step C: Firewall & Basic Protection
# =============================================================================
# Run this as deploy user with sudo after Step B
# Usage: sudo bash 02-firewall.sh

echo "=== Step C: Firewall & Basic Protection ==="

# 1. Configure UFW (Uncomplicated Firewall)
echo "→ Configuring UFW firewall..."

# Reset UFW to defaults (clean slate)
echo "  Resetting UFW to defaults..."
ufw --force reset

# Default policies
echo "  Setting default policies..."
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (port 22) - CRITICAL: Do this BEFORE enabling
echo "  Allowing SSH (port 22)..."
ufw allow 22/tcp comment 'SSH'

# Allow HTTP (port 80)
echo "  Allowing HTTP (port 80)..."
ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS (port 443)
echo "  Allowing HTTPS (port 443)..."
ufw allow 443/tcp comment 'HTTPS'

# Enable UFW
echo "  Enabling UFW..."
ufw --force enable

# Show status
echo ""
echo "  ✓ UFW firewall configured:"
ufw status numbered

# 2. Configure fail2ban
echo ""
echo "→ Configuring fail2ban..."

# Create local jail config
JAIL_LOCAL="/etc/fail2ban/jail.local"

cat > "$JAIL_LOCAL" <<'EOF'
# ===== DIXIS FAIL2BAN CONFIGURATION =====
# Applied: $(date)

[DEFAULT]
# Ban hosts for 1 hour (3600 seconds)
bantime = 3600

# A host is banned if it generates "maxretry" during "findtime"
findtime = 600
maxretry = 5

# Email notifications (configure later with real email)
destemail = root@localhost
sendername = Fail2Ban
mta = sendmail
action = %(action_)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
findtime = 600
EOF

echo "  ✓ fail2ban config created: $JAIL_LOCAL"

# Enable and start fail2ban
echo "  Enabling fail2ban service..."
systemctl enable fail2ban
systemctl restart fail2ban

# Wait for fail2ban to start
sleep 2

# Show status
echo ""
echo "  ✓ fail2ban status:"
fail2ban-client status

echo ""
echo "  ✓ fail2ban sshd jail status:"
fail2ban-client status sshd || echo "  (jail not yet active, normal on first run)"

# 3. Additional security: disable unnecessary services
echo ""
echo "→ Checking for unnecessary services..."

# List of services to disable (if present)
UNNECESSARY_SERVICES=(
    "bluetooth"
    "cups"
    "avahi-daemon"
)

for service in "${UNNECESSARY_SERVICES[@]}"; do
    if systemctl list-unit-files | grep -q "^$service.service"; then
        echo "  Disabling $service..."
        systemctl disable "$service" 2>/dev/null || true
        systemctl stop "$service" 2>/dev/null || true
    fi
done

echo ""
echo "=== Step C COMPLETE ==="
echo ""
echo "Firewall Rules:"
ufw status numbered
echo ""
echo "fail2ban Status:"
fail2ban-client status
echo ""
echo "✅ Firewall and basic protection configured"
echo "→ Next: Run 03-nodejs-stack.sh"
