# Main E2E Baseline — frontend-ci.yml (run 18118732034)
- Run: https://github.com/lomendor/Project-Dixis/actions/runs/18118732034
- **Conclusion**: ❌ **FAILURE**

## Excerpts (first 35 lines)
```
434:frontend-tests Build application ├ ○ /auth/login 3.87 kB 109 kB
1517:e2e-tests Start Next.js server ├ ○ /auth/login 3.8 kB 109 kB
1590:e2e-tests Wait for servers to be ready <!DOCTYPE html>...✅ Frontend server ready
1711:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1742:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1777:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1808:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1843:e2e-tests Run shipping integration E2E tests Error: expect(page).toHaveURL(expected) failed
1847:e2e-tests Run shipping integration E2E tests Timeout: 20000ms
1850:e2e-tests Run shipping integration E2E tests - Expect "toHaveURL" with timeout 20000ms
1856:e2e-tests Run shipping integration E2E tests > 183 | await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 20000 });
1877:e2e-tests Run shipping integration E2E tests Error: expect(page).toHaveURL(expected) failed
1881:e2e-tests Run shipping integration E2E tests Timeout: 20000ms
1884:e2e-tests Run shipping integration E2E tests - Expect "toHaveURL" with timeout 20000ms
1890:e2e-tests Run shipping integration E2E tests > 183 | await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 20000 });
1915:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1946:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
1981:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2012:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2090:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2109:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2126:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2145:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2162:e2e-tests Run shipping integration E2E tests Error: expect(page).toHaveURL(expected) failed
2166:e2e-tests Run shipping integration E2E tests Timeout: 20000ms
2169:e2e-tests Run shipping integration E2E tests - Expect "toHaveURL" with timeout 20000ms
2175:e2e-tests Run shipping integration E2E tests > 183 | await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 20000 });
2184:e2e-tests Run shipping integration E2E tests Error: expect(page).toHaveURL(expected) failed
2188:e2e-tests Run shipping integration E2E tests Timeout: 20000ms
2191:e2e-tests Run shipping integration E2E tests - Expect "toHaveURL" with timeout 20000ms
2197:e2e-tests Run shipping integration E2E tests > 183 | await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 20000 });
2204:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2223:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2240:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
2259:e2e-tests Run shipping integration E2E tests TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
```

## Artifacts captured
- run.log (328KB)
- excerpts.txt (22KB)
- e2e-test-results-always.zip
- e2e-traces-failure.zip
- e2e-videos-screenshots-failure.zip

## Key Failure Pattern
**Primary issue**: Auth navigation timeouts - tests expecting `/auth/login` URL but timing out after 20s
**Secondary issue**: Element locator timeouts across multiple tests
**Pattern**: Consistent failures in shipping integration E2E tests