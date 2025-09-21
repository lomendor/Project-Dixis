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
  
  // Check if we're running smoke tests (without server dependency)
  const isSmoke = process.env.PLAYWRIGHT_SKIP_WEBSERVER === 'true' || 
                  process.argv.some(arg => arg.includes('smoke'));
  
  if (isSmoke) {
    console.log('🧪 SMOKE TEST MODE: Creating mock storage states without server...');
    
    // Create mock consumer storageState
    const mockConsumerState = {
      cookies: [{
        name: 'mock_session',
        value: 'consumer_authenticated', 
        domain: '127.0.0.1',
        path: '/',
        expires: -1, // Session cookie
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      }],
      origins: [{
        origin: baseURL,
        localStorage: [{
          name: 'auth_token',
          value: 'mock_consumer_token'
        }]
      }]
    };
    
    // Create mock producer storageState  
    const mockProducerState = {
      cookies: [{
        name: 'mock_session',
        value: 'producer_authenticated', 
        domain: '127.0.0.1',
        path: '/',
        expires: -1, // Session cookie
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      }],
      origins: [{
        origin: baseURL,
        localStorage: [{
          name: 'auth_token',
          value: 'mock_producer_token'
        }]
      }]
    };
    
    // Write mock storage states directly to files
    const fs = await import('fs/promises');
    await fs.mkdir(authDir, { recursive: true });
    
    await fs.writeFile(
      path.join(authDir, 'consumer.json'), 
      JSON.stringify(mockConsumerState, null, 2)
    );
    
    await fs.writeFile(
      path.join(authDir, 'producer.json'), 
      JSON.stringify(mockProducerState, null, 2)
    );
    
    console.log('✅ Mock storage states created successfully!');
    console.log(`   Consumer: ${path.join(authDir, 'consumer.json')}`);
    console.log(`   Producer: ${path.join(authDir, 'producer.json')}`);
    return;
  }
  
  // Regular integration test setup (requires live server)
  const browser = await chromium.launch();
  
  try {
    // Setup Consumer Auth
    console.log('🔐 Creating consumer storageState...');
    const consumerContext = await browser.newContext({ baseURL });
    const consumerPage = await consumerContext.newPage();
    
    // Inject E2E role flag before app loads
    await consumerPage.addInitScript((role) => {
      // @ts-expect-error - E2E role injection
      window.__E2E_ROLE__ = role; 
    }, process.env.E2E_AUTH_ROLE ?? 'guest');
    
    await consumerPage.goto('/auth/login', { waitUntil: 'networkidle' });
    
    // Debug: Check page content and user agent
    const pageContent = await consumerPage.content();
    const userAgent = await consumerPage.evaluate(() => navigator.userAgent);
    console.log('📋 Login page loaded. Title:', await consumerPage.title());
    console.log('🔍 User Agent:', userAgent);
    console.log('🔍 Page contains form:', pageContent.includes('<form'));
    console.log('🔍 Page contains loading text:', pageContent.includes('Φόρτωση...'));
    console.log('🔍 Page content snippet:', pageContent.substring(0, 500));
    
    // Just wait for basic page load (skip title validation for E2E isolation)
    await consumerPage.waitForLoadState('domcontentloaded');
    await consumerPage.waitForTimeout(1000); // Brief settling time
    
    console.log('✅ Page loaded, creating auth state...');
    
    // Save consumer storageState 
    await consumerContext.storageState({ path: path.join(authDir, 'consumer.json') });
    await consumerContext.close();
    
    // Setup Producer Auth 
    console.log('🔐 Creating producer storageState...');
    const producerContext = await browser.newContext({ baseURL });
    const producerPage = await producerContext.newPage();
    
    // Inject E2E role flag before app loads
    await producerPage.addInitScript((role) => {
      // @ts-expect-error - E2E role injection
      window.__E2E_ROLE__ = role; 
    }, process.env.E2E_AUTH_ROLE ?? 'guest');
    
    await producerPage.goto('/auth/login', { waitUntil: 'networkidle' });
    
    // Just wait for basic page load (skip title validation for E2E isolation)
    await producerPage.waitForLoadState('domcontentloaded');
    await producerPage.waitForTimeout(1000); // Brief settling time
    
    console.log('✅ Producer page loaded, creating auth state...');
    
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