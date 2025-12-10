#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step B: Users & SSH Hardening
# =============================================================================
# Run this as root after Step A
# Usage: bash 01-users-ssh.sh

echo "=== Step B: Users & SSH Hardening ==="

# 1. Create deploy user
DEPLOY_USER="deploy"
echo "→ Creating user: $DEPLOY_USER..."

if id "$DEPLOY_USER" &>/dev/null; then
    echo "  ✓ User $DEPLOY_USER already exists"
else
    # Create user with home directory, no password login
    useradd -m -s /bin/bash "$DEPLOY_USER"
    echo "  ✓ User created: $DEPLOY_USER"
fi

# 2. Add deploy to sudo group
echo "→ Adding $DEPLOY_USER to sudo group..."
usermod -aG sudo "$DEPLOY_USER"

# 3. Configure passwordless sudo for deploy (optional - you may want password for sudo)
echo "→ Configuring sudo access..."
echo "  Choose sudo policy:"
echo "  1) Require password for sudo (RECOMMENDED for security)"
echo "  2) Passwordless sudo (convenient but less secure)"
read -p "  Enter choice (1 or 2): " SUDO_CHOICE

if [[ "$SUDO_CHOICE" == "2" ]]; then
    echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
    chmod 0440 /etc/sudoers.d/deploy
    echo "  ✓ Passwordless sudo enabled for $DEPLOY_USER"
else
    # Deploy will need password for sudo
    echo "  ✓ Password required for sudo (default behavior)"
fi

# 4. Setup SSH key for deploy user
echo ""
echo "→ Setting up SSH key for $DEPLOY_USER..."
DEPLOY_HOME="/home/$DEPLOY_USER"
SSH_DIR="$DEPLOY_HOME/.ssh"
AUTH_KEYS="$SSH_DIR/authorized_keys"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  MANUAL INPUT REQUIRED: SSH Public Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. On your Mac, run:"
echo "   cat ~/.ssh/id_rsa.pub"
echo "   (or cat ~/.ssh/id_ed25519.pub if using ed25519)"
echo ""
echo "2. Copy the PUBLIC KEY (starts with 'ssh-rsa' or 'ssh-ed25519')"
echo ""
echo "3. Paste it below and press Enter:"
echo ""
read -p "SSH Public Key: " SSH_PUBLIC_KEY

if [[ -z "$SSH_PUBLIC_KEY" ]]; then
    echo "❌ ERROR: No SSH key provided"
    exit 1
fi

# Validate SSH key format (basic check)
if [[ ! "$SSH_PUBLIC_KEY" =~ ^ssh-(rsa|ed25519|dss|ecdsa) ]]; then
    echo "❌ ERROR: Invalid SSH key format (must start with 'ssh-rsa' or 'ssh-ed25519')"
    exit 1
fi

echo "$SSH_PUBLIC_KEY" > "$AUTH_KEYS"
chmod 600 "$AUTH_KEYS"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$SSH_DIR"

echo "  ✓ SSH key added to $AUTH_KEYS"

# 5. Harden SSH configuration
echo ""
echo "→ Hardening SSH config..."
SSHD_CONFIG="/etc/ssh/sshd_config"
SSHD_CONFIG_BACKUP="$SSHD_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

cp "$SSHD_CONFIG" "$SSHD_CONFIG_BACKUP"
echo "  ✓ Backup created: $SSHD_CONFIG_BACKUP"

# Apply hardening rules
cat >> "$SSHD_CONFIG" <<'EOF'

# ===== DIXIS SECURITY HARDENING =====
# Applied: $(date)

# Disable root login via password (allow only key-based)
PermitRootLogin prohibit-password

# Disable password authentication (key-only)
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no

# Disable empty passwords
PermitEmptyPasswords no

# Disable X11 forwarding (not needed)
X11Forwarding no

# Limit authentication attempts
MaxAuthTries 3

# Set login grace time
LoginGraceTime 60

# Enable strict mode
StrictModes yes

# AllowUsers (only deploy can login via SSH)
AllowUsers deploy
EOF

echo "  ✓ SSH hardening rules applied"

# 6. Test SSH config
echo "→ Testing SSH configuration..."
sshd -t
if [ $? -eq 0 ]; then
    echo "  ✓ SSH config is valid"
else
    echo "❌ ERROR: SSH config has errors. Restoring backup..."
    cp "$SSHD_CONFIG_BACKUP" "$SSHD_CONFIG"
    exit 1
fi

# 7. Restart SSH service
echo "→ Restarting SSH service..."
systemctl restart sshd
echo "  ✓ SSH service restarted"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT: TEST SSH ACCESS BEFORE CLOSING THIS SESSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "In a NEW terminal (keep this one open), test:"
echo "  ssh deploy@147.93.126.235"
echo ""
echo "If successful:"
echo "  ✅ Close this root session"
echo "  ✅ Continue with remaining steps as 'deploy' user"
echo ""
echo "If FAILED:"
echo "  ❌ DO NOT CLOSE this root session"
echo "  ❌ Restore backup: cp $SSHD_CONFIG_BACKUP $SSHD_CONFIG"
echo "  ❌ Restart SSH: systemctl restart sshd"
echo ""
echo "=== Step B COMPLETE ==="
echo "→ Next: Run 02-firewall.sh (as deploy user with sudo)"
