#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../../frontend"

echo "=== Dixis Local Bootstrap ==="
echo ""

# 1) .env.local setup
echo "1) Setting up .env.local..."
cp -n .env.example .env.local || true
grep -q '^OTP_BYPASS=' .env.local || echo 'OTP_BYPASS=000000' >> .env.local
grep -q '^ADMIN_PHONES=' .env.local || echo 'ADMIN_PHONES=+306900000084' >> .env.local
grep -q '^DIXIS_ENV=' .env.local || echo 'DIXIS_ENV=local' >> .env.local
echo "   ✅ .env.local configured"

# 2) Install dependencies
echo ""
echo "2) Installing dependencies..."
if [ -f pnpm-lock.yaml ]; then 
  pnpm i --frozen-lockfile 2>/dev/null || pnpm i
elif [ -f yarn.lock ]; then 
  yarn install --frozen-lockfile 2>/dev/null || yarn install
else 
  npm install --no-audit --no-fund
fi
echo "   ✅ Dependencies installed"

# 3) Prisma setup
echo ""
echo "3) Setting up database..."
npx prisma db push --skip-generate
npx prisma generate
echo "   ✅ Database ready"

# 4) Start dev server
echo ""
echo "4) Starting dev server on port ${PORT:-3001}..."
echo "   → http://localhost:${PORT:-3001}"
echo "   → Admin: +306900000084 / 000000"
echo ""
PORT=${PORT:-3001} npm run dev -- -p ${PORT:-3001}
