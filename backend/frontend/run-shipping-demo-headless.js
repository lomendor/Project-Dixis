#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Dixis Shipping Integration Demo (Headless)');
console.log('===============================================');
console.log('Running test in headless mode for faster execution...');
console.log('');

// Ensure test-results directory exists
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
  console.log('📁 Created test-results directory');
}

// Run the specific shipping integration test
const playwrightProcess = spawn('npx', [
  'playwright', 
  'test', 
  'shipping-integration.spec.ts',
  '--project=chromium',  // Use only chromium
  '--timeout=60000',  // 1 minute timeout
  '--retries=0',  // No retries for demo
  '--workers=1'  // Single worker
], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    E2E_BASE_URL: 'http://localhost:3001'
  }
});

playwrightProcess.on('close', (code) => {
  console.log('');
  console.log('🎯 Test Results');
  console.log('===============');
  
  if (code === 0) {
    console.log('✅ Test completed successfully!');
    
    // List all screenshots
    try {
      const files = fs.readdirSync(testResultsDir);
      const screenshots = files.filter(f => f.includes('shipping-demo') && f.endsWith('.png'));
      if (screenshots.length > 0) {
        console.log('📸 Screenshots captured:');
        screenshots.sort().forEach((file, index) => {
          console.log(`  ${index + 1}. ${file}`);
        });
      }
    } catch (err) {
      console.log('⚠️ Could not read screenshots');
    }
    
    console.log('');
    console.log('🎉 Demo completed successfully!');
    
  } else {
    console.log(`❌ Test failed with exit code: ${code}`);
    console.log('📊 Run the HTML report for details: npx playwright show-report');
  }
});

playwrightProcess.on('error', (err) => {
  console.error('❌ Failed to start test:', err.message);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  playwrightProcess.kill('SIGINT');
  process.exit(1);
});