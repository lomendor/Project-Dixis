import { test, expect } from '@playwright/test';

test.describe('[auth-probe] Diagnostic test to inspect app state after login', () => {
  test('shows what the app renders after CI login attempt', async ({ page }) => {
    const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
    const apiBase = process.env.API_BASE_URL || 'http://127.0.0.1:8001';

    console.log('[auth-probe] Starting diagnostic...');
    console.log('[auth-probe] BASE_URL:', base);
    console.log('[auth-probe] API_BASE_URL:', apiBase);

    // Capture console messages
    page.on('console', msg => {
      console.log(`[browser-console] ${msg.type()}: ${msg.text()}`);
    });

    // Capture network errors
    page.on('requestfailed', request => {
      console.log(`[network-error] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // 1) Navigate to landing page
    console.log('[auth-probe] Navigating to:', base);
    await page.goto(base, { waitUntil: 'domcontentloaded' });

    // 2) Check API auth status
    try {
      const resp = await page.request.get(`${apiBase}/api/producer/status`);
      console.log('[auth-probe] Producer status:', resp.status(), await resp.text());
    } catch (e) {
      console.log('[auth-probe] Producer status error:', e);
    }

    // 3) Dump page title and URL
    console.log('[auth-probe] Page title:', await page.title());
    console.log('[auth-probe] Current URL:', page.url());

    // 4) Dump HTML snippet for inspection
    const html = await page.content();
    const snippet = html.slice(0, 1000).replace(/\s+/g, ' ');
    console.log('[auth-probe] HTML snippet:', snippet.slice(0, 800));

    // 5) Check for common navigation elements
    const candidates = [
      { name: 'Products text', locator: page.getByText(/Products|Προϊόντα|Shop|Κατάστημα/i) },
      { name: 'Products link', locator: page.getByRole('link', { name: /Products|Προϊόντα|Shop|Κατάστημα/i }) },
      { name: 'Products heading', locator: page.getByRole('heading', { name: /Products|Προϊόντα/i }) },
      { name: 'Login button', locator: page.getByRole('button', { name: /login|signin|σύνδεση/i }) },
      { name: 'User menu', locator: page.locator('[data-testid="user-menu"]') },
    ];

    console.log('[auth-probe] Checking for navigation elements...');
    for (const { name, locator } of candidates) {
      try {
        const count = await locator.count();
        const visible = count > 0 ? await locator.first().isVisible() : false;
        console.log(`[auth-probe] ${name}: count=${count}, visible=${visible}`);
      } catch (e) {
        console.log(`[auth-probe] ${name}: error -`, e.message);
      }
    }

    // 6) Check localStorage and cookies
    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    console.log('[auth-probe] localStorage:', localStorage);

    const cookies = await page.context().cookies();
    console.log('[auth-probe] Cookies:', JSON.stringify(cookies.map(c => ({ name: c.name, value: c.value.slice(0, 20) }))));

    // 7) Take screenshot for visual inspection
    await page.screenshot({ path: 'test-results/auth-probe-state.png', fullPage: true });
    console.log('[auth-probe] Screenshot saved to test-results/auth-probe-state.png');

    console.log('[auth-probe] Diagnostic complete');
  });
});
