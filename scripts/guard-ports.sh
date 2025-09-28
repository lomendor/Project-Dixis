#!/usr/bin/env bash
set -euo pipefail

echo "🔍 PORT GUARD: Checking for disallowed hardcoded ports..."

# Disallowed patterns in CI/workflows/tests
disallowed=':3000[^0-9]|:3010[^0-9]'

# Search in critical areas
hits=$(rg -n "$disallowed" .github/workflows frontend/tests frontend/package.json frontend/playwright.config.ts -S 2>/dev/null || true)

if [ -n "$hits" ]; then
    echo "❌ Disallowed hardcoded ports found:"
    echo "$hits"
    echo ""
    echo "RULE: Use FRONTEND_PORT env var in CI, PLAYWRIGHT_BASE_URL in tests"
    echo "ALLOWED: :8001 (API), :3001 (local dev), :3030 (CI)"
    exit 1
fi

echo "✅ No disallowed hardcoded ports detected"