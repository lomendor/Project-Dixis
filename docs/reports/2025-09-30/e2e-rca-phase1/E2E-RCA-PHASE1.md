# E2E RCA — Phase 1 (run 18118732034, frontend-ci on main)

## What we mined
- Artifacts: e2e-test-results-always.zip, e2e-traces-failure.zip, e2e-videos-screenshots-failure.zip, excerpts.txt, run.log, SUMMARY.md
- Source logs: `docs/reports/2025-09-30/main-e2e-baseline_ci-only/run-18118732034/run.log`
- Excerpts: `docs/reports/2025-09-30/main-e2e-baseline_ci-only/run-18118732034/excerpts.txt`
- Artifact workspace: `/tmp/e2eRCA_18118732034_Bftm` (temporary)

## High-signal patterns
- Repeated **TimeoutError** on `locator.waitFor` and **expect(page).toHaveURL(/auth/login/)**
- Shows **auth bootstrap**/redirect flake: tests expect /auth/login but doesn't stabilize within 20s
- Secondary: multiple timeouts in shipping integration specs (likely dependency on pre-auth state)
- All failures concentrated in **shipping-checkout.e2e.spec.ts**

## Failed Test Files (from artifacts)
```
shipping-checkout-e2e-Ship-2ec64-e-and-longer-delivery-times-smoke (retry1)
shipping-checkout-e2e-Ship-409ff-icing-bulky-vs-dense-items--smoke (retry1)
shipping-checkout-e2e-Ship-67485-lete-shipping-checkout-flow-smoke (retry1)
shipping-checkout-e2e-Ship-6a21d-heckout-without-postal-code-smoke (retry1)
shipping-checkout-e2e-Ship-e5078-ulation-for-different-zones-smoke (retry1)
shipping-checkout-e2e-Ship-f8b2d-retry-after-session-timeout-smoke (retry1)
```

## Likely root causes (to validate in Phase 2)
1. **Pre-auth state not applied** (storageState/cookies) → redirect loop or late navigation
2. **Fragile expect on URL** without prior DOM-ready/visible login form confirmation
3. **Race condition**: server ready vs app hydrated before first expect
4. **Shipping tests dependency**: All failures in shipping checkout tests suggest auth prerequisite issue

## Minimal mitigation plan (tests-only, non-runtime)
- **Guarded waits**: `await page.goto('/auth/login', {waitUntil:'domcontentloaded'})` + assert visibility of login form testid/role
- **Pre-auth option**: Use `storageState` via global-setup for consumer (if helper exists already)
- **Time budget**: Increase to 45s ONLY for auth bootstrap steps (not global)
- **Stabilize navigation**: Add intermediate wait for visible elements before URL assertions

## Evidence snippets
```
1711:e2e-tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1742:e2e-tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1777:e2e-tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1808:e2e-tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1843:e2e-tests Error: expect(page).toHaveURL(expected) failed
1847:e2e-tests Timeout: 20000ms
1850:e2e-tests - Expect "toHaveURL" with timeout 20000ms
1856:e2e-tests > 183 | await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 20000 });
1877:e2e-tests Error: expect(page).toHaveURL(expected) failed
1881:e2e-tests Timeout: 20000ms
1884:e2e-tests - Expect "toHaveURL" with timeout 20000ms
1890:e2e-tests > 183 | await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 20000 });
```

Pattern analysis from run.log:
- **TimeoutError**: 16 occurrences, all `locator.waitFor: Timeout 20000ms exceeded`
- **toHaveURL**: 12 occurrences, all expecting `/auth/login` URL with 20s timeout
- **/auth/login**: Present in frontend build manifest and all failing test assertions

## Next Steps
- Phase 2: Targeted log parsing + single-spec debug run for shipping integration
- Implement proposed patchset with auth bootstrap stabilization
- Consider adding auth state persistence for shipping tests
- Validate with local reproduction before applying to main