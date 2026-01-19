#!/bin/bash
# Pass PERF-COLD-START-01: Performance Baseline Script
# Measures TTFB and total time for key endpoints
# Usage: bash scripts/perf-baseline.sh

set -e

# Force C locale for consistent number formatting
export LC_ALL=C
export LANG=C

SAMPLES=10
BASE_URL="${BASE_URL:-https://dixis.gr}"

# URLs to test
URLS=(
    "/"
    "/products"
    "/api/v1/public/products"
)

# curl format string
FORMAT='%{http_code},%{time_namelookup},%{time_connect},%{time_appconnect},%{time_starttransfer},%{time_total}\n'

echo "=================================="
echo "Performance Baseline - $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Base URL: $BASE_URL"
echo "Samples per URL: $SAMPLES"
echo "=================================="
echo ""

for URL in "${URLS[@]}"; do
    FULL_URL="${BASE_URL}${URL}"
    echo "Testing: $FULL_URL"
    echo "---"

    # Collect samples
    TTFB_VALUES=()
    TOTAL_VALUES=()

    for i in $(seq 1 $SAMPLES); do
        RESULT=$(curl -sS -o /dev/null -w "$FORMAT" "$FULL_URL" 2>/dev/null || echo "000,0,0,0,0,0")

        HTTP_CODE=$(echo "$RESULT" | cut -d',' -f1)
        TIME_NAMELOOKUP=$(echo "$RESULT" | cut -d',' -f2)
        TIME_CONNECT=$(echo "$RESULT" | cut -d',' -f3)
        TIME_APPCONNECT=$(echo "$RESULT" | cut -d',' -f4)
        TIME_STARTTRANSFER=$(echo "$RESULT" | cut -d',' -f5)
        TIME_TOTAL=$(echo "$RESULT" | cut -d',' -f6 | tr -d '\n')

        # Convert to milliseconds
        TTFB_MS=$(echo "$TIME_STARTTRANSFER * 1000" | bc 2>/dev/null || echo "0")
        TOTAL_MS=$(echo "$TIME_TOTAL * 1000" | bc 2>/dev/null || echo "0")

        TTFB_VALUES+=("$TTFB_MS")
        TOTAL_VALUES+=("$TOTAL_MS")

        printf "  Sample %2d: HTTP=%s TTFB=%6.0fms Total=%6.0fms\n" "$i" "$HTTP_CODE" "$TTFB_MS" "$TOTAL_MS"
    done

    # Calculate min/median/max for TTFB
    SORTED_TTFB=($(printf '%s\n' "${TTFB_VALUES[@]}" | sort -n))
    TTFB_MIN=${SORTED_TTFB[0]}
    TTFB_MAX=${SORTED_TTFB[$((SAMPLES-1))]}
    TTFB_MEDIAN=${SORTED_TTFB[$((SAMPLES/2))]}

    # Calculate min/median/max for Total
    SORTED_TOTAL=($(printf '%s\n' "${TOTAL_VALUES[@]}" | sort -n))
    TOTAL_MIN=${SORTED_TOTAL[0]}
    TOTAL_MAX=${SORTED_TOTAL[$((SAMPLES-1))]}
    TOTAL_MEDIAN=${SORTED_TOTAL[$((SAMPLES/2))]}

    echo ""
    echo "  Summary:"
    printf "    TTFB:  min=%6.0fms  median=%6.0fms  max=%6.0fms\n" "$TTFB_MIN" "$TTFB_MEDIAN" "$TTFB_MAX"
    printf "    Total: min=%6.0fms  median=%6.0fms  max=%6.0fms\n" "$TOTAL_MIN" "$TOTAL_MEDIAN" "$TOTAL_MAX"
    echo ""
done

echo "=================================="
echo "Baseline complete"
echo "=================================="
