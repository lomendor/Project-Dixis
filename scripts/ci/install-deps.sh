#!/usr/bin/env bash
set -euo pipefail
WD="${1:-.}"
cd "$WD"
PM="npm"
if [ -f pnpm-lock.yaml ]; then PM="pnpm"
elif [ -f yarn.lock ]; then PM="yarn"
fi
echo "⚙️ Using package manager: $PM in $WD"
case "$PM" in
  pnpm)
    corepack enable || true
    npm i -g pnpm >/dev/null 2>&1 || true
    pnpm i --frozen-lockfile
    ;;
  yarn)
    corepack enable || true
    if yarn -v | grep -qE '^(3|4)\.'; then
      yarn install --immutable
    else
      yarn install --frozen-lockfile
    fi
    ;;
  npm)
    if [ -f package-lock.json ]; then npm ci; else npm i --no-audit --no-fund; fi
    ;;
esac
