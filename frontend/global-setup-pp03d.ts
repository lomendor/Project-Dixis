import { chromium, FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';

/**
 * Global Setup for PR-PP03-D: Checkout Edge Cases Evidence Generation
 * Prepares test environment, authenticates users, and sets up data for comprehensive testing
 */

const EVIDENCE_DIR = 'test-results/pr-pp03-d-evidence';
const API_BASE_URL = 'http://127.0.0.1:8001/api/v1';
const FRONTEND_URL = 'http://127.0.0.1:3001';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting PR-PP03-D Global Setup...');
  
  // Create evidence directories
  await createDirectories();
  
  // Wait for services to be ready
  await waitForServices();
  
  // Set up test user and authentication
  await setupTestUser();
  
  // Verify checkout system components
  await verifyCheckoutSystem();
  
  // Generate setup report
  await generateSetupReport();
  
  console.log('✅ PR-PP03-D Global Setup completed successfully!');
}

/**
 * Create necessary directories for evidence collection
 */
async function createDirectories() {
  console.log('📁 Creating evidence directories...');
  
  const directories = [
    EVIDENCE_DIR,
    `${EVIDENCE_DIR}/screenshots`,
    `${EVIDENCE_DIR}/payloads`,
    `${EVIDENCE_DIR}/gif-frames`,
    `${EVIDENCE_DIR}/api-logs`,
    `${EVIDENCE_DIR}/validation-errors`
  ];
  
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`  ✅ Created: ${dir}`);
  }
}

/**
 * Wait for both frontend and backend services to be ready
 */
async function waitForServices() {
  console.log('⏳ Waiting for services to be ready...');
  
  // Wait for backend API
  console.log('  🔧 Checking backend API...');
  let backendReady = false;
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds
  
  while (!backendReady && attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        backendReady = true;
        console.log('  ✅ Backend API is ready');
      }
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        console.log(`  ⚠️ Backend API not responding after ${maxAttempts} attempts`);
        console.log('  📝 Continuing with setup - tests will handle API failures');
      } else {
        await sleep(1000);
      }
    }
  }
  
  // Wait for frontend
  console.log('  🖥️ Checking frontend...');
  let frontendReady = false;
  attempts = 0;
  
  while (!frontendReady && attempts < maxAttempts) {
    try {
      const response = await fetch(FRONTEND_URL);
      if (response.ok) {
        frontendReady = true;
        console.log('  ✅ Frontend is ready');
      }
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        throw new Error(`Frontend not ready after ${maxAttempts} attempts`);
      }
      await sleep(1000);
    }
  }
}

/**
 * Set up test user and verify authentication system
 */
async function setupTestUser() {
  console.log('👤 Setting up test user...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    // Check if login form exists
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    const submitButton = await page.locator('button[type="submit"]').first();
    
    if (await emailInput.isVisible()) {
      console.log('  📝 Login form found, attempting authentication...');
      
      await emailInput.fill(TEST_USER.email);
      await passwordInput.fill(TEST_USER.password);
      await submitButton.click();
      
      // Wait for redirect or error
      await page.waitForTimeout(3000);
      
      // Check if login was successful (not on login page anymore)
      const currentUrl = page.url();
      if (!currentUrl.includes('/auth/login')) {
        console.log('  ✅ Test user authentication successful');
        
        // Save authentication state
        const storage = await page.context().storageState();
        await fs.writeFile(
          `${EVIDENCE_DIR}/auth-state.json`,
          JSON.stringify(storage, null, 2)
        );
        console.log('  💾 Authentication state saved');
      } else {
        console.log('  ⚠️ Test user may need to be created first');
        console.log('  📝 Tests will handle user creation as needed');
      }
    } else {
      console.log('  ⚠️ Login form not found - may be auto-authenticated');
    }
    
  } catch (error) {
    console.log(`  ⚠️ Auth setup error: ${error}`);
    console.log('  📝 Tests will handle authentication independently');
  } finally {
    await browser.close();
  }
}

/**
 * Verify checkout system components are available
 */
async function verifyCheckoutSystem() {
  console.log('🛒 Verifying checkout system components...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if cart page loads
    await page.goto(`${FRONTEND_URL}/cart`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Look for key checkout elements
    const checkoutElements = [
      '[data-testid="postal-code-input"]',
      '[data-testid="city-input"]',
      '[data-testid="checkout-btn"]'
    ];
    
    let foundElements = 0;
    for (const selector of checkoutElements) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          foundElements++;
        }
      } catch {
        // Element not found, continue
      }
    }
    
    console.log(`  📊 Found ${foundElements}/${checkoutElements.length} checkout elements`);
    
    if (foundElements > 0) {
      console.log('  ✅ Checkout system components are accessible');
    } else {
      console.log('  ⚠️ Checkout system may require authentication first');
    }
    
  } catch (error) {
    console.log(`  ⚠️ Checkout verification error: ${error}`);
    console.log('  📝 Tests will verify components independently');
  } finally {
    await browser.close();
  }
}

/**
 * Generate setup report with system information
 */
async function generateSetupReport() {
  console.log('📄 Generating setup report...');
  
  const setupReport = {
    timestamp: new Date().toISOString(),
    testSuite: 'PR-PP03-D: Checkout Edge Cases Evidence Generation',
    environment: {
      frontend_url: FRONTEND_URL,
      backend_api: API_BASE_URL,
      node_env: process.env.NODE_ENV || 'test'
    },
    test_scope: {
      checkout_validation: 'Greek postal code and city validation',
      error_messages: 'Greek error message localization',
      network_retry: 'Exponential backoff retry mechanisms',
      api_payloads: 'Complete POST /orders payload capture',
      edge_cases: 'Empty cart, network failures, authentication'
    },
    evidence_artifacts: [
      'Screenshots of validation errors',
      'Greek error message captures',
      'GIF of complete checkout flow',
      'POST /orders payload with shipping data',
      'Network retry mechanism demonstrations',
      'Edge case scenario documentation'
    ],
    validation_scenarios: [
      'Invalid postal code format (123)',
      'Invalid postal code (99999)',
      'City-postal code mismatch',
      'Empty required fields',
      'Network timeouts and retries',
      'Shipping calculation failures'
    ],
    greek_error_messages: [
      'Εισάγετε έγκυρο ΤΚ (5 ψηφία)',
      'Η πόλη είναι υποχρεωτική',
      'Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα',
      'Πρόβλημα σύνδεσης δικτύου',
      'Εκτιμώμενο κόστος μεταφορικών'
    ],
    setup_completed: true
  };
  
  await fs.writeFile(
    `${EVIDENCE_DIR}/setup-report.json`,
    JSON.stringify(setupReport, null, 2),
    'utf-8'
  );
  
  console.log('  💾 Setup report saved to setup-report.json');
}

/**
 * Utility function for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default globalSetup;