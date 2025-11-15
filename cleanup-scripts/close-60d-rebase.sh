#!/bin/bash
set -euo pipefail
cd "/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis"
export GH_REPO="lomendor/Project-Dixis"
mkdir -p pr-cleanup-reports

echo "=== Close PRs: needs-rebase & >60d (exclude protected) ==="
REPORT="pr-cleanup-reports/auto-close-60d-$(date +%Y%m%d-%H%M%S).md"
echo "# Auto-Close (>60d & needs-rebase)" > "$REPORT"
echo "" >> "$REPORT"

# macOS date for 60 days
C60="$(date -v -60d +%Y-%m-%d)"
PROTECTED='-label:wip -label:do-not-merge -label:keep-open -label:security -label:breaking-change -label:release'

# Ensure label exists for audit
gh label create "auto-closed-stale" --color "CFD3D7" --description "Auto-closed due to staleness" --force >/dev/null 2>&1 || true

TOCLOSE=$(gh pr list --state open --search "label:needs-rebase updated:<$C60 $PROTECTED" \
  --limit 200 --json number,title,updatedAt,url \
  --jq '.[] | "\(.number)|\(.title)|\(.updatedAt)|\(.url)"')

if [ -n "$TOCLOSE" ]; then
  echo "$TOCLOSE" | while IFS='|' read -r num title upd url; do
    echo "- #$num (last: ${upd%%T*}) $url — $title" | tee -a "$REPORT"
    gh pr comment "$num" -b "Auto-close: conflicting PR (needs-rebase) χωρίς ενημέρωση >60 ημέρες. Αν παραμένει σχετικό, κάνε **rebase** και άνοιξέ το ξανά." || true
    gh pr edit "$num" --add-label "auto-closed-stale" || true
    gh pr close "$num" -c "Auto-close: stale conflicting PR (>60d)." || true
  done
else
  echo "No PRs matched >60d & needs-rebase." | tee -a "$REPORT"
fi

echo ""
echo "=== Dependabot: set auto-merge for mergeable PRs ===" | tee -a "$REPORT"
DEPS=$(gh pr list --state open --author "dependabot[bot]" --limit 50 \
  --json number,title,mergeable,url \
  --jq '.[] | select(.mergeable != "CONFLICTING") | "\(.number)|\(.title)|\(.url)"')

if [ -n "$DEPS" ]; then
  echo "$DEPS" | while IFS='|' read -r num title url; do
    echo "• Auto-merge request on #$num — $title ($url)" | tee -a "$REPORT"
    gh pr merge "$num" --merge --delete-branch --auto || true
  done
else
  echo "No mergeable Dependabot PRs right now." | tee -a "$REPORT"
fi

echo ""
echo "=== Refresh dashboard ==="
bash cleanup-scripts/06-create-dashboard.sh
sed -n '1,40p' pr-cleanup-reports/DASHBOARD.md

echo ""
echo "✅ Report saved: $REPORT"
