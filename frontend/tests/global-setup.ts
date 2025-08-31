import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

/**
 * Global Setup - Create authenticated storageState files
 * Runs ONCE before all tests to avoid UI login in every test
 */

const TEST_USERS = {
  consumer: { email: 'test@dixis.local', password: 'Passw0rd!' },
  producer: { email: 'producer@dixis.local', password: 'Passw0rd!' },
};

async function globalSetup(config: FullConfig) {
  console.log('🔐 Setting up authenticated storageState files...');
  
  const baseURL = config.projects[0]?.use?.baseURL || 'http://127.0.0.1:3001';
  const authDir = path.join(__dirname, '../.auth');
  
  // Create browser and context for setup
  const browser = await chromium.launch();
  
  try {
    // Setup Consumer Auth
    console.log('🔐 Creating consumer storageState...');
    const consumerContext = await browser.newContext();
    const consumerPage = await consumerContext.newPage();
    
    await consumerPage.goto(`${baseURL}/login`);
    
    // Wait for login form with stable selectors
    await consumerPage.waitForSelector('[data-testid="login-form"], form', { timeout: 15000 });
    
    // Fill login form using data-testid selectors
    const emailInput = consumerPage.locator('[data-testid="login-email"], [name="email"], input[type="email"]').first();
    const passwordInput = consumerPage.locator('[data-testid="login-password"], [name="password"], input[type="password"]').first();
    const submitButton = consumerPage.locator('[data-testid="login-submit"], button[type="submit"], button:has-text("Login")').first();
    
    await emailInput.fill(TEST_USERS.consumer.email);
    await passwordInput.fill(TEST_USERS.consumer.password);
    await submitButton.click();
    
    // Wait for successful login (redirect away from login page)
    await consumerPage.waitForURL((url) => !url.pathname.includes('/login'), { 
      timeout: 15000,
      waitUntil: 'networkidle' 
    });
    
    // Save consumer storageState
    await consumerContext.storageState({ path: path.join(authDir, 'consumer.json') });
    await consumerContext.close();
    
    // Setup Producer Auth
    console.log('🔐 Creating producer storageState...');
    const producerContext = await browser.newContext();
    const producerPage = await producerContext.newPage();
    
    await producerPage.goto(`${baseURL}/login`);
    
    // Wait for login form
    await producerPage.waitForSelector('[data-testid="login-form"], form', { timeout: 15000 });
    
    // Fill producer login form
    const producerEmail = producerPage.locator('[data-testid="login-email"], [name="email"], input[type="email"]').first();
    const producerPassword = producerPage.locator('[data-testid="login-password"], [name="password"], input[type="password"]').first();
    const producerSubmit = producerPage.locator('[data-testid="login-submit"], button[type="submit"], button:has-text("Login")').first();
    
    await producerEmail.fill(TEST_USERS.producer.email);
    await producerPassword.fill(TEST_USERS.producer.password);
    await producerSubmit.click();
    
    // Wait for successful producer login
    await producerPage.waitForURL((url) => !url.pathname.includes('/login'), { 
      timeout: 15000,
      waitUntil: 'networkidle' 
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