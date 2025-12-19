#!/usr/bin/env bash
set -euo pipefail

HAS_RG=0
command -v rg >/dev/null 2>&1 && HAS_RG=1

ts="$(date -u +"%Y-%m-%d %H:%M:%SZ")"

code() { curl -sS -o /dev/null -w "%{http_code}" "$1" || true; }
redir() { curl -sS -o /dev/null -w "%{redirect_url}" "$1" || true; }

HEALTHZ="$(code https://dixis.gr/api/healthz)"
API_PRODUCTS="$(code https://dixis.gr/api/v1/public/products)"
PRODUCTS_LIST="$(code https://dixis.gr/products)"
PRODUCT_1="$(code https://dixis.gr/products/1)"
LOGIN="$(code https://dixis.gr/login)"
REGISTER="$(code https://dixis.gr/register)"
AUTH_LOGIN="$(code https://dixis.gr/auth/login)"
AUTH_REGISTER="$(code https://dixis.gr/auth/register)"

LOGIN_REDIR="$(redir https://dixis.gr/login)"
REGISTER_REDIR="$(redir https://dixis.gr/register)"

LIST_EMPTY_HIT=""
P1_NAME_HIT=""

if [ "$HAS_RG" = "1" ]; then
  LIST_EMPTY_HIT="$(curl -sS https://dixis.gr/products | rg -n "0 συνολικά|Δεν υπάρχουν|No products" -m 1 || true)"
  P1_NAME_HIT="$(curl -sS https://dixis.gr/products/1 | rg -n "Organic Tomatoes" -m 1 || true)"
else
  LIST_EMPTY_HIT="$(curl -sS https://dixis.gr/products | grep -E "0 συνολικά|Δεν υπάρχουν|No products" | head -n 1 || true)"
  P1_NAME_HIT="$(curl -sS https://dixis.gr/products/1 | grep -E "Organic Tomatoes" | head -n 1 || true)"
fi

OUT="docs/OPS/PROD-FACTS-LAST.md"
mkdir -p docs/OPS

cat > "$OUT" <<MD
# PROD FACTS (LAST)

Timestamp (UTC): $ts

## HTTP codes
- healthz: $HEALTHZ
- api/v1/public/products: $API_PRODUCTS
- /products: $PRODUCTS_LIST
- /products/1: $PRODUCT_1
- /login: $LOGIN (redir: ${LOGIN_REDIR:-<none>})
- /register: $REGISTER (redir: ${REGISTER_REDIR:-<none>})
- /auth/login: $AUTH_LOGIN
- /auth/register: $AUTH_REGISTER

## Content probes
- products list empty hit: ${LIST_EMPTY_HIT:-<none>}
- product 1 name hit: ${P1_NAME_HIT:-<none>}
MD

echo "WROTE $OUT"
sed -n '1,120p' "$OUT"

ok_code() { [[ "$1" == "200" || "$1" == "301" || "$1" == "302" || "$1" == "308" ]]; }

FAIL=0
ok_code "$HEALTHZ" || FAIL=1
ok_code "$API_PRODUCTS" || FAIL=1
ok_code "$PRODUCTS_LIST" || FAIL=1
ok_code "$PRODUCT_1" || FAIL=1
ok_code "$LOGIN" || FAIL=1
ok_code "$REGISTER" || FAIL=1
ok_code "$AUTH_LOGIN" || FAIL=1
ok_code "$AUTH_REGISTER" || FAIL=1

if [ "$FAIL" = "1" ]; then
  echo "PROD_FACTS_STATUS=FAIL"
  exit 1
fi

echo "PROD_FACTS_STATUS=OK"
exit 0
