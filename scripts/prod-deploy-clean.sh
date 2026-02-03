#!/usr/bin/env bash
#
# prod-deploy-clean.sh — Deterministic production deploy for Dixis frontend (PM2)
#
# Usage:
#   bash scripts/prod-deploy-clean.sh          # from local machine (SSHs into VPS)
#   SSH_ONLY=1 bash scripts/prod-deploy-clean.sh  # run directly ON the VPS (no SSH)
#
# What it does:
#   1. Preflight: verifies prod is up before touching anything
#   2. Hard-syncs repo to origin/main (no partial checkouts)
#   3. Wipes node_modules + .next for a clean slate
#   4. Installs deps, rebuilds natives, generates Prisma, builds Next.js
#   5. Copies standalone assets, restarts PM2 ONLY after successful build
#   6. Verifies localhost + public https endpoints
#
# Safety:
#   - Exits on ANY error (set -euo pipefail)
#   - PM2 restart happens ONLY after a successful build
#   - NO manual config edits (nginx/next.config/etc)
#   - Idempotent: safe to re-run at any time
#
# Requirements (on VPS): git, node 20+, pnpm, pm2, curl
#
# Context: Created after #2605 incident hardening. See docs/OPS/STATE.md.
#

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────────────
REMOTE="${DEPLOY_REMOTE:-dixis-prod}"
ROOT="${DEPLOY_ROOT:-/var/www/dixis/current}"
FE="$ROOT/frontend"
APP="${DEPLOY_PM2_APP:-dixis-frontend}"
NODE_HEAP="${DEPLOY_NODE_HEAP:-2048}"
PROD_URL="${DEPLOY_PROD_URL:-https://dixis.gr}"

# ── Helpers ─────────────────────────────────────────────────────────────────
fail() { echo "FATAL: $*" >&2; exit 1; }

check_http() {
  local label="$1" url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
  echo "  $label: $code"
  [ "$code" = "200" ] || fail "$label returned $code (expected 200)"
}

# ── Preflight (local) ──────────────────────────────────────────────────────
echo "=== PREFLIGHT: prod must be healthy before deploy ==="
check_http "healthz" "$PROD_URL/api/healthz"
check_http "homepage" "$PROD_URL/"
echo ""

# ── Build the SSH command block ─────────────────────────────────────────────
DEPLOY_SCRIPT='
set -euo pipefail

ROOT="'"$ROOT"'"
FE="'"$FE"'"
APP="'"$APP"'"
export NODE_OPTIONS="--max-old-space-size='"$NODE_HEAP"'"

cd "$ROOT"

echo "--- A) Hard sync to origin/main ---"
git fetch --all --prune
git checkout -f main
git reset --hard origin/main
SHA=$(git rev-parse HEAD)
echo "DEPLOY SHA: $SHA"
git log -1 --oneline

echo ""
echo "--- B) Check for tracked drift ---"
TRACKED_DIRTY=$(git status --porcelain | grep -v "^??" || true)
if [ -n "$TRACKED_DIRTY" ]; then
  echo "ERROR: tracked drift detected:"
  echo "$TRACKED_DIRTY"
  exit 1
fi
echo "Working tree clean (tracked files)"

echo ""
echo "--- C) Wipe node_modules + .next ---"
cd "$FE"
rm -rf node_modules .next
echo "Wiped node_modules and .next"

echo ""
echo "--- D) Install dependencies ---"
if [ -f pnpm-lock.yaml ]; then
  echo "Installing from lockfile..."
  pnpm install --frozen-lockfile 2>&1 | tail -10
else
  echo "No lockfile found, installing fresh..."
  pnpm install --no-frozen-lockfile 2>&1 | tail -10
fi

echo ""
echo "--- E) Rebuild native modules ---"
pnpm config set onlyBuiltDependencies "[]" >/dev/null 2>&1 || true
pnpm rebuild 2>&1 | tail -10

echo ""
echo "--- F) Prisma generate + Next.js build ---"
npx prisma generate 2>&1 | tail -3
echo "Building Next.js..."
pnpm build 2>&1 | tail -15

echo ""
echo "--- G) Prepare standalone bundle ---"
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true
echo "Standalone prepared"

echo ""
echo "--- H) Restart PM2 (post-build only) ---"
pm2 restart "$APP"
sleep 5
pm2 ls

echo ""
echo "--- I) Localhost verification ---"
for ep in "/api/healthz" "/" "/og-products.jpg" "/twitter-products.jpg"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1:3000${ep}" || echo "000")
  echo "  localhost${ep}: $CODE"
  if [ "$CODE" != "200" ]; then
    echo "WARN: localhost${ep} returned $CODE"
  fi
done

echo ""
echo "DEPLOY OK SHA=$(git -C "$ROOT" rev-parse HEAD)"
'

# ── Execute ─────────────────────────────────────────────────────────────────
if [ "${SSH_ONLY:-}" = "1" ]; then
  echo "=== DEPLOY (local VPS mode) ==="
  bash -c "$DEPLOY_SCRIPT"
else
  echo "=== DEPLOY (SSH to $REMOTE) ==="
  ssh "$REMOTE" "bash -lc '$DEPLOY_SCRIPT'"
fi

# ── Postflight (local) ─────────────────────────────────────────────────────
echo ""
echo "=== POSTFLIGHT: public https verification ==="
check_http "healthz" "$PROD_URL/api/healthz"
check_http "homepage" "$PROD_URL/"
check_http "og-products" "$PROD_URL/og-products.jpg"
check_http "twitter-products" "$PROD_URL/twitter-products.jpg"

echo ""
echo "DEPLOY COMPLETE"
