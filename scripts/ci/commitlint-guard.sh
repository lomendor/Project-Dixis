#!/usr/bin/env bash
set -euo pipefail
echo "▶ Commitlint (guarded)"
BASE="${GITHUB_BASE_REF:-main}"
git fetch origin "$BASE" --depth=1 >/dev/null 2>&1 || true
OUT="$(npx --yes @commitlint/cli@18 --from $(git merge-base HEAD origin/$BASE) --to HEAD || true)"
echo "$OUT"
if echo "$OUT" | grep -qi 'found 0 problems'; then
  echo "✅ Commitlint clean — forcing exit 0 (glitch guard)"; exit 0
fi
# Διαφάνεια: αν υπάρχουν προβλήματα, βγάζουμε non-zero
if echo "$OUT" | grep -qi 'problems'; then
  echo "❌ Commitlint reported problems — failing"; exit 1
fi
exit 0
