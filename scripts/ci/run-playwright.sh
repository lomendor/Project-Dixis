#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/frontend"

# Default test env
export BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
export OTP_BYPASS="${OTP_BYPASS:-000000}"
export PW_TEST_HTML_REPORT=1

# Package manager
PM="npm"; [ -f pnpm-lock.yaml ] && PM="pnpm"; [ -f yarn.lock ] && PM="yarn"

# Install (fresh if node_modules λείπει)
if [ "$PM" = "pnpm" ]; then pnpm i --frozen-lockfile
elif [ "$PM" = "yarn" ]; then yarn install --frozen-lockfile
else npm ci
fi

# Playwright deps & browsers
npx playwright install --with-deps

# Database setup (if DATABASE_URL exists)
if [ -n "${DATABASE_URL:-}" ]; then
  echo "▶ Waiting for Postgres on tcp:5432..."
  npx wait-on tcp:127.0.0.1:5432
  echo "▶ Running Prisma migrations..."
  npx prisma migrate deploy
  echo "▶ Seeding database..."
  npm run -s db:seed || true
fi

# Build & start app
npx prisma generate || true
if [ "$PM" = "pnpm" ]; then pnpm build; pnpm start &
elif [ "$PM" = "yarn" ]; then yarn build; yarn start &
else npm run build; npm start &
fi
APP_PID=$!

# Wait until server is up
npx wait-on "$BASE_URL"

# Run full suite via config
npx playwright test --config=playwright.config.ts

# Teardown
kill $APP_PID || true
