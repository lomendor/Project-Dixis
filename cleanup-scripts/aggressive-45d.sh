#!/bin/bash
set -euo pipefail
cd "/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis"
export GH_REPO="lomendor/Project-Dixis"
mkdir -p pr-cleanup-reports

echo "=== Aggressive pass: needs-rebase >45d, drafts >30d, merge approved+green, nudge clean PRs ==="
REPORT="pr-cleanup-reports/auto-close-45d-$(date +%Y%m%d-%H%M%S).md"
echo "# Auto-Close (>45d & needs-rebase) + Drafts >30d + Batch Merge + Nudge" > "$REPORT"
echo "" >> "$REPORT"

# macOS cutoffs
C45="$(date -v -45d +%Y-%m-%d)"
C30="$(date -v -30d +%Y-%m-%d)"
PROTECTED='-label:wip -label:do-not-merge -label:keep-open -label:security -label:breaking-change -label:release'

# Ensure labels exist
gh label create "auto-closed-stale" --color "CFD3D7" --description "Auto-closed due to staleness" --force >/dev/null 2>&1 || true
gh label create "maintainer-note"   --color "E0F3F8" --description "Maintainer maintenance note" --force >/dev/null 2>&1 || true

echo "=== A) Close needs-rebase >45d (exclude protected) ===" | tee -a "$REPORT"
TOCLOSE_45=$(gh pr list --state open --search "label:needs-rebase updated:<$C45 $PROTECTED" \
  --limit 200 --json number,title,updatedAt,url \
  --jq '.[] | "\(.number)|\(.title)|\(.updatedAt)|\(.url)"')

if [ -n "${TOCLOSE_45}" ]; then
  echo "$TOCLOSE_45" | while IFS='|' read -r num title upd url; do
    echo "- #$num (last: ${upd%%T*}) $url — $title" | tee -a "$REPORT"
    gh pr comment "$num" -b "Auto-close: PR με conflicts (needs-rebase) και χωρίς δραστηριότητα >45 ημέρες. **Κάνε rebase** και ξανά-άνοιξέ το όποτε θες. 😊" || true
    gh pr edit "$num" --add-label "auto-closed-stale" || true
    gh pr close "$num" -c "Auto-close: stale conflicting PR (>45d)." || true
  done
else
  echo "No PRs matched >45d & needs-rebase." | tee -a "$REPORT"
fi

echo -e "\n=== B) Close abandoned drafts >30d ===" | tee -a "$REPORT"
DRAFTS_30=$(gh pr list --state open --draft --search "updated:<$C30 $PROTECTED" \
  --limit 200 --json number,title,updatedAt,url \
  --jq '.[] | "\(.number)|\(.title)|\(.updatedAt)|\(.url)"')

if [ -n "${DRAFTS_30}" ]; then
  echo "$DRAFTS_30" | while IFS='|' read -r num title upd url; do
    echo "- #$num (last: ${upd%%T*}) $url — $title" | tee -a "$REPORT"
    gh pr comment "$num" -b "Auto-close: draft χωρίς ενημέρωση >30 ημέρες. Αν συνεχίζει να σε ενδιαφέρει, βγάλ'το από draft/κάνε rebase και ξανά-άνοιξέ το." || true
    gh pr edit "$num" --add-label "auto-closed-stale" || true
    gh pr close "$num" -c "Auto-close: abandoned draft (>30d)." || true
  done
else
  echo "No stale drafts >30d." | tee -a "$REPORT"
fi

echo -e "\n=== C) Batch merge (approved + checks green) ===" | tee -a "$REPORT"
APPROVED_OK=$(gh pr list --state open --search "review:approved status:success -label:wip -label:do-not-merge" \
  --limit 200 --json number,title,url \
  --jq '.[] | "\(.number)|\(.title)|\(.url)"')

if [ -n "${APPROVED_OK}" ]; then
  echo "$APPROVED_OK" | while IFS='|' read -r num title url; do
    echo "• Merging #$num — $title ($url)" | tee -a "$REPORT"
    gh pr merge "$num" --merge --delete-branch || echo "  ↳ merge failed, check manually" | tee -a "$REPORT"
  done
else
  echo "No approved+green PRs to merge." | tee -a "$REPORT"
fi

echo -e "\n=== D) Nudge clean (non-conflicting) PRs without approval ===" | tee -a "$REPORT"
CLEAN_NOAPP=$(gh pr list --state open --limit 200 \
  --json number,title,mergeable,url \
  --jq '.[] | select(.mergeable=="MERGEABLE") | "\(.number)|\(.title)|\(.url)"')

if [ -n "${CLEAN_NOAPP}" ]; then
  echo "$CLEAN_NOAPP" | while IFS='|' read -r num title url; do
    # Skip ones that are approved already (we tried merge above)
    IS_APPROVED=$(gh pr view "$num" --json reviews --jq '.reviews | map(select(.state=="APPROVED")) | length')
    if [ "${IS_APPROVED}" -eq 0 ]; then
      echo "• Nudge #$num — $title" | tee -a "$REPORT"
      gh pr comment "$num" -b "Σύντομη ενημέρωση: Χωρίς approvals ακόμα. Αν θες να προχωρήσει, ζήτα review ή πρόσθεσε tests. **Πολιτική**: αν μείνει ανενεργό, θα κλείσει αυτόματα στο επόμενο cleanup. 🙏" || true
      gh pr edit "$num" --add-label "maintainer-note" || true
    fi
  done
else
  echo "No clean PRs found to nudge." | tee -a "$REPORT"
fi

echo -e "\n=== E) Refresh dashboard ==="
bash cleanup-scripts/06-create-dashboard.sh
sed -n '1,40p' pr-cleanup-reports/DASHBOARD.md

echo -e "\n✅ Report saved: $REPORT"
