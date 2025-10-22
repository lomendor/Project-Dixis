#!/usr/bin/env bash
set -euo pipefail
: "${REPO:=lomendor/Project-Dixis}"
echo "This script does NOT change settings. It prints an example gh api command you can run manually (admin only)."
echo
echo "Replace BRANCH if needed, then run the printed command."
BRANCH="main"

read -r -d '' PAYLOAD <<'JSON'
{
  "required_status_checks": {
    "strict": false,
    "checks": [
      { "context": "Gate (required)" }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON

echo "Example command (review before executing):"
echo "gh api -X PUT repos/$REPO/branches/$BRANCH/protection \\"
echo "  -H 'Accept: application/vnd.github+json' \\"
echo "  -F required_status_checks=@- <<'JSON'"
echo "$PAYLOAD"
echo "JSON"
echo
echo "Note: You need repo admin rights. The safer path is via GitHub UI (see docs/OPS/BRANCH_PROTECTION.md)."
