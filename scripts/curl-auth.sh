#!/usr/bin/env bash
set -euo pipefail

# ENV
API_BASE=${API_BASE:-http://127.0.0.1:8001}
EMAIL=${EMAIL:-}
PASSWORD=${PASSWORD:-}

if [[ -z "${EMAIL}" || -z "${PASSWORD}" ]]; then
  echo "Usage: EMAIL=... PASSWORD=... [API_BASE=http://127.0.0.1:8001] $0" 1>&2
  exit 1
fi

JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT

urldecode() {
  local data=${1//+/ }
  printf '%b' "${data//%/\\x}"
}

names_from_jar() {
  awk '!/^#/ { print $6 }' "$JAR" | sort -u
}

http_code() {
  local url=$1; shift
  curl -sS -c "$JAR" -b "$JAR" -o /dev/null -w '%{http_code}' "$@" "$url"
}

echo "# Step 1: GET CSRF cookie"
CODE=$(http_code "$API_BASE/sanctum/csrf-cookie")
echo "GET $API_BASE/sanctum/csrf-cookie -> $CODE"

XSRF_RAW=$(awk '$6=="XSRF-TOKEN" { print $7 }' "$JAR" | tail -n1 || true)
XSRF_TOKEN=""
if [[ -n "$XSRF_RAW" ]]; then
  XSRF_TOKEN=$(urldecode "$XSRF_RAW")
fi

if [[ -z "$XSRF_TOKEN" ]]; then
  echo "WARN: Missing XSRF-TOKEN after csrf-cookie"
fi

login_post() {
  local endpoint=$1
  curl -sS -c "$JAR" -b "$JAR" \
    -H "X-XSRF-TOKEN: $XSRF_TOKEN" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -o /dev/null -w '%{http_code}' \
    --data "email=${EMAIL}&password=${PASSWORD}" \
    "$API_BASE$endpoint"
}

echo "# Step 2: POST login (fallback chain)"
CODE1=$(login_post "/login")
echo "POST $API_BASE/login -> $CODE1"

FINAL_CODE=$CODE1
if [[ "$CODE1" != 2* ]]; then
  CODE2=$(login_post "/api/v1/auth/login")
  echo "POST $API_BASE/api/v1/auth/login -> $CODE2"
  FINAL_CODE=$CODE2
fi

echo "# Step 3: Cookies summary"
NAMES=$(names_from_jar | tr '\n' ' ')
echo "COOKIES: $NAMES"

if echo "$NAMES" | grep -Eq '\b(laravel_session|XSRF-TOKEN)\b'; then
  echo "AUTH_OK"
else
  echo "AUTH_FAIL"
fi

exit 0

