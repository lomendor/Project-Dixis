#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Dixis Shipping Integration Demo');
console.log('==================================');
console.log('');
console.log('This script will run a Playwright test to demonstrate:');
console.log('• Login with consumer@example.com / password');
console.log('• Add product to cart');
console.log('• Navigate to cart page');
console.log('• Enter postal code "11527" and city "Athens"');
console.log('• Capture shipping cost calculation');
console.log('• Verify total calculation includes shipping');
console.log('');

// Ensure test-results directory exists
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
  console.log('📁 Created test-results directory');
}

console.log('⏱️ Starting test execution...');
console.log('');

// Run the specific shipping integration test
const playwrightProcess = spawn('npx', [
  'playwright', 
  'test', 
  'shipping-integration.spec.ts',
  '--headed',  // Run in headed mode to see the browser
  '--project=chromium',  // Use only chromium for demo
  '--timeout=120000',  // 2 minute timeout
  '--retries=0'  // No retries for demo
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
    console.log('');
    console.log('📸 Screenshots captured in test-results/ directory:');
    
    // List all screenshots
    try {
      const files = fs.readdirSync(testResultsDir);
      const screenshots = files.filter(f => f.includes('shipping-demo') && f.endsWith('.png'));
      screenshots.sort().forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
      });
      
      if (screenshots.length === 0) {
        console.log('  ⚠️ No screenshots found. Check test-results/ directory manually.');
      } else {
        console.log('');
        console.log('💡 You can view the screenshots to see the shipping integration in action!');
        console.log(`📂 Open: ${testResultsDir}`);
      }
    } catch (err) {
      console.log('  ⚠️ Could not read test-results directory');
    }
    
    console.log('');
    console.log('🎉 Demo completed! The test has captured the shipping integration workflow.');
    
  } else {
    console.log(`❌ Test failed with exit code: ${code}`);
    console.log('');
    console.log('🔍 Troubleshooting tips:');
    console.log('• Make sure frontend is running on http://localhost:3001');
    console.log('• Make sure backend API is running on http://127.0.0.1:8001');
    console.log('• Check that the consumer@example.com user exists in the database');
    console.log('• Verify that products exist in the database');
    console.log('');
    console.log('📊 Check the Playwright HTML report for detailed error information:');
    console.log('  npx playwright show-report');
  }
  
  console.log('');
  console.log('📋 Manual verification checklist:');
  console.log('• ΤΚ input field accepts "11527" ');
  console.log('• City input field accepts "Athens"');
  console.log('• Shipping cost shows "€4.20" for Athens Express');
  console.log('• Delivery time shows "1 day(s)"');
  console.log('• Total amount updates to include shipping cost');
});

playwrightProcess.on('error', (err) => {
  console.error('❌ Failed to start test:', err.message);
  console.log('');
  console.log('🔧 Make sure Playwright is installed:');
  console.log('  npm install @playwright/test');
  console.log('  npx playwright install');
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  playwrightProcess.kill('SIGINT');
  process.exit(1);
});