#!/bin/bash
set -euo pipefail

# =============================================================================
# DIXIS VPS BOOTSTRAP - Step F: Clone Repo & App Setup
# =============================================================================
# Run this as deploy user (NO sudo) after Step E
# Usage: bash 05-clone-repo.sh

echo "=== Step F: Clone Repo & App Setup ==="

# 1. Create app directory
APP_DIR="/var/www/dixis"
FRONTEND_DIR="$APP_DIR/frontend"

echo "→ Creating app directory..."
if [ -d "$APP_DIR" ]; then
    echo "  ⚠️  Directory already exists: $APP_DIR"
    read -p "  Delete and recreate? (y/N): " CONFIRM
    if [[ "$CONFIRM" == "y" || "$CONFIRM" == "Y" ]]; then
        sudo rm -rf "$APP_DIR"
        echo "  ✓ Deleted existing directory"
    else
        echo "  Using existing directory"
    fi
fi

sudo mkdir -p "$APP_DIR"
sudo chown -R deploy:deploy "$APP_DIR"
echo "  ✓ Directory created: $APP_DIR"

# 2. Clone repository
echo ""
echo "→ Cloning Dixis repository from GitHub..."

cd "$APP_DIR"

REPO_URL="https://github.com/lomendor/Project-Dixis.git"
BRANCH="main"  # Change if needed

if [ -d "$APP_DIR/.git" ]; then
    echo "  ✓ Repository already cloned"
    echo "  Pulling latest changes..."
    git pull origin "$BRANCH"
else
    echo "  Cloning from: $REPO_URL"
    echo "  Branch: $BRANCH"
    git clone -b "$BRANCH" "$REPO_URL" .
    echo "  ✓ Repository cloned"
fi

# Verify we're on the correct branch (should have patched Next.js)
CURRENT_BRANCH=$(git branch --show-current)
echo "  Current branch: $CURRENT_BRANCH"

# 3. Install frontend dependencies
echo ""
echo "→ Installing frontend dependencies..."

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ ERROR: Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Check package.json for patched versions
echo "  Checking Next.js version..."
NEXT_VERSION=$(node -e "console.log(require('./package.json').dependencies.next)" || echo "unknown")
REACT_VERSION=$(node -e "console.log(require('./package.json').dependencies.react)" || echo "unknown")

echo "  package.json versions:"
echo "    next: $NEXT_VERSION"
echo "    react: $REACT_VERSION"

if [[ "$NEXT_VERSION" != "15.5.7" ]]; then
    echo "  ⚠️  WARNING: Expected Next.js 15.5.7, got $NEXT_VERSION"
    echo "  Make sure you have the patched version!"
fi

if [[ "$REACT_VERSION" != "19.1.2" ]]; then
    echo "  ⚠️  WARNING: Expected React 19.1.2, got $REACT_VERSION"
    echo "  Make sure you have the patched version!"
fi

# Install dependencies
echo "  Running pnpm install..."
pnpm install

echo "  ✓ Dependencies installed"

# 4. Create .env file from template
echo ""
echo "→ Creating .env file..."

ENV_FILE="$FRONTEND_DIR/.env"
ENV_EXAMPLE="$FRONTEND_DIR/.env.production.example"

if [ -f "$ENV_FILE" ]; then
    echo "  ⚠️  .env file already exists"
    read -p "  Overwrite with template? (y/N): " CONFIRM
    if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
        echo "  Keeping existing .env"
    else
        rm "$ENV_FILE"
    fi
fi

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        echo "  Copying from: $ENV_EXAMPLE"
        cp "$ENV_EXAMPLE" "$ENV_FILE"
    else
        echo "  Creating minimal .env template..."
        cat > "$ENV_FILE" <<'EOF'
# ===== DIXIS PRODUCTION ENVIRONMENT =====
# TODO: Fill these values manually (DO NOT COMMIT)

# API URL (production)
NEXT_PUBLIC_API_BASE_URL=https://dixis.gr/api/v1

# App URLs
NEXT_PUBLIC_APP_URL=https://dixis.gr
NEXT_PUBLIC_SITE_URL=https://dixis.gr

# Environment
DIXIS_ENV=production
NODE_ENV=production

# Database (Neon PostgreSQL)
# TODO: Get from Neon dashboard
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Payment (Viva Wallet)
# TODO: Get from Viva Wallet dashboard
NEXT_PUBLIC_PAYMENT_PROVIDER=viva
VIVA_WALLET_API_KEY=TODO_FILL_THIS
VIVA_WALLET_CLIENT_ID=TODO_FILL_THIS
VIVA_WALLET_CLIENT_SECRET=TODO_FILL_THIS

# Sentry (Error Tracking)
# TODO: Optional, get from Sentry dashboard
# NEXT_PUBLIC_SENTRY_DSN=

# AWS S3 (File Uploads)
# TODO: Optional, get from AWS console
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AWS_S3_BUCKET=

# Server Port
PORT=3000
EOF
    fi

    echo "  ✓ .env file created"
fi

# 5. Show manual steps
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  MANUAL ACTION REQUIRED: Fill .env secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Edit the .env file and fill in real values:"
echo "  nano $ENV_FILE"
echo ""
echo "Required secrets:"
echo "  1. DATABASE_URL (from Neon dashboard)"
echo "  2. VIVA_WALLET_* (from Viva Wallet dashboard)"
echo "  3. Other optional services (Sentry, AWS S3)"
echo ""
echo "After filling secrets, VERIFY:"
echo "  cat $ENV_FILE | grep -E '(DATABASE_URL|VIVA_WALLET)'"
echo "  (Should NOT show 'TODO' in required fields)"
echo ""
read -p "Press Enter after filling .env secrets..."

# 6. Verify .env has been filled
echo ""
echo "→ Verifying .env configuration..."

TODO_COUNT=$(grep -c "TODO_FILL_THIS" "$ENV_FILE" || true)
if [ "$TODO_COUNT" -gt 0 ]; then
    echo "  ⚠️  WARNING: Found $TODO_COUNT unfilled TODO placeholders in .env"
    echo "  Make sure you fill all required secrets before building!"
fi

# 7. Build application
echo ""
echo "→ Building Next.js application..."

# Run Prisma codegen first (required for build)
echo "  Generating Prisma client..."
pnpm prisma:gen

echo "  Running production build..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Build failed"
    echo "  Check .env values and try again"
    exit 1
fi

echo "  ✓ Build completed successfully"

# 8. Summary
echo ""
echo "=== Step F COMPLETE ==="
echo ""
echo "Repository:"
echo "  Path: $APP_DIR"
echo "  Branch: $(git branch --show-current)"
echo "  Last commit: $(git log -1 --oneline)"
echo ""
echo "Dependencies:"
echo "  Node modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'N/A')"
echo "  Build output: $(du -sh .next 2>/dev/null | cut -f1 || echo 'N/A')"
echo ""
echo "Environment:"
echo "  .env file: $ENV_FILE"
echo "  Secrets filled: $([ "$TODO_COUNT" -eq 0 ] && echo '✅ Yes' || echo '⚠️  No (manual action needed)')"
echo ""
echo "✅ Application code ready"
echo "→ Next: Run 06-pm2-service.sh (as deploy user)"
