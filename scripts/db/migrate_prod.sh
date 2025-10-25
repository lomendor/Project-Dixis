#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo "  Dixis — Production Migration Script"
echo "========================================"
echo ""

# Verify DATABASE_URL is set
: "${DATABASE_URL:?❌ ERROR: DATABASE_URL environment variable is required}"
export PRISMA_HIDE_UPDATE_MESSAGE=1

echo "Database URL: ${DATABASE_URL:0:20}...${DATABASE_URL: -10}"
echo ""
echo "⚠️  WARNING: This will run migrations on PRODUCTION database!"
echo ""

# Double confirmation
read -r -p "Type EXACTLY 'DIXIS-PROD-OK' to proceed: " CONFIRM
if [[ "${CONFIRM:-}" != "DIXIS-PROD-OK" ]]; then
  echo "❌ Confirmation failed. Migration aborted."
  exit 1
fi

echo ""
echo "✓ Confirmation received. Starting migration..."
echo ""

# Navigate to frontend directory
cd "$(git rev-parse --show-toplevel)/frontend" || exit 1

echo "→ Step 1/4: Prisma generate"
pnpm prisma generate

echo ""
echo "→ Step 2/4: Prisma migrate deploy (PRODUCTION)"
pnpm prisma migrate deploy

echo ""
echo "→ Step 3/4: Prisma migrate status"
pnpm prisma migrate status

echo ""
echo "→ Step 4/4: Prisma validate"
pnpm prisma validate

echo ""
echo "========================================"
echo "  ✅ Production migration completed!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Verify application health endpoints"
echo "  2. Check application logs for errors"
echo "  3. Test critical user flows"
echo "  4. Monitor database performance"
echo ""
