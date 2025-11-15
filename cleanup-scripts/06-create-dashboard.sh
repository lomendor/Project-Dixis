#!/bin/bash
set -euo pipefail
mkdir -p pr-cleanup-reports
DASH="pr-cleanup-reports/DASHBOARD.md"
OPEN_PRS=$(gh pr list --state open --json number | jq '. | length')
OPEN_ISSUES=$(gh issue list --state open --json number | jq '. | length')
DRAFT_PRS=$(gh pr list --state open --draft --json number | jq '. | length')
APPROVED_PRS=$(gh pr list --state open --search "review:approved" --json number | jq '. | length')
DEPENDABOT_PRS=$(gh pr list --state open --author "dependabot[bot]" --json number | jq '. | length')
STALE_ISSUES=$(gh issue list --state open --search "updated:<$(date -d '90 days ago' '+%Y-%m-%d' 2>/dev/null || date -v -90d '+%Y-%m-%d')" --json number | jq '. | length')
UNLABELED_ISSUES=$(gh issue list --state open --search "no:label" --json number | jq '. | length')

cat > "$DASH" <<EOF
# 📊 DIXIS Cleanup Dashboard

Generated: $(date '+%Y-%m-%d %H:%M:%S EET')

## 📈 Current Metrics
- Open PRs: $OPEN_PRS
- Open Issues: $OPEN_ISSUES
- Draft PRs: $DRAFT_PRS
- Approved PRs: $APPROVED_PRS
- Dependabot PRs: $DEPENDABOT_PRS
- Stale Issues (>90d): $STALE_ISSUES
- Unlabeled Issues: $UNLABELED_ISSUES

## Quick Commands

\`\`\`bash
gh pr list --state open --search "review:approved"
gh pr list --state open --author "dependabot[bot]"
gh issue list --state open --search "no:label"
\`\`\`
EOF
echo "✅ Saved: $DASH"
