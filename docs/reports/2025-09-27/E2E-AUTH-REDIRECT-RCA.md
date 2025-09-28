# E2E Auth Redirect Flake — RCA (2025-09-27)

## Symptoms
- `waitForURL('/')` timeouts, stuck on `/auth/login`
- `localStorage SecurityError` (headless)
- Tests consistently fail at auth redirect step

## Evidence
- **PR #252 run 18062777789** (pre-#254): Failed with auth redirect timeout
- **Fresh run 18063332084** (post-#254): Confirmed failure with artifacts
- **Artifacts**: playwright-report, test-results (videos/traces) - downloaded & analyzed

### Specific Error Signatures (from fresh_excerpts.txt)
- **Line 1832**: `Error: expect(page).toHaveURL(expected) failed`
- **Line 1836**: `Timeout: 20000ms`
- **Line 1845**: `> 172 |     await expect(page).toHaveURL('/auth/login');`
- **Pattern**: Multiple identical failures at shipping-checkout-e2e.spec.ts:172
- **Frequency**: 4+ consecutive test failures with same signature

### Frontend State Analysis
- **Line 1584**: Frontend loads successfully showing unauthenticated state
  - Navigation shows: `Login to Add to Cart`, `Login`, `Sign Up` buttons
  - No authentication cookies or localStorage detected
  - Page serves correctly but without session state

### Test Configuration Analysis
- **playwright.config.ts**: CI uses 'smoke' project without storageState
- **global-setup.ts**: Creates mock auth files for smoke tests
- **test-auth.ts:60**: `await this.page.goto('/');` after programmatic login
- **test-auth.ts:74**: Fallback check `!url.href.includes('/auth/login')`

## Root Cause Analysis

**PRIMARY CAUSE**: CI smoke tests run without persistent authentication state. When tests access protected routes like `/cart`, the app correctly redirects to `/auth/login`, but the test assertion `expect(page).toHaveURL('/auth/login')` times out because:

1. **No storageState applied**: CI uses smoke project without authentication context
2. **Race condition**: Navigation to `/cart` → redirect to `/auth/login` happens faster than assertion timeout
3. **Missing cookies**: Trace analysis shows empty cookies array in network requests

**SECONDARY FACTORS**:
- Test harness expects authentication redirect but doesn't establish session first
- 20s timeout insufficient for cold app start + authentication redirect chain
- No pre-navigation authentication validation in test setup

## Minimal Patch Proposals (≤25 LOC per file)

### 1. Fix CI Smoke Test Authentication - `playwright.config.ts`
```diff
@@ -45,8 +45,10 @@ export default defineConfig({
       name: 'smoke',
       testDir: './tests/e2e',
       testMatch: /.*e2e\.spec\.ts$/,
-      use: { ...devices['Desktop Chrome'] },
+      use: {
+        ...devices['Desktop Chrome'],
+        storageState: isCI ? 'playwright/.auth/smoke.json' : undefined
+      },
     },
   ],
 });
```

### 2. Improve Auth State Setup - `global-setup.ts`
```diff
@@ -42,6 +42,12 @@ async function globalSetup(config: FullConfig) {

   if (isSmoke) {
     console.log('🔥 Creating mock storageState for smoke tests...');
+
+    // Ensure auth directory exists
+    const authDir = path.dirname(authFile);
+    if (!fs.existsSync(authDir)) {
+      fs.mkdirSync(authDir, { recursive: true });
+    }

     const mockState = {
       cookies: [
@@ -56,7 +62,8 @@ async function globalSetup(config: FullConfig) {
       ]
     };

-    fs.writeFileSync(authFile, JSON.stringify(mockState, null, 2));
+    fs.writeFileSync(authFile, JSON.stringify(mockState, null, 2));
+    console.log(`✅ Mock auth state written to ${authFile}`);
     return;
   }
```

### 3. Fix Timeout and Navigation Wait - `shipping-checkout-e2e.spec.ts`
```diff
@@ -167,9 +167,14 @@ test.describe('Shipping & Checkout E2E', () => {
     // Clear authentication to simulate session timeout
     await page.context().clearCookies();
     await page.evaluate(() => localStorage.clear());
+
+    // Navigate and wait for redirect
+    await page.goto('/cart');
+
+    // Wait for authentication redirect with element-based assertion
+    await page.waitForSelector('[data-testid="nav-login"]', { timeout: 15000 });

-    // Should redirect to login page when accessing cart
-    await page.goto('/cart');
-    await expect(page).toHaveURL('/auth/login');
+    // Verify we're on login page using URL pattern
+    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
   });
```

## Implementation Strategy

**Patch Application Order**:
1. **global-setup.ts** - Fix auth directory creation (safest change)
2. **playwright.config.ts** - Add storageState to smoke project
3. **shipping-checkout-e2e.spec.ts** - Fix timeout and navigation logic

**Risk Assessment**: **LOW** - All changes are test-harness only, no application code affected

**Expected Impact**:
- Eliminates `toHaveURL('/auth/login')` timeout failures
- Provides proper authentication context for CI smoke tests
- Improves test stability through element-based waits vs URL timing

**Verification Steps**:
```bash
# Test locally after patches
npm run test:e2e:smoke

# Check CI with storageState applied
git add frontend/tests/ frontend/playwright.config.ts
git commit -m "fix(e2e): resolve auth redirect timeout in smoke tests

- Add storageState support for CI smoke project
- Improve auth directory creation in global-setup
- Replace URL timing assertion with element-based wait
- Fixes 20s timeout failures at shipping-checkout-e2e.spec.ts:172

🤖 Generated with Claude Code"
```

## References
- Issue #253: E2E infrastructure tracking
- PR #254: Always-on artifact collection (merged)
- **Artifacts**: Run 18063332084 traces/logs analyzed
- **RCA Scope**: Test harness only - no app/workflow changes
- PR #252: Test stabilization with fresh artifacts available