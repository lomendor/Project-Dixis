#!/usr/bin/env bash
set -euo pipefail

# Playwright CI script - runs full test suite with all setup
# Pass 106c: Comprehensive test runner for PR workflows

echo "🎭 Playwright CI Runner - Full Test Suite"
echo "=========================================="

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then
  PM="pnpm"
  PM_INSTALL="pnpm install --frozen-lockfile"
elif [ -f "package-lock.json" ]; then
  PM="npm"
  PM_INSTALL="npm ci"
elif [ -f "yarn.lock" ]; then
  PM="yarn"
  PM_INSTALL="yarn install --frozen-lockfile"
else
  echo "❌ No lockfile found"
  exit 1
fi

echo "📦 Package Manager: $PM"

# Prisma setup
echo "🔧 Setting up Prisma..."
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts || echo "⚠️ Seed failed (may be expected)"

# Optional: S3/MinIO matrix support (if STORAGE_DRIVER=s3)
if [ "${STORAGE_DRIVER:-fs}" = "s3" ]; then
  echo "☁️ S3 mode detected - ensuring MinIO bucket..."
  pip install --user awscli >/dev/null 2>&1 || true
  export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-minioadmin}"
  export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:-minioadmin}"
  aws --endpoint-url "${S3_ENDPOINT:-http://localhost:9000}" s3api create-bucket \
    --bucket "${S3_BUCKET:-dixis-media}" \
    --region "${S3_REGION:-us-east-1}" \
    --create-bucket-configuration LocationConstraint="${S3_REGION:-us-east-1}" 2>/dev/null || true
  echo "✅ S3 bucket ready"
fi

# Start Next.js app if not already running
if ! curl -sf "${BASE_URL:-http://127.0.0.1:3000}" >/dev/null 2>&1; then
  echo "🚀 Starting Next.js app..."
  nohup npm run start -- -p 3000 > /tmp/app.log 2>&1 &
  npx --yes wait-on "${BASE_URL:-http://127.0.0.1:3000}" --timeout 120000
  echo "✅ Next.js app ready"
else
  echo "✅ Next.js app already running"
fi

# Run full Playwright test suite
echo "🧪 Running Playwright test suite..."
npx playwright test --reporter=list

echo "✅ All tests completed successfully"
