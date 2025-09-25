import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Save storage state for E2E tests to avoid auth issues
 * This creates a mock auth session for E2E testing
 */
async function saveStorageState() {
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
  const storageStatePath = path.join(__dirname, '../.artifacts/storage-state.json');

  // Ensure artifacts directory exists
  const artifactsDir = path.dirname(storageStatePath);
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log('🔒 Saving storage state for E2E tests...');
  console.log(`   Base URL: ${baseURL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to homepage to establish origin
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');

    // Set E2E mock auth data
    await page.evaluate(() => {
      // Mock auth token for E2E
      localStorage.setItem('authToken', 'e2e-test-token');
      localStorage.setItem('userRole', 'consumer');
      localStorage.setItem('userId', 'e2e-test-user');
      localStorage.setItem('e2eMode', 'true');

      // Set mock user preferences
      localStorage.setItem('locale', 'el');
      localStorage.setItem('cartId', 'e2e-cart-001');
    });

    // Save the storage state
    await context.storageState({ path: storageStatePath });

    console.log('✅ Storage state saved to:', storageStatePath);
    console.log('   Items set: authToken, userRole, userId, e2eMode, locale, cartId');

  } catch (error) {
    console.error('❌ Failed to save storage state:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  saveStorageState().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { saveStorageState };