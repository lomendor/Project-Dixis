import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

/**
 * Global Setup - Create authenticated storageState files
 * Runs ONCE before all tests to avoid UI login in every test
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

async function globalSetup(config: FullConfig) {
  console.log('🔐 Setting up authenticated storageState files...');
  
  const baseURL = config.projects[0]?.use?.baseURL || 'http://127.0.0.1:3001';
  const authDir = path.join(__dirname, '../.auth');
  
  console.log(`🔗 Using baseURL: ${baseURL}`);
  
  // Create browser and context for setup
  const browser = await chromium.launch();
  
  try {
    // Setup Consumer Auth
    console.log('🔐 Creating consumer storageState...');
    const consumerContext = await browser.newContext({
      baseURL: baseURL,
      storageState: undefined,
    });
    const consumerPage = await consumerContext.newPage();
    
    await consumerPage.goto('/auth/login');
    
    // Wait for login form with extended timeout and better element detection
    await consumerPage.waitForSelector('[data-testid="login-form"], form', { timeout: 30000 });
    
    // Use getByTestId with explicit waits for better stability
    await consumerPage.getByTestId('login-email').waitFor({ timeout: 30000 });
    
    // Fill login form using data-testid selectors
    await consumerPage.getByTestId('login-email').fill(TEST_USERS.consumer.email);
    await consumerPage.getByTestId('login-password').fill(TEST_USERS.consumer.password);
    await consumerPage.getByTestId('login-submit').click();
    
    // Wait for successful login (redirect away from login page)
    await consumerPage.waitForURL((url) => !url.pathname.includes('/login'), { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    // Save consumer storageState
    await consumerContext.storageState({ path: path.join(authDir, 'consumer.json') });
    await consumerContext.close();
    
    // Setup Producer Auth
    console.log('🔐 Creating producer storageState...');
    const producerContext = await browser.newContext({
      baseURL: baseURL,
      storageState: undefined,
    });
    const producerPage = await producerContext.newPage();
    
    await producerPage.goto('/auth/login');
    
    // Wait for login form with extended timeout  
    await producerPage.waitForSelector('[data-testid="login-form"], form', { timeout: 30000 });
    
    // Use getByTestId with explicit waits for better stability
    await producerPage.getByTestId('login-email').waitFor({ timeout: 30000 });
    
    // Fill producer login form using data-testid selectors
    await producerPage.getByTestId('login-email').fill(TEST_USERS.producer.email);
    await producerPage.getByTestId('login-password').fill(TEST_USERS.producer.password);
    await producerPage.getByTestId('login-submit').click();
    
    // Wait for successful producer login (redirect to home page)
    await producerPage.waitForURL(/^[^?]*\/(dashboard|$)/, { 
      timeout: 15000,
      waitUntil: 'domcontentloaded' 
    });
    
    // Save producer storageState
    await producerContext.storageState({ path: path.join(authDir, 'producer.json') });
    await producerContext.close();
    
    console.log('✅ StorageState files created successfully!');
    console.log(`   Consumer: ${path.join(authDir, 'consumer.json')}`);
    console.log(`   Producer: ${path.join(authDir, 'producer.json')}`);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;