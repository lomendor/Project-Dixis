#!/usr/bin/env bash
set -euo pipefail

# V1 Production QA Script
# Deterministic curl-based checks for V1 proof
# Pass ID: V1-QA-PROD-PROOF-01

BASE_URL="https://dixis.gr"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PASS_COUNT=0
FAIL_COUNT=0
RESULTS=()

# Color codes (optional, degrades gracefully)
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_pass() {
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("✅ PASS: $1")
    echo -e "${GREEN}✅ PASS${NC}: $1"
}

log_fail() {
    FAIL_COUNT=$((FAIL_COUNT + 1))
    RESULTS+=("❌ FAIL: $1")
    echo -e "${RED}❌ FAIL${NC}: $1"
}

echo "==========================================="
echo "V1 PRODUCTION QA - $TIMESTAMP"
echo "Base URL: $BASE_URL"
echo "==========================================="
echo ""

# ─────────────────────────────────────────────
# A) Health + Public Endpoints
# ─────────────────────────────────────────────
echo "=== A) Health + Public Endpoints ==="
echo ""

# A1: Backend Health
echo "A1: Backend Health (/api/healthz)"
HEALTH_RESPONSE=$(curl -sf "$BASE_URL/api/healthz" 2>/dev/null || echo '{"error":"failed"}')
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"ok"' || echo "")

if [[ -n "$HEALTH_STATUS" ]]; then
    log_pass "Backend health returns ok"
    echo "    Response: $(echo "$HEALTH_RESPONSE" | head -c 100)..."
else
    log_fail "Backend health check failed"
    echo "    Response: $HEALTH_RESPONSE"
fi
echo ""

# A2: Products API
echo "A2: Products API (/api/v1/public/products)"
PRODUCTS_RESPONSE=$(curl -sf "$BASE_URL/api/v1/public/products" 2>/dev/null || echo '{"error":"failed"}')
PRODUCTS_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":' | wc -l | tr -d ' ')

if [[ "$PRODUCTS_COUNT" -gt 0 ]]; then
    log_pass "Products API returns $PRODUCTS_COUNT products"
    FIRST_PRODUCT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"name":"[^"]*"' | head -1 || echo "")
    echo "    First product: $FIRST_PRODUCT"
else
    log_fail "Products API returned no products"
fi
echo ""

# A3: Products Page (HTML)
echo "A3: Products Page (/products)"
PRODUCTS_PAGE_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/products" 2>/dev/null || echo "000")

if [[ "$PRODUCTS_PAGE_STATUS" == "200" ]]; then
    log_pass "Products page returns HTTP 200"
else
    log_fail "Products page returned HTTP $PRODUCTS_PAGE_STATUS"
fi
echo ""

# ─────────────────────────────────────────────
# B) Auth Smoke (credential-safe)
# ─────────────────────────────────────────────
echo "=== B) Auth Smoke Tests ==="
echo ""

# B1: Login endpoint exists (expect 422 for empty body, or 302 redirect to web)
echo "B1: Login endpoint (/api/v1/auth/login)"
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{}' 2>/dev/null)

if [[ "$LOGIN_STATUS" == "422" || "$LOGIN_STATUS" == "400" ]]; then
    log_pass "Login endpoint responds (HTTP $LOGIN_STATUS for empty body - expected)"
elif [[ "$LOGIN_STATUS" == "302" || "$LOGIN_STATUS" == "301" ]]; then
    log_pass "Login endpoint responds (HTTP $LOGIN_STATUS redirect - API exists)"
elif [[ "$LOGIN_STATUS" == "200" ]]; then
    log_fail "Login endpoint accepted empty body (unexpected)"
else
    log_fail "Login endpoint returned unexpected HTTP $LOGIN_STATUS"
fi
echo ""

# B2: Register endpoint exists (expect 422 for empty body)
echo "B2: Register endpoint (/api/v1/auth/register)"
REGISTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{}' 2>/dev/null)

if [[ "$REGISTER_STATUS" == "422" || "$REGISTER_STATUS" == "400" ]]; then
    log_pass "Register endpoint responds (HTTP $REGISTER_STATUS for empty body - expected)"
elif [[ "$REGISTER_STATUS" == "302" || "$REGISTER_STATUS" == "301" ]]; then
    log_pass "Register endpoint responds (HTTP $REGISTER_STATUS redirect - API exists)"
elif [[ "$REGISTER_STATUS" == "200" ]]; then
    log_fail "Register endpoint accepted empty body (unexpected)"
else
    log_fail "Register endpoint returned unexpected HTTP $REGISTER_STATUS"
fi
echo ""

# B3: Auth with credentials (only if QA_EMAIL and QA_PASSWORD are set)
TOKEN=""
if [[ -n "${QA_EMAIL:-}" && -n "${QA_PASSWORD:-}" ]]; then
    echo "B3: Login with QA credentials"
    LOGIN_RESPONSE=$(curl -sf -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$QA_EMAIL\",\"password\":\"$QA_PASSWORD\"}" 2>/dev/null || echo '{"error":"failed"}')
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//' || echo "")

    if [[ -n "$TOKEN" && "$TOKEN" != "null" ]]; then
        log_pass "Login successful, token obtained"
        echo "    Token: ${TOKEN:0:20}..."
    else
        log_fail "Login failed with QA credentials"
        echo "    Response: $LOGIN_RESPONSE"
    fi
else
    echo "B3: SKIPPED (QA_EMAIL/QA_PASSWORD not set)"
    echo "    Set env vars to enable auth tests"
fi
echo ""

# ─────────────────────────────────────────────
# C) Cart Proof (only with valid token)
# ─────────────────────────────────────────────
echo "=== C) Cart Tests ==="
echo ""

if [[ -n "$TOKEN" ]]; then
    # C1: Get cart (should work even if empty)
    echo "C1: Get cart (/api/v1/cart/items)"
    CART_RESPONSE=$(curl -sf "$BASE_URL/api/v1/cart/items" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" 2>/dev/null || echo '{"error":"failed"}')
    CART_STATUS=$(echo "$CART_RESPONSE" | grep -o '"error"' || echo "")

    if [[ -z "$CART_STATUS" ]]; then
        log_pass "Cart endpoint accessible"
        CART_ITEMS=$(echo "$CART_RESPONSE" | grep -o '"id":' | wc -l | tr -d ' ')
        echo "    Current items: $CART_ITEMS"
    else
        log_fail "Cart endpoint failed"
        echo "    Response: $CART_RESPONSE"
    fi
    echo ""

    # C2: Cart sync endpoint exists
    echo "C2: Cart sync (/api/v1/cart/sync)"
    SYNC_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/cart/sync" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"items":[]}' 2>/dev/null || echo "000")

    if [[ "$SYNC_STATUS" == "200" || "$SYNC_STATUS" == "201" ]]; then
        log_pass "Cart sync endpoint accessible (HTTP $SYNC_STATUS)"
    else
        log_fail "Cart sync returned HTTP $SYNC_STATUS"
    fi
else
    echo "C1-C2: SKIPPED (no auth token)"
    echo "    Set QA_EMAIL/QA_PASSWORD to enable cart tests"
fi
echo ""

# ─────────────────────────────────────────────
# D) Password Reset Trigger
# ─────────────────────────────────────────────
echo "=== D) Password Reset ==="
echo ""

# D1: Forgot password endpoint (trigger only, no inbox verify)
echo "D1: Forgot password (/api/v1/auth/password/forgot)"
TEST_EMAIL="${QA_EMAIL:-qa-proof-test@dixis.gr}"
FORGOT_RESPONSE=$(curl -sf -X POST "$BASE_URL/api/v1/auth/password/forgot" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\"}" 2>/dev/null || echo '{"error":"failed"}')
FORGOT_MESSAGE=$(echo "$FORGOT_RESPONSE" | grep -o '"message":"[^"]*"' | head -1 || echo "")

if [[ -n "$FORGOT_MESSAGE" ]]; then
    log_pass "Password reset endpoint responds"
    echo "    Response: $FORGOT_MESSAGE"
    echo "    Timestamp: $TIMESTAMP"
    echo "    Note: Email delivery is NOT verified (inbox check required separately)"
else
    log_fail "Password reset endpoint failed"
    echo "    Response: $FORGOT_RESPONSE"
fi
echo ""

# ─────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────
echo "==========================================="
echo "SUMMARY"
echo "==========================================="
echo ""
echo "Timestamp: $TIMESTAMP"
echo "Total Checks: $((PASS_COUNT + FAIL_COUNT))"
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

for result in "${RESULTS[@]}"; do
    echo "  $result"
done

echo ""
if [[ $FAIL_COUNT -eq 0 ]]; then
    echo "==========================================="
    echo "✅ V1 PRODUCTION QA: ALL PASS"
    echo "==========================================="
    exit 0
else
    echo "==========================================="
    echo "❌ V1 PRODUCTION QA: $FAIL_COUNT FAILURES"
    echo "==========================================="
    exit 1
fi
