# SOP-SEC-ROTATION — Secret Hygiene & Rotation

## Non-negotiables
- NEVER run `cat .env`, `grep DATABASE_URL`, or any command that prints secrets to terminal/chat/CI logs.
- When debugging env wiring: print ONLY prefix + length (e.g., PREFIX=postgresql:// LEN=xx), never full values.
- If any secret is printed: treat as compromised; rotate ASAP and document incident (no values).

## Rotation checklist (tomorrow)
- RESEND_API_KEY: revoke old key, create new key, update prod env source-of-truth, restart service.
- Neon/Postgres DB credentials: rotate password, update prod DATABASE_URL, restart service.
- Verify endpoints (status codes only):
  - GET /api/healthz -> 200
  - Orders endpoints -> not 500
- Document in docs/OPS/STATE.md: date/time, what rotated (names only), verification results.

## Safe env validation snippet
- Print only: PREFIX=${VAR:0:12} and LEN=${#VAR}
