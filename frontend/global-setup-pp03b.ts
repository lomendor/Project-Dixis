import { chromium, FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 PR-PP03-B Evidence Collection Setup');
  console.log('=====================================');
  
  // Ensure test results directories exist
  const testResultDirs = [
    'test-results-pp03b',
    'test-results', 
    'playwright-report-pp03b'
  ];
  
  for (const dir of testResultDirs) {
    await fs.mkdir(dir, { recursive: true }).catch(() => {});
    console.log(`📁 Created directory: ${dir}`);
  }
  
  // Clear previous evidence artifacts
  const artifactPaths = [
    'test-results/pp03b-*.png',
    'test-results-pp03b/',
    'test-results/pp03b-results.json'
  ];
  
  console.log('🧹 Clearing previous evidence artifacts...');
  
  // Create evidence collection metadata
  const evidenceMetadata = {
    testSuite: 'PR-PP03-B: Search/Filter Greek Normalization',
    timestamp: new Date().toISOString(),
    purpose: 'Generate comprehensive evidence for Greek search normalization',
    features: [
      'Greek text accent normalization (Πορτοκάλια vs πορτοκαλια)',
      'Latin-Greek transliteration (portokalia = πορτοκαλια)', 
      'Empty state handling and filter clearing',
      'Search result highlighting',
      'Real-time search with debouncing'
    ],
    expectedArtifacts: [
      'Videos showing identical search results for Greek variants',
      'Screenshots of each search variant',
      'Empty state demonstration',
      'Filter clearing functionality',
      'Search highlighting evidence',
      'Playwright traces for debugging',
      'HTML test reports'
    ],
    testUrl: 'http://127.0.0.1:3001',
    apiUrl: 'http://127.0.0.1:8001/api/v1'
  };
  
  await fs.writeFile(
    'test-results/pp03b-evidence-metadata.json', 
    JSON.stringify(evidenceMetadata, null, 2)
  );
  
  console.log('📋 Evidence metadata created');
  console.log(`🎯 Target URL: ${evidenceMetadata.testUrl}`);
  console.log(`🔌 API URL: ${evidenceMetadata.apiUrl}`);
  
  // Test connectivity to ensure services are running
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('🔍 Testing connectivity...');
    await page.goto(evidenceMetadata.testUrl, { timeout: 10000 });
    console.log('✅ Frontend accessible');
    
    // Check if products load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const productCount = await page.locator('[data-testid="product-card"]').count();
    console.log(`📦 Found ${productCount} products on homepage`);
    
    await browser.close();
    
    if (productCount === 0) {
      console.warn('⚠️  Warning: No products found - search tests may not be meaningful');
    }
    
  } catch (error) {
    console.error('❌ Connectivity test failed:', error);
    throw new Error('Services not ready for evidence collection');
  }
  
  console.log('✅ Setup complete - ready for evidence collection');
  console.log('🎬 Use these commands to generate evidence:');
  console.log('   npx playwright test --config=playwright.config.pp03b.ts');
  console.log('   npx playwright show-report playwright-report-pp03b');
}

export default globalSetup;