#!/bin/bash
set -euo pipefail
echo "🔍 DIXIS Issue Analysis"
mkdir -p pr-cleanup-reports
REPORT_FILE="pr-cleanup-reports/issue-analysis-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << 'EOF'
# Issue Analysis Report

## Statistics
EOF

TOTAL_ISSUES=$(gh issue list --state open --limit 200 --json number | jq '. | length')
echo "- Total Open Issues: $TOTAL_ISSUES" >> "$REPORT_FILE"
echo -e "\n## By Category\n" >> "$REPORT_FILE"

echo "### 🐛 Bugs" >> "$REPORT_FILE"
gh issue list --state open --label "bug" --limit 50 \
  --json number,title,createdAt \
  --jq '.[] | "- #\(.number): \(.title) (Created: \(.createdAt | split("T")[0]))"' >> "$REPORT_FILE" || true

echo -e "\n### ✨ Feature Requests" >> "$REPORT_FILE"
gh issue list --state open --label "enhancement" --limit 50 \
  --json number,title \
  --jq '.[] | "- #\(.number): \(.title)"' >> "$REPORT_FILE" || true

CUTOFF_90=$(date -d '90 days ago' '+%Y-%m-%d' 2>/dev/null || date -v -90d '+%Y-%m-%d')
echo -e "\n### 📅 Stale Issues (>90 days)" >> "$REPORT_FILE"
gh issue list --state open --search "updated:<$CUTOFF_90" --limit 50 \
  --json number,title,updatedAt \
  --jq '.[] | "- #\(.number): \(.title) (Last: \(.updatedAt | split("T")[0]))"' >> "$REPORT_FILE" || true

echo -e "\n## 📋 Action Items\n" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'
1. Close stale (>90d) after ping
2. Label unlabeled (needs-triage)
3. Prioritize P0/P1/P2
4. Group in milestones
EOF
echo "✅ Saved: $REPORT_FILE"
