#!/bin/bash
# GUARDRAIL: Ensure no localhost/127.0.0.1 URLs are baked into the production bundle
# This script should run after `pnpm build` to catch mistakes before deploy
#
# Exit code:
#   0 = Clean (no localhost found)
#   1 = FAIL (localhost found in bundle - DO NOT DEPLOY)

set -e

BUNDLE_DIR="${1:-.next/static}"
STANDALONE_DIR=".next/standalone"

echo "🔍 Checking for localhost URLs in client bundle..."
echo "   Directory: $BUNDLE_DIR"

# Patterns that should NEVER appear in production client bundle
FORBIDDEN_PATTERNS=(
    "127\.0\.0\.1:8001"
    "localhost:8001"
    "127\.0\.0\.1:3000"
    "localhost:3000"
    "0\.0\.0\.0:8001"
    "0\.0\.0\.0:3000"
)

FOUND=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    # Search in static chunks
    if [ -d "$BUNDLE_DIR" ]; then
        matches=$(grep -r "$pattern" "$BUNDLE_DIR" 2>/dev/null || true)
        if [ -n "$matches" ]; then
            echo ""
            echo "❌ FOUND forbidden pattern '$pattern' in bundle:"
            echo "$matches" | head -5
            FOUND=1
        fi
    fi

    # Search in standalone output if it exists
    if [ -d "$STANDALONE_DIR" ]; then
        matches=$(grep -r "$pattern" "$STANDALONE_DIR/.next/static" 2>/dev/null || true)
        if [ -n "$matches" ]; then
            echo ""
            echo "❌ FOUND forbidden pattern '$pattern' in standalone bundle:"
            echo "$matches" | head -5
            FOUND=1
        fi
    fi
done

if [ $FOUND -eq 1 ]; then
    echo ""
    echo "=============================================="
    echo "❌ CRITICAL: Localhost URLs found in bundle!"
    echo "=============================================="
    echo ""
    echo "This will cause production to fail."
    echo "Check that NEXT_PUBLIC_API_BASE_URL is set correctly"
    echo "or that the code uses relative URLs for browser."
    echo ""
    exit 1
fi

echo "✅ No localhost URLs found in bundle. Safe to deploy!"
exit 0
