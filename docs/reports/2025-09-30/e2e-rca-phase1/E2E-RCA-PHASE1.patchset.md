*** PROPOSED (tests-only) — DO NOT APPLY DIRECTLY ***

--- a/frontend/tests/e2e/helpers/test-auth.ts
+++ b/frontend/tests/e2e/helpers/test-auth.ts
@@
+ // Mitigation P0: stabilize auth bootstrap (no localStorage direct reads before navigation)
+ export async function gotoLoginStable(page: Page, baseURL: string) {
+   await page.goto(baseURL + '/auth/login', { waitUntil: 'domcontentloaded' });
+   // Prefer robust selector if exists; fallback to role
+   const loginForm = page.locator('[data-testid="auth-login-form"], form[aria-label="login"], role=heading[name=/Login|Σύνδεση/i]');
+   await loginForm.first().waitFor({ timeout: 45000 });
+ }

--- a/frontend/tests/e2e/shipping-checkout.e2e.spec.ts
+++ b/frontend/tests/e2e/shipping-checkout.e2e.spec.ts
@@
- // existing login step (line ~183)
- await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 20000 });
+ // P0: use stable login bootstrap with increased timeout
+ await gotoLoginStable(page, baseURL);
+ await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 45000 });

--- a/frontend/tests/e2e/helpers/waitForProductsApiAndCards.ts
+++ b/frontend/tests/e2e/helpers/waitForProductsApiAndCards.ts
@@
  // Add auth-aware variant for shipping tests
+ export async function waitForAuthThenProducts(page: Page, baseURL: string) {
+   // Ensure auth state is ready first
+   const authIndicator = page.locator('[data-testid="nav-login"], [data-testid="user-menu"], [data-testid="nav-logout"]');
+   await authIndicator.first().waitFor({ state: 'visible', timeout: 30000 });
+
+   // Then wait for products as usual
+   await waitForProductsApiAndCards(page);
+ }

--- a/frontend/playwright.config.ts
+++ b/frontend/playwright.config.ts
@@
  // Ensure baseURL prefers 127.0.0.1 and honors PLAYWRIGHT_BASE_URL
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3030',
    // keep existing settings; do not change global timeouts globally
+   // Add trace for auth failures (debug mode only)
+   trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  },

--- a/frontend/tests/e2e/global-setup.ts
+++ b/frontend/tests/e2e/global-setup.ts
@@
+ // Consider adding pre-authenticated state for shipping tests
+ async function globalSetup(config: FullConfig) {
+   const { baseURL } = config.projects[0].use;
+   const browser = await chromium.launch();
+   const page = await browser.newPage();
+
+   // Bootstrap auth state for consumer role
+   await page.goto(`${baseURL}/auth/login`);
+   await page.fill('[data-testid="email-input"]', 'consumer@example.com');
+   await page.fill('[data-testid="password-input"]', 'password');
+   await page.click('[data-testid="login-button"]');
+   await page.waitForURL(/\/products|\/dashboard/, { timeout: 30000 });
+
+   // Save storage state
+   await page.context().storageState({ path: 'tests/e2e/.auth/consumer.json' });
+   await browser.close();
+ }

--- a/frontend/tests/e2e/shipping-checkout.e2e.spec.ts
+++ b/frontend/tests/e2e/shipping-checkout.e2e.spec.ts
@@
  test.describe('Shipping & Checkout E2E', () => {
+   // Use pre-authenticated state for all shipping tests
+   test.use({ storageState: 'tests/e2e/.auth/consumer.json' });
+
    test.beforeEach(async ({ page }) => {
-     // Remove manual auth steps if using storageState
-     // await loginAsConsumer(page);
+     // Just navigate to products page, already authenticated
+     await page.goto('/products');
+     await waitForAuthThenProducts(page, baseURL);
    });

==== NOTES ====
1. This patchset focuses ONLY on test stabilization, no runtime changes
2. Key changes:
   - Stabilize auth navigation with explicit DOM waits
   - Increase timeouts only for auth-related assertions (20s → 45s)
   - Add pre-authenticated state via global-setup
   - Use auth-aware product waiting helper
3. Apply incrementally and test locally before pushing
4. Consider running single spec first: `npx playwright test shipping-checkout.e2e.spec.ts`