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
  
  const baseURL = config.projects[0]?.use?.baseURL || 'http://127.0.0.1:3030';
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
    // Import TestAuthHelper for proper auth flow
    const { TestAuthHelper } = await import('./e2e/helpers/test-auth');

    // Setup Consumer Auth
    console.log('🔐 Creating consumer storageState using TestAuthHelper...');
    const consumerContext = await browser.newContext({ baseURL });
    const consumerPage = await consumerContext.newPage();

    const consumerHelper = new TestAuthHelper(consumerPage);
    await consumerHelper.testLogin('consumer');
    console.log('✅ Consumer authenticated successfully');

    // Save consumer storageState
    await consumerContext.storageState({ path: path.join(authDir, 'consumer.json') });
    await consumerContext.close();

    // Setup Producer Auth
    console.log('🔐 Creating producer storageState using TestAuthHelper...');
    const producerContext = await browser.newContext({ baseURL });
    const producerPage = await producerContext.newPage();

    const producerHelper = new TestAuthHelper(producerPage);
    await producerHelper.testLogin('producer');
    console.log('✅ Producer authenticated successfully');

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