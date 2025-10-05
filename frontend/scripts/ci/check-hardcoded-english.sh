#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Checking for hardcoded English UI strings..."

fail=0
# Pattern for common English UI words that should be in translation files
PATTERN='(Search|Filter|Filters|Region|Category|Submit|Cancel|Home|Producers|Loading|Error)'

# Find all TSX/JSX/TS/JS files, excluding translation files and test files
FILES=$(git ls-files 'frontend/src/**/*.{tsx,jsx,ts,js}' 2>/dev/null || find frontend/src -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) 2>/dev/null || echo "")

# Exclude patterns
EXCLUDE_PATTERN='(messages/.*\.json|\.test\.|\.spec\.|__tests__|node_modules)'

if [ -n "$FILES" ]; then
  # Check each file
  while IFS= read -r file; do
    # Skip excluded files
    if echo "$file" | grep -qE "$EXCLUDE_PATTERN"; then
      continue
    fi

    # Check for hardcoded English strings
    MATCHES=$(grep -nE "['\">\s]($PATTERN)['\"<\s]" "$file" 2>/dev/null | grep -v "^\s*//" || true)

    if [ -n "$MATCHES" ]; then
      if [ $fail -eq 0 ]; then
        echo ""
        echo "❌ Hardcoded English UI strings detected:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      fi
      echo ""
      echo "📄 $file:"
      echo "$MATCHES" | head -5
      fail=1
    fi
  done <<< "$FILES"
fi

if [ $fail -eq 1 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "⚠️  Please use translation keys instead of hardcoded strings."
  echo "   Example: t('home.title') instead of 'Home'"
  echo ""
  echo "   Add strings to frontend/messages/el.json and frontend/messages/en.json"
  echo ""
  exit 1
else
  echo "✅ No hardcoded English UI strings detected."
  exit 0
fi
