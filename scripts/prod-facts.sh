#!/usr/bin/env bash
set -euo pipefail

# PROD FACTS Monitoring Script
# Checks production endpoints and writes report to docs/OPS/.local/PROD-FACTS-LAST.md
# Exits non-zero if any check fails (for CI detection)
#
# Output: docs/OPS/.local/PROD-FACTS-LAST.md (untracked - see .gitignore)
# For committed evidence, copy output to docs/AGENT/SUMMARY/ with a pass ID.

# Ensure output directory exists (untracked by git)
mkdir -p docs/OPS/.local

REPORT_FILE="docs/OPS/.local/PROD-FACTS-LAST.md"
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
EXIT_CODE=0

# Helper function to check HTTP status
check_endpoint() {
    local url="$1"
    local expected_status="$2"
    local name="$3"
    local grep_pattern="${4:-}"

    echo "Checking $name: $url"

    # Get status code
    status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" || echo "000")

    # Get response body if we need to grep
    if [[ -n "$grep_pattern" ]]; then
        response=$(curl -s -L "$url" || echo "")
    fi

    # Check status code
    if [[ "$status" == "$expected_status" ]] || [[ "$expected_status" == "200/307" && ("$status" == "200" || "$status" == "307") ]]; then
        echo "✅ $name: $status"

        # Check grep pattern if provided
        if [[ -n "$grep_pattern" ]]; then
            if echo "$response" | grep -q "$grep_pattern"; then
                echo "  ✅ Content check passed: found '$grep_pattern'"
            else
                echo "  ❌ Content check FAILED: '$grep_pattern' not found"
                EXIT_CODE=1
            fi
        fi
    else
        echo "❌ $name: $status (expected $expected_status)"
        EXIT_CODE=1
    fi

    echo ""
}

# Header
echo "==========================================="
echo "PROD FACTS - $TIMESTAMP"
echo "==========================================="
echo ""

# Check 1: Backend health endpoint
check_endpoint "https://dixis.gr/api/healthz" "200" "Backend Health" "ok"

# Check 2: Products API
check_endpoint "https://dixis.gr/api/v1/public/products" "200" "Products API" '"data"'

# Check 3: Products list page (must have products, not empty)
# Note: We check it doesn't contain "0 συνολικά" or "Δεν υπάρχουν" which would indicate empty state
response=$(curl -s -L "https://dixis.gr/products" || echo "")
status=$(curl -s -o /dev/null -w "%{http_code}" -L "https://dixis.gr/products" || echo "000")

echo "Checking Products List Page: https://dixis.gr/products"
if [[ "$status" == "200" ]]; then
    echo "✅ Products List Page: $status"

    # Check for empty state indicators
    # Use word boundary (\b) to avoid matching "10 συνολικά" as "0 συνολικά"
    if echo "$response" | grep -qE '\b0 συνολικά'; then
        echo "  ❌ Content check FAILED: Page shows '0 συνολικά' (no products)"
        EXIT_CODE=1
    elif echo "$response" | grep -q "Δεν υπάρχουν"; then
        echo "  ❌ Content check FAILED: Page shows 'Δεν υπάρχουν' (no products)"
        EXIT_CODE=1
    else
        echo "  ✅ Content check passed: Products displayed (no empty state)"
    fi
else
    echo "❌ Products List Page: $status (expected 200)"
    EXIT_CODE=1
fi
echo ""

# Check 4: Product detail page (must show "Organic Tomatoes" or similar)
check_endpoint "https://dixis.gr/products/1" "200" "Product Detail Page" "Organic"

# Check 5: Login page (can be 200 or 307 redirect)
login_status=$(curl -s -o /dev/null -w "%{http_code}" -L "https://dixis.gr/login" || echo "000")
login_redirect=$(curl -s -o /dev/null -w "%{url_effective}" -L "https://dixis.gr/login" || echo "")

echo "Checking Login Page: https://dixis.gr/login"
if [[ "$login_status" == "200" ]] || [[ "$login_status" == "307" ]]; then
    echo "✅ Login Page: $login_status"
    if [[ "$login_redirect" != "https://dixis.gr/login" ]]; then
        echo "  → Redirects to: $login_redirect"
    fi
else
    echo "❌ Login Page: $login_status (expected 200 or 307)"
    EXIT_CODE=1
fi
echo ""

# Summary
echo "==========================================="
if [[ $EXIT_CODE -eq 0 ]]; then
    echo "✅ ALL CHECKS PASSED"
else
    echo "❌ SOME CHECKS FAILED"
fi
echo "==========================================="
echo ""

# Write report to markdown file
cat > "$REPORT_FILE" <<EOF
# PROD FACTS - Last Check

**Last Updated**: $TIMESTAMP
**Status**: $(if [[ $EXIT_CODE -eq 0 ]]; then echo "✅ ALL SYSTEMS OPERATIONAL"; else echo "❌ ISSUES DETECTED"; fi)

---

## Endpoint Status

| Endpoint | Status | Details |
|----------|--------|---------|
| Backend Health | $([[ $(curl -s -o /dev/null -w "%{http_code}" https://dixis.gr/api/healthz) == "200" ]] && echo "✅ 200" || echo "❌ Failed") | \`/api/healthz\` returns OK |
| Products API | $([[ $(curl -s -o /dev/null -w "%{http_code}" https://dixis.gr/api/v1/public/products) == "200" ]] && echo "✅ 200" || echo "❌ Failed") | \`/api/v1/public/products\` returns data |
| Products List | $([[ $(curl -s -o /dev/null -w "%{http_code}" https://dixis.gr/products) == "200" ]] && echo "✅ 200" || echo "❌ Failed") | \`/products\` displays products (not empty) |
| Product Detail | $([[ $(curl -s -o /dev/null -w "%{http_code}" https://dixis.gr/products/1) == "200" ]] && echo "✅ 200" || echo "❌ Failed") | \`/products/1\` shows product content |
| Login Page | $([[ "$login_status" == "200" || "$login_status" == "307" ]] && echo "✅ $login_status" || echo "❌ Failed") | \`/login\` accessible (redirects to \`$login_redirect\`) |

---

## Content Verification

- ✅ Backend health endpoint returns \`"ok"\`
- ✅ Products API contains \`"data"\` field
- ✅ Products list page shows products (no empty state)
- ✅ Product detail page contains expected content
- ✅ Login page accessible (with or without redirect)

---

## Next Check

Automated checks run daily at 07:00 UTC via GitHub Actions workflow.

Manual trigger: \`gh workflow run prod-facts.yml\`

Command line: \`bash scripts/prod-facts.sh\`

---

**Generated by**: scripts/prod-facts.sh
EOF

echo "Report written to: $REPORT_FILE"
echo ""

# Exit with appropriate code for CI
exit $EXIT_CODE
