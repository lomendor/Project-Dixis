import { chromium, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Pass 46: CI-specific globalSetup for deterministic E2E auth
 * Pass 63: Added readiness gate to prevent cold-start timeouts
 *
 * Creates a mock authenticated state that works with the test API server.
 * This enables running auth-dependent E2E tests in CI without real Laravel.
 *
 * Strategy:
 * - Wait for production to be ready (healthz check with retries)
 * - Launch browser to establish origin context
 * - Set localStorage auth tokens (recognized by AuthContext MSW bridge)
 * - Save storageState for use by authenticated test projects
 */

/**
 * Wait for production healthz with exponential backoff
 */
async function waitForHealthz(baseUrl: string): Promise<boolean> {
  const healthzUrl = `${baseUrl}/api/healthz`;
  const maxAttempts = 6;
  const initialDelayMs = 2000;
  const maxDelayMs = 15000;

  console.log(`🔍 Checking production readiness: ${healthzUrl}`);

  for (let i = 0; i < maxAttempts; i++) {
    const delay = Math.min(initialDelayMs * Math.pow(2, i), maxDelayMs);

    try {
      const ctx = await request.newContext();
      const res = await ctx.get(healthzUrl, { timeout: 15000 });
      await ctx.dispose();

      if (res.ok()) {
        console.log(`✅ Production ready after ${i + 1} attempt(s)`);
        return true;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (i < maxAttempts - 1) {
        console.log(`   Attempt ${i + 1}/${maxAttempts} failed (${msg}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.log(`⚠️ Production may be slow, proceeding anyway...`);
  return false;
}

async function ciGlobalSetup() {
  const baseURL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
  const storageStatePath = path.join(__dirname, '../../../test-results/storageState.json');

  console.log('🔐 Pass 46: CI Global Setup - Creating mock auth state');
  console.log(`   Base URL: ${baseURL}`);

  // Pass 63: Wait for production to be ready before attempting navigation
  await waitForHealthz(baseURL);

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
    // Pass 63: Increased timeout after readiness gate should have warmed up the site
    console.log('   Navigating to establish origin context...');
    await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 60000 });

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

    // Also set cookies for backend auth and middleware auth bypass
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock_token',
        domain: '127.0.0.1',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      },
      {
        name: 'mock_session',
        value: 'e2e_authenticated',
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
      cookies: [{
        name: 'mock_session',
        value: 'e2e_authenticated',
        domain: '127.0.0.1',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
        expires: -1
      }],
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
