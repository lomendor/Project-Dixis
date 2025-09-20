# Security: CSP Report-Only (nonce + /api/csp-report)

- Flag: `NEXT_ENABLE_CSP_REPORT_ONLY` (default: false)
- Header: `Content-Security-Policy-Report-Only` με per-request nonce
- Endpoint: `POST /api/csp-report` (logs only)
- Purpose: Καταγραφή παραβάσεων (console/CSP/inline) χωρίς breakage
- Enable in staging: set `NEXT_ENABLE_CSP_REPORT_ONLY=true` και επιθεώρηση logs
- Next: Μετά τη διόρθωση θεμάτων, switch σε enforced CSP