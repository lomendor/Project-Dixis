# E2E Auth Redirect Flake — RCA (2025-09-27)

## Symptoms
- `waitForURL('/')` timeouts, stuck on `/auth/login`
- `localStorage SecurityError` (headless)
- Tests consistently fail at auth redirect step

## Evidence
- **PR #252 run 18062777789** (pre-#254): Failed with auth redirect timeout
- **Fresh run 18063332084** (post-#254): Currently running with always-on artifacts
- **Artifacts**: playwright-report, test-results (videos/traces)
- **Error pattern**: `expect(page).toHaveURL('/auth/login')` timeout after 20s

## Likely Causes to Validate (no code change yet)
- storageState not loaded before first goto()
- race condition on auth redirect / cookies
- headless localStorage access under CSP/Service Worker restrictions

## Next Steps (tests-only later)
- explicit `await context.addCookies(...)` before first navigation
- increase waitForURL to event: 'domcontentloaded' or check `toHaveURL(/\/(home|dashboard)/)`
- add pre-check `await page.evaluate(() => !!localStorage)` guard

## References
- Issue #253: E2E infrastructure tracking
- PR #254: Always-on artifact collection (merged)
- PR #252: Test stabilization with fresh artifacts available