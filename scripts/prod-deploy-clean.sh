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
#   3. Preflight guardrails: drift check, deleted files, ghost deps
#   4. Wipes node_modules + .next for a clean slate
#   5. Installs deps, rebuilds natives, generates Prisma, builds Next.js
#   6. Copies standalone assets, restarts PM2 ONLY after successful build
#   7. Verifies localhost + public https endpoints
#
# Safety:
#   - Exits on ANY error (set -euo pipefail)
#   - PM2 restart happens ONLY after a successful build
#   - NO manual config edits (nginx/next.config/etc)
#   - Idempotent: safe to re-run at any time
#   - Build output captured to /tmp/dixis-deploy.log for failure diagnosis
#
# Requirements (on VPS): git, node 20+, pnpm, pm2, curl
#
# Context: Created after #2605 incident hardening. See docs/OPS/DEPLOY.md.
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
fail() { echo ""; echo "STOP: $*" >&2; exit 1; }

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
LOGFILE="/tmp/dixis-deploy.log"
export NODE_OPTIONS="--max-old-space-size='"$NODE_HEAP"'"

# ── Failure trap: print last 80 lines of build log + SHA ──
on_fail() {
  echo ""
  echo "=========================================="
  echo "STOP: Deploy failed. Diagnostics below."
  echo "=========================================="
  echo "Current SHA: $(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
  echo "PM2 status:"
  pm2 ls 2>/dev/null || true
  if [ -f "$LOGFILE" ]; then
    echo ""
    echo "--- Last 80 lines of $LOGFILE ---"
    tail -80 "$LOGFILE"
  fi
  echo ""
  echo "STOP: Fix the issue above, then re-run this script."
}
trap on_fail ERR

# Start logging
echo "Deploy started at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$LOGFILE"

cd "$ROOT"

echo "--- A) Hard sync to origin/main ---"
git fetch --all --prune 2>&1 | tee -a "$LOGFILE"
git checkout -f main 2>&1 | tee -a "$LOGFILE"
git reset --hard origin/main 2>&1 | tee -a "$LOGFILE"
SHA=$(git rev-parse HEAD)
echo "DEPLOY SHA: $SHA" | tee -a "$LOGFILE"
git log -1 --oneline | tee -a "$LOGFILE"

# Write deploy metadata for healthz endpoint
echo "{\"sha\":\"${SHA}\",\"deployedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$FE/.deploy-meta.json"
echo "Deploy metadata written to .deploy-meta.json"

echo ""
echo "--- B) Preflight guardrails ---"

# B1: Tracked drift check
TRACKED_DIRTY=$(git status --porcelain | grep -v "^??" || true)
if [ -n "$TRACKED_DIRTY" ]; then
  echo "STOP: Tracked file drift detected after git reset --hard." | tee -a "$LOGFILE"
  echo "Dirty files:" | tee -a "$LOGFILE"
  echo "$TRACKED_DIRTY" | tee -a "$LOGFILE"
  echo "" | tee -a "$LOGFILE"
  echo "Fix: run  git reset --hard origin/main  and retry." | tee -a "$LOGFILE"
  exit 1
fi
echo "  tracked drift: clean"

# B2: Deleted tracked files (catches partial checkout bugs)
DELETED=$(git ls-files --deleted)
if [ -n "$DELETED" ]; then
  DELETED_COUNT=$(echo "$DELETED" | wc -l | tr -d " ")
  echo "STOP: $DELETED_COUNT tracked files missing from disk." | tee -a "$LOGFILE"
  echo "First 20:" | tee -a "$LOGFILE"
  echo "$DELETED" | head -20 | tee -a "$LOGFILE"
  echo "" | tee -a "$LOGFILE"
  echo "Fix: run  git reset --hard origin/main  (not git checkout -f)." | tee -a "$LOGFILE"
  exit 1
fi
echo "  deleted tracked files: none"

# B3: Ghost @types/sharp (caused #2605 build failure)
cd "$FE"
if [ -d "node_modules/.pnpm/@types+sharp@0.32.0" ] || [ -d "node_modules/@types/sharp" ]; then
  echo "WARN: Ghost @types/sharp detected in node_modules." | tee -a "$LOGFILE"
  echo "      This was NOT in package.json and caused TS build errors." | tee -a "$LOGFILE"
  echo "      Will be cleaned by node_modules wipe below." | tee -a "$LOGFILE"
fi

# B4: VPS config drift check (next.config must not have ignoreBuildErrors)
if grep -q "ignoreBuildErrors" "$FE/next.config.ts" 2>/dev/null; then
  echo "STOP: next.config.ts contains ignoreBuildErrors." | tee -a "$LOGFILE"
  echo "      This is a VPS-only hack that should not exist." | tee -a "$LOGFILE"
  echo "      The git reset --hard above should have fixed it." | tee -a "$LOGFILE"
  echo "Fix: run  git reset --hard origin/main  and retry." | tee -a "$LOGFILE"
  exit 1
fi
echo "  next.config.ts drift: clean"

echo "Preflight guardrails: ALL PASS"

echo ""
echo "--- C) Wipe node_modules + .next ---"
rm -rf node_modules .next
echo "Wiped node_modules and .next"

echo ""
echo "--- D) Install dependencies ---"
# Ensure pnpm allows build scripts for native modules
pnpm config set onlyBuiltDependencies "[]" >/dev/null 2>&1 || true

if [ -f pnpm-lock.yaml ]; then
  echo "Installing from lockfile..."
  pnpm install --frozen-lockfile 2>&1 | tee -a "$LOGFILE" | tail -10
else
  echo "No lockfile found, installing fresh..."
  pnpm install --no-frozen-lockfile 2>&1 | tee -a "$LOGFILE" | tail -10
fi

echo ""
echo "--- E) Rebuild native modules ---"
pnpm rebuild 2>&1 | tee -a "$LOGFILE" | tail -10

echo ""
echo "--- F) Post-install sanity ---"
# Verify no ghost @types/sharp crept back in
if [ -d "node_modules/@types/sharp" ]; then
  echo "STOP: @types/sharp appeared after fresh install." | tee -a "$LOGFILE"
  echo "      Check package.json for accidental dependency." | tee -a "$LOGFILE"
  exit 1
fi
echo "  post-install sanity: clean"

echo ""
echo "--- G) Prisma generate + migrate + Next.js build ---"
npx prisma generate 2>&1 | tee -a "$LOGFILE" | tail -3
echo "Running migrations (idempotent)..."
npx prisma migrate deploy 2>&1 | tee -a "$LOGFILE" | tail -5

echo ""
echo "--- G2) Validate environment ---"
if [ -f "scripts/validate-env.ts" ]; then
  npx tsx scripts/validate-env.ts 2>&1 | tee -a "$LOGFILE"
else
  echo "WARN: validate-env.ts not found, skipping validation" | tee -a "$LOGFILE"
fi

echo "Building Next.js..."
pnpm build 2>&1 | tee -a "$LOGFILE" | tail -15

echo ""
echo "--- H) Prepare standalone bundle ---"
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true
cp .deploy-meta.json .next/standalone/ 2>/dev/null || true
echo "Standalone prepared"

echo ""
echo "--- I) Restart PM2 (post-build only) ---"
pm2 restart "$APP"
sleep 5
pm2 ls

echo ""
echo "--- J) Localhost verification ---"
for ep in "/api/healthz" "/" "/og-products.jpg" "/twitter-products.jpg"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1:3000${ep}" || echo "000")
  echo "  localhost${ep}: $CODE"
  if [ "$CODE" != "200" ]; then
    echo "WARN: localhost${ep} returned $CODE"
  fi
done

echo ""
echo "DEPLOY OK SHA=$(git -C "$ROOT" rev-parse HEAD)"
echo "Build log: $LOGFILE"
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
