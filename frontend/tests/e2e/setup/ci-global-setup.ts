import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Pass 46: CI-specific globalSetup for deterministic E2E auth
 *
 * Creates a mock authenticated state that works with the test API server.
 * This enables running auth-dependent E2E tests in CI without real Laravel.
 *
 * Strategy:
 * - Launch browser to establish origin context
 * - Set localStorage auth tokens (recognized by AuthContext MSW bridge)
 * - Save storageState for use by authenticated test projects
 */
async function ciGlobalSetup() {
  const baseURL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
  const storageStatePath = path.join(__dirname, '../../../test-results/storageState.json');

  console.log('🔐 Pass 46: CI Global Setup - Creating mock auth state');
  console.log(`   Base URL: ${baseURL}`);

  // Ensure test-results directory exists
  const testResultsDir = path.dirname(storageStatePath);
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to establish origin (required for localStorage access)
    console.log('   Navigating to establish origin context...');
    await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Set mock authentication state in localStorage
    // These keys are recognized by AuthContext's MSW bridge (see AuthContext.tsx:38)
    await page.evaluate(() => {
      // Primary auth token - triggers MSW bridge bypass in AuthContext
      localStorage.setItem('auth_token', 'mock_token');

      // User identity
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@example.com');
      localStorage.setItem('user_name', 'E2E Test Consumer');

      // E2E mode flag
      localStorage.setItem('e2e_mode', 'true');

      // Cart initialization
      localStorage.setItem('cart_id', 'e2e-cart-001');
    });

    console.log('   Mock auth tokens set in localStorage');

    // Also set a cookie for backend auth (if needed by API calls)
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock_token',
        domain: '127.0.0.1',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      }
    ]);

    // Save the complete storage state
    await context.storageState({ path: storageStatePath });

    console.log('✅ CI storageState saved successfully');
    console.log(`   Path: ${storageStatePath}`);

    // Verify the file was created
    if (fs.existsSync(storageStatePath)) {
      const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8'));
      console.log(`   Origins: ${state.origins?.length || 0}`);
      console.log(`   Cookies: ${state.cookies?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ CI Global Setup failed:', error);

    // Create a minimal fallback storageState so tests don't crash
    const fallbackState = {
      cookies: [],
      origins: [{
        origin: baseURL,
        localStorage: [
          { name: 'auth_token', value: 'mock_token' },
          { name: 'user_id', value: '1' },
          { name: 'user_role', value: 'consumer' },
          { name: 'e2e_mode', value: 'true' }
        ]
      }]
    };
    fs.writeFileSync(storageStatePath, JSON.stringify(fallbackState, null, 2));
    console.log('⚠️  Created fallback storageState');

  } finally {
    await browser.close();
  }
}

export default ciGlobalSetup;
