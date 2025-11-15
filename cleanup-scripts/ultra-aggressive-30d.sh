#!/bin/bash
set -euo pipefail
cd "/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis"
export GH_REPO="lomendor/Project-Dixis"
mkdir -p pr-cleanup-reports

echo "=== Ultra-Aggressive 30d: Close conflicts, merge Dependabot, nudge clean PRs ==="
REPORT="pr-cleanup-reports/conflict-30d-$(date +%Y%m%d-%H%M%S).md"
echo "# Close conflicting PRs >30d + dependabot rebase + nudges" > "$REPORT"
echo "" >> "$REPORT"

# macOS & Linux compatible date
C30="$(date -v -30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)"
PROTECTED_QUERY='-label:wip -label:do-not-merge -label:keep-open -label:security -label:breaking-change'

# A) Κλείσιμο PRs με conflicts και updated < 30d
echo "=== A) Closing conflicting PRs (>30d) ===" | tee -a "$REPORT"
CONFLICT_30=$(gh pr list --state open --search "updated:<$C30 $PROTECTED_QUERY" --limit 200 \
  --json number,title,updatedAt,mergeable,url \
  --jq '.[] | select(.mergeable=="CONFLICTING") | "\(.number)|\(.title)|\(.updatedAt)|\(.url)"')

if [ -n "$CONFLICT_30" ]; then
  echo "$CONFLICT_30" | while IFS='|' read -r num title upd url; do
    echo "- #$num (last: ${upd%%T*}) $title $url" | tee -a "$REPORT"
    gh pr comment "$num" -b "Auto-close: PR με conflicts και χωρίς δραστηριότητα >30 ημέρες. Κάνε **rebase** και ξανά-άνοιξέ το όταν είσαι έτοιμος." || true
    gh pr edit "$num" --add-label "auto-closed-stale" || true
    gh pr close "$num" -c "Auto-close: conflicting & inactive >30d." || true
  done
else
  echo "No conflicting PRs >30d." | tee -a "$REPORT"
fi

# B) Dependabot: ζητάμε rebase στα conflicting, γίνεται merge όπου είναι έτοιμα
echo -e "\n=== B) Dependabot handling ===" | tee -a "$REPORT"
DEPS=$(gh pr list --state open --author "dependabot[bot]" --limit 50 \
  --json number,title,mergeable,url --jq '.[] | "\(.number)|\(.title)|\(.mergeable)|\(.url)"')

if [ -n "$DEPS" ]; then
  echo "$DEPS" | while IFS='|' read -r num title mergeable url; do
    case "$mergeable" in
      CONFLICTING)
        echo "• #$num rebase request ($url)" | tee -a "$REPORT"
        gh pr comment "$num" -b "@dependabot rebase" || true
        ;;
      MERGEABLE)
        echo "• #$num attempt merge ($url)" | tee -a "$REPORT"
        gh pr merge "$num" --merge --delete-branch || true
        ;;
      *)
        echo "• #$num pending checks ($mergeable) ($url)" | tee -a "$REPORT"
        ;;
    esac
  done
else
  echo "No Dependabot PRs." | tee -a "$REPORT"
fi

# C) Nudge: PRs MERGEABLE αλλά χωρίς approvals
echo -e "\n=== C) Nudging mergeable PRs without approvals ===" | tee -a "$REPORT"
MERGEABLE=$(gh pr list --state open --limit 200 --json number,title,mergeable,url \
  --jq '.[] | select(.mergeable=="MERGEABLE") | "\(.number)|\(.title)|\(.url)"')

if [ -n "$MERGEABLE" ]; then
  echo "$MERGEABLE" | while IFS='|' read -r num title url; do
    APPROVED=$(gh pr view "$num" --json reviews --jq '[.reviews[] | select(.state=="APPROVED")] | length' 2>/dev/null || echo 0)
    if [ "${APPROVED:-0}" -eq 0 ]; then
      gh pr comment "$num" -b "Φιλική υπενθύμιση: το PR είναι **mergeable** αλλά χωρίς approvals. Ζητήστε review ή προσθέστε tests. Θα κλείσει στο επόμενο cleanup αν μείνει ανενεργό." || true
      gh pr edit "$num" --add-label "maintainer-note" || true
      echo "• Nudge #$num — $title ($url)" | tee -a "$REPORT"
    fi
  done
else
  echo "No mergeable PRs without approvals." | tee -a "$REPORT"
fi

# D) Dashboard
echo -e "\n=== D) Refresh dashboard ==="
bash cleanup-scripts/06-create-dashboard.sh
sed -n '1,40p' pr-cleanup-reports/DASHBOARD.md

echo -e "\n✅ Report saved: $REPORT"
