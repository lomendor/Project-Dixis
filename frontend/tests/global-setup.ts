import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

/**
 * Global Setup - Create authenticated storageState files
 * Enhanced with server readiness checks and deterministic waits
 */

const TEST_USERS = {
  consumer: { 
    email: process.env.LOGIN_EMAIL || 'test@dixis.local', 
    password: process.env.LOGIN_PASSWORD || 'Passw0rd!' 
  },
  producer: { 
    email: process.env.PRODUCER_EMAIL || 'producer@dixis.local', 
    password: process.env.PRODUCER_PASSWORD || 'Passw0rd!' 
  },
};

// Enhanced server readiness check
async function waitForServerReady(baseURL: string, maxRetries = 10): Promise<void> {
  console.log(`⏳ Checking server readiness at ${baseURL}...`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${baseURL}/auth/login`);
      if (response.ok) {
        console.log('✅ Server is ready!');
        return;
      }
    } catch (error) {
      console.log(`🔄 Retry ${i + 1}/${maxRetries} - Server not ready yet...`);
    }
    
    // Wait 2s between retries
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error(`❌ Server not ready after ${maxRetries} attempts at ${baseURL}`);
}

// Enhanced login with better error handling
async function performLogin(page: any, user: { email: string; password: string; }, userType: string): Promise<void> {
  console.log(`🔐 Logging in as ${userType}...`);
  
  // Navigate with explicit error handling
  await page.goto('/auth/login', { timeout: 15000 });
  
  // Wait for form with better error context
  try {
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 15000 });
  } catch (error) {
    console.error(`❌ Login form not found for ${userType}`);
    throw new Error(`Login form selector failed for ${userType}: ${error}`);
  }
  
  // Deterministic form interaction with readiness checks
  await page.getByTestId('login-email').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByTestId('login-email').fill(user.email);
  
  await page.getByTestId('login-password').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByTestId('login-password').fill(user.password);
  
  // Submit with network wait strategy
  await page.getByTestId('login-submit').click();
  
  // Enhanced navigation verification with multiple success patterns
  try {
    await page.waitForURL((url: URL) => {
      const validPaths = ['/', '/products', '/dashboard'];
      return validPaths.some(path => url.pathname === path || url.pathname.startsWith(path));
    }, { 
      timeout: 15000,
      waitUntil: 'domcontentloaded' // More reliable than networkidle
    });
    
    console.log(`✅ ${userType} login successful!`);
  } catch (error) {
    console.error(`❌ ${userType} login navigation failed:`, error);
    throw new Error(`Login navigation failed for ${userType}: ${error}`);
  }
}

async function globalSetup(config: FullConfig) {
  console.log('🔐 Enhanced E2E Setup - Creating authenticated storageState files...');
  
  const baseURL = config.projects[0]?.use?.baseURL || 'http://127.0.0.1:3001';
  const authDir = path.join(__dirname, '../.auth');
  
  console.log(`🔗 Using baseURL: ${baseURL}`);
  
  // Critical: Wait for server readiness before proceeding
  await waitForServerReady(baseURL);
  
  // Create browser with explicit options for CI stability
  const browser = await chromium.launch({
    timeout: 30000,
    // CI-friendly options
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  try {
    // Setup Consumer Auth with enhanced error handling
    const consumerContext = await browser.newContext({ 
      baseURL,
      // Ensure clean state
      acceptDownloads: false,
      ignoreHTTPSErrors: true
    });
    const consumerPage = await consumerContext.newPage();
    
    await performLogin(consumerPage, TEST_USERS.consumer, 'consumer');
    await consumerContext.storageState({ path: path.join(authDir, 'consumer.json') });
    await consumerContext.close();
    
    // Setup Producer Auth with enhanced error handling
    const producerContext = await browser.newContext({ 
      baseURL,
      acceptDownloads: false,
      ignoreHTTPSErrors: true
    });
    const producerPage = await producerContext.newPage();
    
    await performLogin(producerPage, TEST_USERS.producer, 'producer');
    await producerContext.storageState({ path: path.join(authDir, 'producer.json') });
    await producerContext.close();
    
    console.log('✅ StorageState files created successfully!');
    console.log(`   Consumer: ${path.join(authDir, 'consumer.json')}`);
    console.log(`   Producer: ${path.join(authDir, 'producer.json')}`);
    
  } catch (error) {
    console.error('❌ Enhanced global setup failed:', error);
    // Provide actionable error context
    console.error('🔍 Debug info:');
    console.error(`   BaseURL: ${baseURL}`);
    console.error(`   Auth Dir: ${authDir}`);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;