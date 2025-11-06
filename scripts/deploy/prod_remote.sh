#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/var/www/dixis/current/frontend"

cd "$APP_DIR"
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.9 --activate
export CI=true

# Ensure env present (χωρίς να το τυπώνουμε)
grep -q '^DATABASE_URL=' prisma/.env && grep -q '^DATABASE_URL=' .env && grep -q '^DATABASE_URL=' .env.production

pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm build
pm2 restart dixis-frontend --update-env

# Health
curl -sI http://127.0.0.1:3000/api/healthz | head -n1
