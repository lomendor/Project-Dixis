#!/bin/bash
# Safe Playwright test runner with grep fallback
# Usage: ./scripts/safe-playwright-grep.sh "pattern"

set -e

GREP_PATTERN="$1"

if [ -z "$GREP_PATTERN" ]; then
    echo "❌ Error: Missing grep pattern argument"
    echo "Usage: $0 \"pattern\""
    exit 1
fi

echo "🔍 Running Playwright tests with pattern: $GREP_PATTERN"

# Run playwright with grep, capture output and exit code
OUTPUT=$(npx playwright test --grep="$GREP_PATTERN" 2>&1) || EXIT_CODE=$?

# Check if no tests were found (specific case we want to handle gracefully)
if [ ${EXIT_CODE:-0} -eq 1 ] && echo "$OUTPUT" | grep -q "Error: No tests found"; then
    echo "⚠️  No tests found matching pattern '$GREP_PATTERN'"
    echo "ℹ️  This is expected if no integration tests exist yet"
    echo "✅ Exiting gracefully (0) to allow CI to continue"
    exit 0
fi

# If there was a different error, bubble it up
if [ ${EXIT_CODE:-0} -ne 0 ]; then
    echo "❌ Playwright tests failed with exit code: $EXIT_CODE"
    echo "$OUTPUT"
    exit $EXIT_CODE
fi

# Tests passed successfully
echo "✅ All tests matching '$GREP_PATTERN' passed"
echo "$OUTPUT"
exit 0