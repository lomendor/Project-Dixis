#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/frontend"

# Package manager detection
PM="npm"
[ -f pnpm-lock.yaml ] && PM="pnpm"
[ -f yarn.lock ] && PM="yarn"

echo "Using package manager: $PM"

# Install dependencies
echo "Installing dependencies..."
if [ "$PM" = "pnpm" ]; then 
  pnpm i --frozen-lockfile
elif [ "$PM" = "yarn" ]; then 
  yarn install --frozen-lockfile
else 
  npm ci
fi

# Install Playwright browsers with system dependencies
echo "Installing Playwright browsers..."
npx playwright install --with-deps

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate || true

# Build the application
echo "Building application..."
if [ "$PM" = "pnpm" ]; then 
  pnpm build
elif [ "$PM" = "yarn" ]; then 
  yarn build
else 
  npm run build
fi

# Start the server in background
echo "Starting server on :3000..."
if [ "$PM" = "pnpm" ]; then 
  pnpm start &
elif [ "$PM" = "yarn" ]; then 
  yarn start &
else 
  npm start &
fi
APP_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
npx wait-on http://127.0.0.1:3000 -t 60000

# Run Playwright tests
echo "Running Playwright tests..."
export BASE_URL="http://127.0.0.1:3000"
npx playwright test --reporter=line

# Cleanup
echo "Cleaning up..."
kill $APP_PID 2>/dev/null || true
wait $APP_PID 2>/dev/null || true

echo "✓ Playwright tests completed"
