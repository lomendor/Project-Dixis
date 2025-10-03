import * as fs from 'fs';
import * as path from 'path';
import { request } from '@playwright/test';

/**
 * Simple .env parser (avoids adding dotenv dependency)
 */
function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, 'utf8');
  const result: Record<string, string> = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        result[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });

  return result;
}

/**
 * Phase-4: API-first authentication without UI login
 * Creates storageState directly via Laravel/Sanctum API calls
 * Solves Phase-3c circular dependency and cookie domain mismatch
 */
async function globalSetup() {
  // Skip backend-dependent setup in CI (use test-level route stubs instead)
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    console.log('⏭️  CI detected: Skipping global API auth AND storageState creation (Pass 34)');
    console.log('   Tests will handle auth via UI login or route stubs');

    // Pass 34: Do NOT create storageState in CI to avoid cookie validation errors
    // Projects are configured without storageState in playwright.config.ts
    return;
  }

  console.log('🚀 Phase-4: API-first authentication starting...');

  // Load environment variables from .env.e2e.example as fallback
  const envPath = path.join(__dirname, '../../../.env.e2e.example');
  const envExample = parseEnvFile(envPath);

  // Get configuration with normalization
  let apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || envExample.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';
  let baseURL = process.env.PLAYWRIGHT_BASE_URL || envExample.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3030';

  // Phase-4: NORMALIZE hosts - force everything to 127.0.0.1
  apiBaseURL = apiBaseURL.replace('localhost', '127.0.0.1');
  baseURL = baseURL.replace('localhost', '127.0.0.1');

  const email = process.env.E2E_CONSUMER_EMAIL || envExample.E2E_CONSUMER_EMAIL || 'consumer@example.com';
  const password = process.env.E2E_CONSUMER_PASSWORD || envExample.E2E_CONSUMER_PASSWORD || 'password';

  // Extract API base (remove /api/v1 suffix if present)
  const apiBase = apiBaseURL.replace(/\/api\/v1$/, '');

  console.log(`🔗 Phase-4 Hosts: FE=${new URL(baseURL).hostname}, API=${new URL(apiBase).hostname}`);
  console.log(`📧 Auth credentials: ${email} / ${password ? '***' : 'MISSING'}`);

  const storageStatePath = path.join(__dirname, '../../../test-results/storageState.json');

  // Ensure test-results directory exists
  const testResultsDir = path.dirname(storageStatePath);
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  try {
    // Create request context for API calls
    const requestContext = await request.newContext({ baseURL: apiBase });
    console.log(`🌐 API request context created for: ${apiBase}`);

    // Phase-4: Laravel/Sanctum authentication flow
    let cookiesObtained: any[] = [];
    let authSuccess = false;

    try {
      // Step 1: Get CSRF cookie (Laravel Sanctum)
      console.log('🔐 Step 1: Getting CSRF cookie...');
      const csrfResponse = await requestContext.get('/sanctum/csrf-cookie');
      console.log(`   CSRF response: ${csrfResponse.status()} ${csrfResponse.statusText()}`);

      if (csrfResponse.ok()) {
        // Step 2: Get current cookies after CSRF call
        const storageState = await requestContext.storageState();
        const csrfCookie = storageState.cookies.find(c => c.name === 'XSRF-TOKEN');
        console.log(`   CSRF Token obtained: ${csrfCookie ? 'YES' : 'NO'}`);

        // Step 3: Attempt login with CSRF token
        console.log('🔑 Step 2: Attempting Laravel login...');
        const loginHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };

        if (csrfCookie) {
          loginHeaders['X-XSRF-TOKEN'] = decodeURIComponent(csrfCookie.value);
        }

        // Try web login first (/login)
        const loginResponse = await requestContext.post('/login', {
          data: { email, password },
          headers: loginHeaders
        });

        console.log(`   Login response: ${loginResponse.status()} ${loginResponse.statusText()}`);

        if (loginResponse.ok()) {
          authSuccess = true;
          console.log('✅ Web login successful');
        } else {
          // Fallback: Try API login (/api/v1/auth/login)
          console.log('🔄 Fallback: Trying API auth login...');
          const apiLoginResponse = await requestContext.post('/api/v1/auth/login', {
            data: { email, password },
            headers: loginHeaders
          });

          console.log(`   API Login response: ${apiLoginResponse.status()} ${apiLoginResponse.statusText()}`);

          if (apiLoginResponse.ok()) {
            authSuccess = true;
            console.log('✅ API login successful');
          } else {
            // Final fallback: Try /api/v1/login
            console.log('🔄 Final fallback: Trying /api/v1/login...');
            const apiV1LoginResponse = await requestContext.post('/api/v1/login', {
              data: { email, password },
              headers: loginHeaders
            });

            console.log(`   /api/v1/login response: ${apiV1LoginResponse.status()} ${apiV1LoginResponse.statusText()}`);

            if (apiV1LoginResponse.ok()) {
              authSuccess = true;
              console.log('✅ /api/v1/login successful');
            } else {
              const errorText = await apiV1LoginResponse.text();
              console.error(`❌ All login attempts failed. Last error: ${errorText}`);
            }
          }
        }
      } else {
        console.error(`❌ CSRF endpoint failed: ${csrfResponse.status()}`);
      }
    } catch (error) {
      console.error('❌ Authentication flow error:', error);
    }

    if (authSuccess) {
      // Get final storage state with authentication cookies
      const finalStorageState = await requestContext.storageState();
      cookiesObtained = finalStorageState.cookies;

      console.log(`🍪 Cookies obtained: ${cookiesObtained.length} total`);
      cookiesObtained.forEach(cookie => {
        console.log(`   - ${cookie.name} (domain: ${cookie.domain})`);
      });

      // Phase-4: Validation - ensure we have session cookies from 127.0.0.1
      const sessionCookies = cookiesObtained.filter(c =>
        c.domain.includes('127.0.0.1') &&
        (c.name.includes('laravel_session') || c.name.includes('XSRF-TOKEN') || c.name.includes('session'))
      );

      if (sessionCookies.length === 0) {
        throw new Error('AUTH_BOOTSTRAP_FAILED: no session cookies found from 127.0.0.1 domain');
      }

      console.log(`✅ Session cookies verified: ${sessionCookies.map(c => c.name).join(', ')}`);

      // Save storageState to file
      fs.writeFileSync(storageStatePath, JSON.stringify(finalStorageState, null, 2));
      console.log(`💾 StorageState saved to: ${storageStatePath}`);
      console.log('🎉 Phase-4 API-first authentication completed successfully!');

    } else {
      throw new Error('AUTH_BOOTSTRAP_FAILED: all authentication endpoints failed');
    }

    await requestContext.dispose();

  } catch (error) {
    console.error('❌ Phase-4 global setup failed:', error);

    // Clean up any partial storageState file
    if (fs.existsSync(storageStatePath)) {
      fs.unlinkSync(storageStatePath);
    }

    throw error;
  }
}

export default globalSetup;