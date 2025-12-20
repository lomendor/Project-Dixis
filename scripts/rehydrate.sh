#!/usr/bin/env bash
set -euo pipefail
echo "== READ =="
for f in docs/OPS/STATE.md docs/NEXT-7D.md docs/PRODUCT/PRD-INDEX.md; do
  [ -f "$f" ] && echo " - $f" || echo " - MISSING $f"
done
echo "== PROD FACTS =="
if [ -x "./scripts/prod-facts.sh" ]; then
  ./scripts/prod-facts.sh || true
else
  echo "scripts/prod-facts.sh missing; add it or run curls manually."
fi
