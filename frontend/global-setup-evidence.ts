import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Setup for PR-PP03-A Evidence Collection
 * Ensures proper environment and artifact directories
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting PR-PP03-A Evidence Collection Setup...');
  
  // Create necessary directories
  const dirs = [
    'test-results',
    'test-results/videos',
    'test-results/traces',
    'test-results/screenshots',
    'playwright-report-evidence'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Verify applications are running
  const baseURL = config.projects[0].use?.baseURL || 'http://127.0.0.1:3001';
  
  try {
    console.log(`🔍 Checking if frontend is running at ${baseURL}...`);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(baseURL, { timeout: 10000 });
    console.log('✅ Frontend is accessible');
    
    // Check API connectivity
    console.log('🔍 Checking API connectivity...');
    await page.goto(`${baseURL}/products/1`, { timeout: 15000 });
    console.log('✅ API connectivity confirmed');
    
    await browser.close();
  } catch (error) {
    console.error('❌ Application health check failed:', error);
    throw new Error(`Applications not ready. Please ensure frontend is running at ${baseURL}`);
  }
  
  // Create evidence collection manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    testSuite: 'PR-PP03-A: PDP Robustness Evidence',
    baseURL,
    configuration: {
      trace: 'on',
      video: 'on', 
      screenshot: 'on',
      slowMo: 500
    },
    expectedArtifacts: [
      'Screenshots: 13 total evidence screenshots',
      'Videos: 8 test execution videos',
      'Traces: 8 detailed execution traces',
      'HTML Report: Comprehensive test results',
      'JSON Results: Machine-readable test data'
    ]
  };
  
  fs.writeFileSync('test-results/evidence-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('📋 Evidence collection manifest created');
  console.log('🎯 Setup complete. Ready for evidence generation...\n');
}

export default globalSetup;