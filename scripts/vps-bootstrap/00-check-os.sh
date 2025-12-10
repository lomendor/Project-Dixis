#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step A: Check OS & Basic Tools
# =============================================================================
# Run this as root after fresh Ubuntu 24.04 install
# Usage: bash 00-check-os.sh

echo "=== Step A: OS Check & Basic Tools Installation ==="

# 1. Check OS version
echo "→ Checking OS version..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "  OS: $NAME $VERSION"
    echo "  ID: $ID"

    if [[ "$ID" != "ubuntu" ]]; then
        echo "❌ ERROR: Expected Ubuntu, got $ID"
        exit 1
    fi

    if [[ "$VERSION_ID" != "24.04" ]]; then
        echo "⚠️  WARNING: Expected Ubuntu 24.04, got $VERSION_ID"
        echo "   Continuing anyway, but verify compatibility..."
    fi
else
    echo "❌ ERROR: Cannot detect OS version"
    exit 1
fi

# 2. Check system clock
echo "→ Checking system time..."
timedatectl status
TIMEZONE=$(timedatectl | grep "Time zone" | awk '{print $3}')
echo "  Timezone: $TIMEZONE"

if [[ "$TIMEZONE" != "Europe/Athens" ]]; then
    echo "  Setting timezone to Europe/Athens..."
    sudo timedatectl set-timezone Europe/Athens
fi

# 3. Update package lists
echo "→ Updating package lists..."
apt-get update -qq

# 4. Install basic tools
echo "→ Installing basic tools..."
PACKAGES=(
    "htop"
    "git"
    "curl"
    "wget"
    "ufw"
    "fail2ban"
    "unzip"
    "build-essential"
    "software-properties-common"
    "apt-transport-https"
    "ca-certificates"
    "gnupg"
    "lsb-release"
)

for pkg in "${PACKAGES[@]}"; do
    if ! dpkg -l | grep -q "^ii  $pkg"; then
        echo "  Installing $pkg..."
        apt-get install -y -qq "$pkg"
    else
        echo "  ✓ $pkg already installed"
    fi
done

# 5. Final checks
echo ""
echo "=== Step A COMPLETE ==="
echo "OS: $(lsb_release -ds)"
echo "Kernel: $(uname -r)"
echo "Time: $(date)"
echo "Uptime: $(uptime -p)"
echo ""
echo "✅ Basic tools installed successfully"
echo "→ Next: Run 01-users-ssh.sh"
