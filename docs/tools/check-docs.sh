#!/usr/bin/env bash
set -euo pipefail

cmd=${1:-}

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
V2DIR="$ROOT/docs/prd/v2"

if [ -z "$cmd" ]; then
  echo "Usage: $0 [check-lines|check-links]" 1>&2
  exit 2
fi

case "$cmd" in
  check-lines)
    echo "Docs Line Count (<=300) — PRD v2"
    echo "DIR: $V2DIR"
    echo
    over=0
    total=0
    while IFS= read -r -d '' f; do
      c=$(wc -l <"$f" | tr -d ' \t')
      rel=${f#"$ROOT/"}
      printf "%4d  %s\n" "$c" "$rel"
      total=$((total+1))
      if [ "$c" -gt 300 ]; then over=$((over+1)); fi
    done < <(find "$V2DIR" -type f -name "*.md" -print0 | sort -z)
    echo
    echo "FILES_SCANNED=$total"
    echo "FILES_OVER_300=$over"
    ;;

  check-links)
    echo "Relative Link Check — PRD v2"
    echo "DIR: $V2DIR"
    echo
    broken=0
    while IFS= read -r -d '' f; do
      dir=$(dirname "$f")
      rel=${f#"$ROOT/"}
      i=0
      while IFS= read -r line; do
        i=$((i+1))
        # extract all occurrences of ](…)
        matches=$(printf '%s\n' "$line" | grep -oE '\]\([^)]*\)' || true)
        if [ -z "$matches" ]; then continue; fi
        while IFS= read -r m; do
          link=$(printf '%s' "$m" | sed -E 's/^\]\(|\)$//g')
          # skip external or anchor-only links
          case "$link" in
            http://*|https://*|mailto:*|tel:*|data:*|file://*|vscode://*|//*) continue ;;
            \#*) continue ;;
          esac
          # strip anchor
          base=${link%%#*}
          # empty base means same-file anchor; skip
          if [ -z "$base" ]; then continue; fi
          # check existence relative to file dir
          if ( cd "$dir" && [ -e "$base" ] ); then
            :
          else
            echo "BROKEN  $rel:$i -> $link"
            broken=$((broken+1))
          fi
        done <<< "$matches"
      done < "$f"
    done < <(find "$V2DIR" -type f -name "*.md" -print0 | sort -z)
    echo
    if [ "$broken" -eq 0 ]; then
      echo "No issues found"
    else
      echo "BROKEN_LINKS=$broken"
    fi
    ;;

  *)
    echo "Unknown command: $cmd" 1>&2
    exit 2
    ;;
esac

