#!/bin/bash
set -euo pipefail
cd "/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis"
export GH_REPO="lomendor/Project-Dixis"
mkdir -p pr-cleanup-reports

echo "=== Aggressive close: PRs με conflicts (needs-rebase) & >90 ημέρες ==="
REPORT="pr-cleanup-reports/auto-close-aggressive-$(date +%Y%m%d-%H%M%S).md"
echo "# Aggressive Auto-Close (needs-rebase & >90d)" > "$REPORT"
echo "" >> "$REPORT"

C90="$(date -v -90d +%Y-%m-%d)"
PROTECTED='-label:wip -label:do-not-merge -label:keep-open -label:security -label:breaking-change -label:release'
TOCLOSE=$(gh pr list --state open --search "label:needs-rebase updated:<$C90 $PROTECTED" \
  --limit 200 --json number,title,updatedAt,url \
  --jq '.[] | "\(.number)|\(.title)|\(.updatedAt)|\(.url)"')

if [ -n "$TOCLOSE" ]; then
  echo "$TOCLOSE" | while IFS='|' read -r num title upd url; do
    echo "- #$num (last: ${upd%%T*}) $url — $title" >> "$REPORT"
    gh pr close "$num" -c "Auto-close: stale (>90d) & conflicting (needs-rebase). Reopen if still relevant." || true
  done
else
  echo "No PRs match aggressive rule." | tee -a "$REPORT"
fi

echo "" >> "$REPORT"
echo "— Dependabot >30d safety pass" | tee -a "$REPORT"
C30="$(date -v -30d +%Y-%m-%d)"
gh pr list --state open --author "dependabot[bot]" --search "updated:<$C30" --limit 200 \
  --json number,title,updatedAt,url --jq '.[] | "\(.number)|\(.title)|\(.updatedAt)|\(.url)"' \
| while IFS='|' read -r num title upd url; do
    echo "- #$num (last: ${upd%%T*}) $url — $title" >> "$REPORT"
    gh pr close "$num" -c "Auto-close: stale Dependabot (>30d). Reopen if needed." || true
  done

echo ""
echo "— Refresh dashboard"
bash cleanup-scripts/06-create-dashboard.sh
sed -n '1,40p' pr-cleanup-reports/DASHBOARD.md

echo ""
echo "✅ Report saved: $REPORT"
