#!/bin/bash
set -euo pipefail
echo "🔍 DIXIS PR Analysis Report"
mkdir -p pr-cleanup-reports
REPORT_FILE="pr-cleanup-reports/pr-analysis-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << 'EOF'
# PR Cleanup Analysis Report

## Summary Statistics
EOF
TOTAL_PRS=$(gh pr list --state open --limit 200 --json number | jq '. | length')
echo "- Total Open PRs: $TOTAL_PRS" >> "$REPORT_FILE"
echo -e "\n## Categories\n" >> "$REPORT_FILE"

echo -e "\n### 🤖 Dependabot Updates\n" >> "$REPORT_FILE"
gh pr list --state open --author "dependabot[bot]" --limit 100 \
  --json number,title,createdAt,labels \
  --jq '.[] | "- PR #\(.number): \(.title) (Created: \(.createdAt | split("T")[0]))"' >> "$REPORT_FILE" || true

CUTOFF_DATE=$(date -d '60 days ago' '+%Y-%m-%d' 2>/dev/null || date -v -60d '+%Y-%m-%d')
echo -e "\n### 📅 Stale PRs (>60 days old)\n" >> "$REPORT_FILE"
gh pr list --state open --search "updated:<$CUTOFF_DATE" --limit 100 \
  --json number,title,author,updatedAt \
  --jq '.[] | "- PR #\(.number): \(.title) by @\(.author.login) (Last update: \(.updatedAt | split("T")[0]))"' >> "$REPORT_FILE" || true

echo -e "\n### ✅ Approved but Not Merged\n" >> "$REPORT_FILE"
gh pr list --state open --search "review:approved" --limit 30 \
  --json number,title \
  --jq '.[] | "- PR #\(.number): \(.title)"' >> "$REPORT_FILE" || true

echo -e "\n### 📝 Draft PRs\n" >> "$REPORT_FILE"
gh pr list --state open --draft --limit 50 \
  --json number,title,author \
  --jq '.[] | "- PR #\(.number): \(.title) by @\(.author.login)"' >> "$REPORT_FILE" || true

echo -e "\n### ⚠️ PRs with Conflicts\n" >> "$REPORT_FILE"
gh pr list --state open --limit 200 --json number,title,mergeable \
  --jq '.[] | select(.mergeable == "CONFLICTING") | "- PR #\(.number): \(.title)"' >> "$REPORT_FILE" || true

cat >> "$REPORT_FILE" << 'EOF'

## 🎯 Recommended Actions
- Close old Dependabot PRs (>30d)
- Merge approved PRs with green checks
- Stale PRs: ping authors or close
- Conflicts: rebase or close

### Helper Commands
```bash
gh pr list --state open --search "review:approved status:success"
```
EOF

echo "✅ Saved: $REPORT_FILE"
