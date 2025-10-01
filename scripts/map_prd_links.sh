#!/usr/bin/env bash
set -euo pipefail

note(){ printf "• %s\n" "$*"; }
err(){ printf "✗ %s\n" "$*" >&2; }
ok(){ printf "✓ %s\n" "$*"; }

has_label() { # $1=issue|pr $2=num $3=label
  if [ "$1" = "issue" ]; then
    gh issue view "$2" --json labels --jq '.labels[].name' 2>/dev/null | grep -qx "$3"
  else
    gh pr view "$2" --json labels --jq '.labels[].name' 2>/dev/null | grep -qx "$3"
  fi
}
has_related_comment() { # $1=issue|pr $2=num
  if [ "$1" = "issue" ]; then
    gh issue view "$2" --comments --json comments --jq '.comments[].body' 2>/dev/null | grep -qi "Related PRD"
  else
    gh pr view "$2" --comments --json comments --jq '.comments[].body' 2>/dev/null | grep -qi "Related PRD"
  fi
}

pick_prd() { # stdin: lowercased text
  local text; text="$(cat)"
  if   grep -Eq "(cart|checkout)" <<<"$text"; then
    echo "docs/PRD/PRD-05-Cart-Checkout.md#requirements"
  elif grep -Eq "(shipping|locker|volumetric|acs|elta|speedex)" <<<"$text"; then
    echo "docs/PRD/PRD-03-Shipping-Pricing.md#requirements"
  elif grep -Eq "(producer|onboard|registration)" <<<"$text"; then
    echo "docs/PRD/PRD-02-Producer-Onboarding.md#requirements"
  elif grep -Eq "(message|chat|bypass|circumvent|contact)" <<<"$text"; then
    echo "docs/PRD/PRD-06-Messaging-NonCircumvention.md#requirements"
  elif grep -Eq "(payment|stripe|refund|vat)" <<<"$text"; then
    echo "docs/PRD/PRD-07-Payments-Compliance.md#requirements"
  else
    echo "docs/PRD/PRD-00-Overview.md#principles"
  fi
}

process_issue() { # $1=base64(json)
  local j num title body text prd
  j="$(printf '%s' "$1" | base64 -d)"
  num="$(jq -r '.number' <<<"$j")"
  title="$(jq -r '.title // ""' <<<"$j")"
  body="$(jq -r '.body  // ""' <<<"$j")"
  text="$(printf '%s\n%s' "$title" "$body" | tr '[:upper:]' '[:lower:]')"
  prd="$(pick_prd <<<"$text")"

  if ! has_label issue "$num" prd:link; then gh issue edit "$num" --add-label prd:link >/dev/null || true; fi
  if ! has_related_comment issue "$num"; then gh issue comment "$num" -b "**Related PRD:** $prd" >/dev/null || true; fi
  note "Issue #$num → $prd"
}

process_pr() { # $1=base64(json)
  local j num title body text prd
  j="$(printf '%s' "$1" | base64 -d)"
  num="$(jq -r '.number' <<<"$j")"
  title="$(jq -r '.title // ""' <<<"$j")"
  body="$(jq -r '.body  // ""' <<<"$j")"
  text="$(printf '%s\n%s' "$title" "$body" | tr '[:upper:]' '[:lower:]')"
  prd="$(pick_prd <<<"$text")"

  if ! has_label pr "$num" prd:link; then gh pr edit "$num" --add-label prd:link >/dev/null || true; fi
  if ! has_related_comment pr "$num"; then gh pr comment "$num" -b "**Related PRD:** $prd" >/dev/null || true; fi
  note "PR #$num → $prd"
}

run() {
  ok "Mapping open issues…"
  gh issue list --state open --json number,title,body,labels --limit 100 \
    | jq -r '.[] | @base64' | while read -r row; do
        [ -z "${row:-}" ] && continue
        process_issue "$row"
      done

  ok "Mapping open PRs…"
  gh pr list --state open --json number,title,body,labels --limit 100 \
    | jq -r '.[] | @base64' | while read -r row; do
        [ -z "${row:-}" ] && continue
        process_pr "$row"
      done
}
run
