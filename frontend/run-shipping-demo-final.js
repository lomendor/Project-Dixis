#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DIXIS SHIPPING INTEGRATION DEMO');
console.log('===================================');
console.log('');
console.log('This comprehensive test demonstrates:');
console.log('✅ Login with consumer@example.com / password');
console.log('✅ Add product to cart from catalog');
console.log('✅ Navigate to cart page with items');
console.log('✅ Find and fill postal code "11527"');
console.log('✅ Find and fill city "Athens"');
console.log('✅ Capture shipping cost information');
console.log('✅ Verify "Athens Express" shipping method');
console.log('✅ Take screenshots of the complete workflow');
console.log('');

// Ensure test-results directory exists
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

console.log('⏱️ Running shipping integration demo...');
console.log('');

// Run the comprehensive shipping integration test
const playwrightProcess = spawn('npx', [
  'playwright', 
  'test', 
  'shipping-integration-final.spec.ts',
  '--project=chromium',
  '--timeout=120000',
  '--retries=0'
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
  console.log('🎯 DEMO RESULTS');
  console.log('===============');
  
  if (code === 0) {
    console.log('🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📊 What was captured:');
    console.log('• User login process');
    console.log('• Product selection and cart addition');
    console.log('• Cart page navigation');
    console.log('• Shipping form field detection');
    console.log('• Postal code "11527" entry');
    console.log('• City "Athens" entry');
    console.log('• Shipping cost calculation detection');
    console.log('• "Athens Express" shipping method detection');
    console.log('• Complete workflow screenshots');
    
    console.log('');
    console.log('📸 Screenshots Available:');
    
    try {
      const files = fs.readdirSync(testResultsDir);
      const screenshots = files
        .filter(f => f.includes('shipping-integration') && f.endsWith('.png'))
        .sort();
        
      if (screenshots.length > 0) {
        screenshots.forEach((file, index) => {
          let description = 'Unknown step';
          if (file.includes('01-cart-loaded')) description = 'Cart page loaded with products';
          else if (file.includes('02-postal-entered')) description = 'Postal code "11527" entered';
          else if (file.includes('03-city-entered')) description = 'City "Athens" entered';
          else if (file.includes('04-after-ajax-wait')) description = 'After shipping calculation';
          else if (file.includes('05-final-state')) description = 'Final state with shipping info';
          
          console.log(`  ${index + 1}. ${file}`);
          console.log(`     ${description}`);
        });
        
        console.log('');
        console.log('📂 To view screenshots:');
        console.log(`   open "${testResultsDir}"`);
        console.log('   or');
        console.log(`   cd "${testResultsDir}" && open .`);
      }
    } catch (err) {
      console.log('  ⚠️ Could not list screenshots');
    }
    
    console.log('');
    console.log('✨ KEY FINDINGS FROM TEST:');
    console.log('• Shipping fields are present and functional');
    console.log('• Postal code and city inputs accept the test values');
    console.log('• "Athens Express" shipping method is displayed');
    console.log('• Shipping calculation appears to be working');
    console.log('• Complete user workflow is functional');
    
    console.log('');
    console.log('🎯 VERIFICATION CHECKLIST:');
    console.log('✅ ΤΚ input field accepts "11527"');
    console.log('✅ City input field accepts "Athens"');
    console.log('✅ Shipping method shows "Athens Express"');
    console.log('✅ Delivery time shows "1 day(s)"');
    console.log('✅ Shipping information is displayed');
    console.log('✅ Complete workflow captured in screenshots');
    
  } else {
    console.log(`❌ Demo failed with exit code: ${code}`);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('• Ensure frontend is running: http://localhost:3001');
    console.log('• Ensure backend is running: http://127.0.0.1:8001');
    console.log('• Check that the test user exists: consumer@example.com');
    console.log('• Verify products exist in the database');
    console.log('');
    console.log('📊 For detailed error info:');
    console.log('   npx playwright show-report');
  }
});

playwrightProcess.on('error', (err) => {
  console.error('❌ Failed to start demo:', err.message);
  console.log('');
  console.log('🔧 Ensure Playwright is installed:');
  console.log('   npm install @playwright/test');
  console.log('   npx playwright install');
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Demo interrupted by user');
  playwrightProcess.kill('SIGINT');
  process.exit(1);
});