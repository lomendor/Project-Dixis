#!/usr/bin/env bash
set -euo pipefail

# This script fails if the PR diff contains obvious secret leaks.
# It scans only changed lines vs origin/main (or upstream main) to avoid false positives.
BASE_REF="${BASE_REF:-origin/main}"

git fetch origin main >/dev/null 2>&1 || true

DIFF="$(git diff --unified=0 "${BASE_REF}...HEAD")"

# Patterns that should never appear with real values in diffs.
# We allow placeholders like "<redacted>" or "***" by explicitly excluding them.
fail=0
check() {
  local name="$1"
  local pattern="$2"
  local allow_pattern="$3"

  if echo "$DIFF" | rg -n "$pattern" >/dev/null 2>&1; then
    if [[ -n "$allow_pattern" ]] && echo "$DIFF" | rg -n "$pattern" | rg -v "$allow_pattern" >/dev/null 2>&1; then
      echo "❌ Secret leak guard triggered: $name"
      echo "   Found suspicious lines in diff (values redacted by policy)."
      fail=1
    elif [[ -z "$allow_pattern" ]]; then
      echo "❌ Secret leak guard triggered: $name"
      fail=1
    fi
  fi
}

# Disallow committing real env assignments for common secrets.
check "DATABASE_URL assignment" '^\+.*\bDATABASE_URL\s*=' '<redacted>|\*\*\*|REDACTED|example|placeholder'
check "RESEND key assignment" '^\+.*\bRESEND_API_KEY\s*=' '<redacted>|\*\*\*|REDACTED|example|placeholder'
check "JWT/SECRET key assignment" '^\+.*\b(JWT_SECRET|APP_KEY|SECRET_KEY|NEXTAUTH_SECRET)\s*=' '<redacted>|\*\*\*|REDACTED|example|placeholder'
check "Private key block" '^\+.*BEGIN (RSA|OPENSSH|EC) PRIVATE KEY' ''

if [[ "$fail" -eq 1 ]]; then
  echo ""
  echo "Fix: remove secret values from commits. Use environment secrets instead."
  exit 2
fi

echo "✅ Secret leak guard: OK"
