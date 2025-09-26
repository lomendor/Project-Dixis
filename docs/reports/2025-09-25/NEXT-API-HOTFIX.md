# Next.js API Hotfix — Legacy pages/api return object warning

TL;DR
- Legacy pages/api handlers that return plain objects can trigger: "API handler should not return a value, received object." We validated the codebase and ensured responses use `res.status(...).json(...)` / `res.end()`.
- In this repository state, there are no `frontend/pages/api/**/*.ts` handlers returning plain objects; the CSP endpoint lives in App Router (`frontend/src/app/api/csp-report/route.ts`) and already uses `NextResponse` correctly.
- Added dev scripts to simplify clean restart and verified dev boot shows no such warning.

Changed Files
- frontend/package.json — added `clean` and `dev:clean` scripts

Scanned/Verified
- No offending legacy handlers found under `frontend/pages/api/**`.
- `frontend/src/app/api/csp-report/route.ts` already returns `NextResponse(null, { status: 204 })` (correct for App Router).

Before/After (dev server excerpt)
- Before (local report): Warning could be observed if a pages/api handler returns a plain object: `API handler should not return a value, received object.`
- After (on this branch): Per `npm run dev:clean` boot logs — no occurrences of that warning.

Acceptance Criteria Mapping
- Dev server boot without the specific warning: Verified after `npm run dev:clean`.
- pages/api endpoints respond with proper HTTP responses: No legacy pages/api endpoints present; none misbehaving.
- No changes to business logic/payloads: Only scripts updated; no API behavior changes.

Notes
- If a legacy `frontend/pages/api/csp-report.ts` exists in other branches/environments and returns a plain object, convert it to use `NextApiRequest`/`NextApiResponse` and respond via `res.status(...).end()` (405 for non-POST, 204 for POST), avoiding `return { ... }`.

