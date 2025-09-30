import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';

/**
 * Phase-3c: Create storageState for consumer authentication
 * Replaces UI login with pre-authenticated state
 */
async function createConsumerStorageState() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030';
  const email = process.env.E2E_CONSUMER_EMAIL || 'consumer@example.com';
  const password = process.env.E2E_CONSUMER_PASSWORD || 'password';

  console.log(`Creating consumer storageState for ${email} at ${baseURL}...`);

  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/auth/login`, { waitUntil: 'load' });

    // Fill credentials
    await page.locator('input[name="email"], input[type="email"]').first().fill(email);
    await page.locator('input[name="password"], input[type="password"]').first().fill(password);

    // Submit and wait for navigation away from login
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.locator('button[type="submit"]').click()
    ]);

    // Verify we're no longer on login page
    await page.waitForFunction(
      () => !window.location.pathname.includes('/auth/login'),
      { timeout: 30000 }
    );

    // Save storage state
    const authPath = path.join(__dirname, '../.auth/consumer.json');
    await context.storageState({ path: authPath });

    console.log(`✅ Consumer storageState saved to: ${authPath}`);

  } catch (error) {
    console.error('❌ Failed to create consumer storageState:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  createConsumerStorageState().catch(process.exit);
}

export { createConsumerStorageState };