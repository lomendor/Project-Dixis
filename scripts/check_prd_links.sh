#!/usr/bin/env bash
set -euo pipefail
ROOT="docs/PRD"
ok=0; err=0
note(){ printf "• %s\n" "$*"; }
check_anchor(){
  local file="$1" anchor="$2"
  if grep -q "{#$anchor}" "$file" || grep -q "<a id=\"$anchor\">" "$file"; then
    return 0
  else
    return 1
  fi
}
# find md links pointing to docs/PRD/*.md with optional #anchor
links=$(grep -Rho 'docs/PRD/[A-Za-z0-9._/-]\+\.md\(#[-A-Za-z0-9_]\+\)\?' docs | sort -u || true)
while IFS= read -r L; do
  [ -z "$L" ] && continue
  file="${L%%#*}"; anchor="${L#*#}"
  [ "$anchor" = "$file" ] && anchor=""
  if [ ! -f "$file" ]; then
    printf "✗ Missing file: %s\n" "$file"; err=$((err+1)); continue
  fi
  if [ -n "$anchor" ]; then
    if check_anchor "$file" "$anchor"; then
      printf "✓ %s\n" "$L"; ok=$((ok+1))
    else
      printf "✗ Anchor not found: %s\n" "$L"; err=$((err+1))
    fi
  else
    printf "✓ %s\n" "$L"; ok=$((ok+1))
  fi
done <<< "$links"
printf "\nResult: OK=%d ERR=%d\n" "$ok" "$err"
[ "$err" -eq 0 ] || exit 1
