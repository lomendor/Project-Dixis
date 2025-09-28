#!/usr/bin/env bash
set -euo pipefail

API="${NEXT_PUBLIC_API_BASE_URL:-http://127.0.0.1:8001/api/v1}"
echo "▶ Probing $API/products ..."

RAW=$(curl -fsS "$API/products" || echo "")
LEN=$(node -e "try{let d=JSON.parse(process.argv[1]);let n=Array.isArray(d)?d.length:(d?.data?.length??-1);console.log(n)}catch(e){console.log(-1)}" "$RAW")

echo "Products count: $LEN"
echo "Sample keys:"; node -e "try{let d=JSON.parse(process.argv[1]);let a=Array.isArray(d)?d:(d?.data??[]);console.log(a.slice(0,3).map(x=>Object.keys(x).slice(0,5)))}catch(e){console.log('[]')}" "$RAW"

test "${LEN:-0}" -gt 0 || { echo '❌ No products visible via API'; exit 2; }