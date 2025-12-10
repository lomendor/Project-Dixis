#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - MASTER SCRIPT
# =============================================================================
# Run all bootstrap scripts in sequence
# Usage: bash RUN-ALL.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DIXIS VPS BOOTSTRAP - MASTER SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will run all bootstrap scripts in sequence:"
echo "  0. Check OS & Install Tools (as root)"
echo "  1. Create Deploy User & SSH Hardening (as root)"
echo "  2. Configure Firewall & fail2ban (as deploy with sudo)"
echo "  3. Install Node.js / pnpm / PM2 (as deploy)"
echo "  4. Install & Configure Nginx (as deploy with sudo)"
echo "  5. Clone Repository & Setup App (as deploy)"
echo "  6. Configure PM2 Service (as deploy)"
echo "  7. Setup HTTPS with LetsEncrypt (as deploy with sudo)"
echo "  8. Final Verification & Report (as deploy)"
echo ""
echo "⚠️  IMPORTANT:"
echo "  - Scripts 0-1 run as root"
echo "  - Scripts 2-8 run as deploy user"
echo "  - Some scripts require sudo password"
echo "  - Some scripts require manual input (SSH keys, env secrets)"
echo ""
read -p "Continue with bootstrap? (y/N): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Bootstrap cancelled"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting bootstrap sequence..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect current user
CURRENT_USER=$(whoami)

# Steps 0-1: Run as root
if [[ "$CURRENT_USER" == "root" ]]; then
    echo "→ Running Steps 0-1 as root..."
    bash "$SCRIPT_DIR/00-check-os.sh"
    bash "$SCRIPT_DIR/01-users-ssh.sh"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  SWITCH TO DEPLOY USER"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Open a NEW terminal"
    echo "2. Connect as deploy user: ssh deploy@<VPS_IP>"
    echo "3. Continue with: bash $SCRIPT_DIR/RUN-ALL.sh"
    echo ""
    echo "This script will now exit. Continue from deploy user."
    exit 0
fi

# Steps 2-8: Run as deploy user
if [[ "$CURRENT_USER" == "deploy" ]]; then
    echo "→ Running Steps 2-8 as deploy user..."

    echo ""
    echo "=== Step 2: Firewall & Protection ==="
    sudo bash "$SCRIPT_DIR/02-firewall.sh"

    echo ""
    echo "=== Step 3: Node.js Stack ==="
    bash "$SCRIPT_DIR/03-nodejs-stack.sh"

    echo ""
    echo "=== Step 4: Nginx ==="
    sudo bash "$SCRIPT_DIR/04-nginx.sh"

    echo ""
    echo "=== Step 5: Clone Repo & App Setup ==="
    bash "$SCRIPT_DIR/05-clone-repo.sh"

    echo ""
    echo "=== Step 6: PM2 Service ==="
    bash "$SCRIPT_DIR/06-pm2-service.sh"

    echo ""
    echo "=== Step 7: HTTPS Setup ==="
    sudo bash "$SCRIPT_DIR/07-nginx-https.sh"

    echo ""
    echo "=== Step 8: Final Verification ==="
    bash "$SCRIPT_DIR/08-final-check.sh"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 BOOTSTRAP COMPLETE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Your Dixis marketplace is now live:"
    echo "  https://dixis.gr"
    echo ""
    exit 0
fi

# Unknown user
echo "❌ ERROR: This script must be run as root or deploy user"
echo "Current user: $CURRENT_USER"
exit 1
