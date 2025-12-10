#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step D: Node.js / pnpm / PM2
# =============================================================================
# Run this as deploy user (NOT sudo) after Step C
# Usage: bash 03-nodejs-stack.sh

echo "=== Step D: Node.js / pnpm / PM2 Installation ==="

# 1. Install nvm (Node Version Manager)
echo "→ Installing nvm..."

NVM_VERSION="v0.40.1"  # Latest as of Dec 2025
NVM_INSTALL_SCRIPT="https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh"

if [ -d "$HOME/.nvm" ]; then
    echo "  ✓ nvm already installed"
else
    echo "  Downloading nvm install script..."
    curl -o- "$NVM_INSTALL_SCRIPT" | bash
    echo "  ✓ nvm installed"
fi

# Load nvm (for this session)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 2. Install Node.js LTS
echo ""
echo "→ Installing Node.js LTS..."

# Check package.json requirement (should be >=20)
NODE_VERSION="20"  # LTS version as of Dec 2025

if command -v node &>/dev/null; then
    CURRENT_NODE=$(node -v)
    echo "  Current Node.js: $CURRENT_NODE"
else
    echo "  Installing Node.js $NODE_VERSION (LTS)..."
    nvm install "$NODE_VERSION"
    nvm use "$NODE_VERSION"
    nvm alias default "$NODE_VERSION"
    echo "  ✓ Node.js installed: $(node -v)"
fi

# 3. Install pnpm globally
echo ""
echo "→ Installing pnpm..."

if command -v pnpm &>/dev/null; then
    CURRENT_PNPM=$(pnpm -v)
    echo "  ✓ pnpm already installed: v$CURRENT_PNPM"
else
    echo "  Installing pnpm via corepack..."
    corepack enable
    corepack prepare pnpm@latest --activate
    echo "  ✓ pnpm installed: $(pnpm -v)"
fi

# 4. Install PM2 globally
echo ""
echo "→ Installing PM2..."

if command -v pm2 &>/dev/null; then
    CURRENT_PM2=$(pm2 -v)
    echo "  ✓ PM2 already installed: v$CURRENT_PM2"
else
    echo "  Installing PM2 via npm..."
    npm install -g pm2
    echo "  ✓ PM2 installed: $(pm2 -v)"
fi

# 5. Configure PM2 startup (systemd)
echo ""
echo "→ Configuring PM2 startup..."

# Generate PM2 startup script
echo "  Generating PM2 startup script..."
PM2_STARTUP_OUTPUT=$(pm2 startup systemd -u deploy --hp /home/deploy 2>&1 || true)
echo "$PM2_STARTUP_OUTPUT"

# Extract the sudo command from PM2 output
SUDO_CMD=$(echo "$PM2_STARTUP_OUTPUT" | grep "sudo env" | head -1 || true)

if [[ -n "$SUDO_CMD" ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  MANUAL ACTION REQUIRED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Run this command to enable PM2 startup:"
    echo ""
    echo "$SUDO_CMD"
    echo ""
    read -p "Press Enter after running the above command..."
else
    echo "  ⚠️  Could not auto-detect PM2 startup command"
    echo "  You may need to run 'pm2 startup' manually later"
fi

# 6. Verify installations
echo ""
echo "=== Step D COMPLETE ==="
echo ""
echo "Installed Versions:"
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"
echo "  pnpm: $(pnpm -v)"
echo "  PM2: $(pm2 -v)"
echo ""
echo "Node Path: $(which node)"
echo "pnpm Path: $(which pnpm)"
echo "PM2 Path: $(which pm2)"
echo ""
echo "✅ Node.js stack installed successfully"
echo "→ Next: Run 04-nginx.sh (with sudo)"
