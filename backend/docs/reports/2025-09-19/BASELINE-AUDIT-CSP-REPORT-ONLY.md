# Baseline Audit — CSP Report-Only (post-merge)
- Added CSP Report-Only with per-request nonce and `/api/csp-report`.
- Flag: `NEXT_ENABLE_CSP_REPORT_ONLY` (default false).
- No backend dependency; LHCI remains green (warns on PR).
- Next: enable flag in staging to collect reports; after remediation, switch to enforced CSP.