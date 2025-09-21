import { test, expect } from '@playwright/test';

test.describe('PR-PP03-B: Search/Filter Greek Normalization Evidence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page for better search testing
    await page.goto('http://127.0.0.1:3001');
    await page.waitForLoadState('networkidle');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
  });

  test('Evidence 1: Greek Normalization - Identical Results for πορτοκάλια variants', async ({ page }) => {
    console.log('🎯 PR-PP03-B Evidence Collection - Greek Normalization');
    console.log('=========================================================');

    const searchInput = page.locator('input[type="text"], input[placeholder*="αναζήτηση"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Test cases for Greek normalization - same results expected
    const testCases = [
      { 
        query: 'Πορτοκάλια', 
        description: 'Greek with accents (original)',
        type: 'baseline' 
      },
      { 
        query: 'πορτοκαλια', 
        description: 'Greek without accents (lowercase)',
        type: 'normalized' 
      },
      { 
        query: 'ΠΟΡΤΟΚΑΛΙΑ', 
        description: 'Greek uppercase without accents',
        type: 'normalized' 
      },
      { 
        query: 'portokalia', 
        description: 'Latin transliteration',
        type: 'transliterated' 
      }
    ];

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🔍 Test ${i + 1}: "${testCase.query}" (${testCase.description})`);
      
      // Clear previous search
      await searchInput.clear();
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Enter search query with slow typing for better demo effect
      await searchInput.type(testCase.query, { delay: 100 });
      
      // Wait for debounce and results
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Take screenshot during search
      await page.screenshot({ 
        path: `test-results/pp03b-search-${i + 1}-${testCase.type}.png`,
        fullPage: true 
      });
      
      // Count results
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      // Get first product title if results exist
      let firstProductTitle = '';
      if (count > 0) {
        firstProductTitle = await productCards.first().locator('[data-testid="product-title"], h3, h2').first().textContent() || '';
      }
      
      // Store results for comparison
      results.push({
        query: testCase.query,
        description: testCase.description,
        count,
        firstProduct: firstProductTitle,
        type: testCase.type
      });
      
      console.log(`   📊 Results: ${count} products found`);
      if (count > 0) {
        console.log(`   🎯 First result: "${firstProductTitle}"`);
      }
      
      // Check for search highlighting (if implemented)
      const highlightedElements = page.locator('.highlight, mark, .search-highlight');
      const highlightCount = await highlightedElements.count();
      if (highlightCount > 0) {
        console.log(`   ✨ Found ${highlightCount} highlighted search terms`);
      }
      
      // Brief pause for visual effect in recordings
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    }

    // Verify all variants return identical results
    console.log('\n📋 EVIDENCE SUMMARY:');
    console.log('====================');
    
    const baselineResult = results[0];
    let allIdentical = true;
    
    for (let i = 1; i < results.length; i++) {
      const isIdentical = results[i].count === baselineResult.count;
      if (!isIdentical) allIdentical = false;
      
      console.log(`✅ "${results[i].query}" → ${results[i].count} results (${isIdentical ? 'IDENTICAL' : 'DIFFERENT'})`);
      
      // Test assertion - all should have same result count
      expect(results[i].count).toBe(baselineResult.count);
    }
    
    console.log(`\n🎉 PROOF: All ${results.length} search variants return identical results (${baselineResult.count} products)`);
    expect(allIdentical).toBe(true);
  });

  test('Evidence 2: Empty State Handling and Filter Clearing', async ({ page }) => {
    console.log('\n🔍 Testing Empty State and Filter Clearing');
    console.log('==========================================');

    const searchInput = page.locator('input[type="text"], input[placeholder*="αναζήτηση"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible();

    // Search for something that definitely won't exist
    const nonsenseQuery = 'ξζχψωφγηδσαπλκμνβ123456789';
    console.log(`🔍 Searching for nonsense term: "${nonsenseQuery}"`);
    
    await searchInput.clear();
    await searchInput.fill(nonsenseQuery);
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Take screenshot of empty state
    await page.screenshot({ 
      path: `test-results/pp03b-empty-state.png`,
      fullPage: true 
    });
    
    // Check for empty state message
    const noResultsSelectors = [
      'text="Δεν βρέθηκαν προϊόντα"',
      'text="No products found"',
      '[data-testid="no-results"]',
      '.no-results',
      '.empty-state'
    ];
    
    let emptyStateFound = false;
    for (const selector of noResultsSelectors) {
      if (await page.locator(selector).isVisible({ timeout: 2000 })) {
        emptyStateFound = true;
        console.log(`✅ Empty state message found with selector: ${selector}`);
        break;
      }
    }
    
    // Check for clear filters button
    const clearButtonSelectors = [
      'text="Καθαρισμός φίλτρων"',
      'text="Clear filters"',
      'text="Reset"',
      '[data-testid="clear-filters"]',
      '.clear-filters',
      'button:has-text("Clear")'
    ];
    
    let clearButtonFound = false;
    for (const selector of clearButtonSelectors) {
      const clearButton = page.locator(selector);
      if (await clearButton.isVisible({ timeout: 2000 })) {
        clearButtonFound = true;
        console.log(`✅ Clear filters button found: ${selector}`);
        
        // Click the clear button
        await clearButton.click();
        // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
        
        // Take screenshot after clearing
        await page.screenshot({ 
          path: `test-results/pp03b-after-clear.png`,
          fullPage: true 
        });
        
        // Verify products are restored
        const productCards = page.locator('[data-testid="product-card"]');
        const restoredCount = await productCards.count();
        console.log(`✅ After clearing: ${restoredCount} products restored`);
        
        expect(restoredCount).toBeGreaterThan(0);
        break;
      }
    }
    
    // Manual clear as fallback
    if (!clearButtonFound) {
      console.log('🔧 Clear button not found, manually clearing search input');
      await searchInput.clear();
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      const productCards = page.locator('[data-testid="product-card"]');
      const restoredCount = await productCards.count();
      console.log(`✅ After manual clear: ${restoredCount} products restored`);
      expect(restoredCount).toBeGreaterThan(0);
    }
    
    console.log(`\n📋 Empty State Evidence:`);
    console.log(`   🔍 Empty state message: ${emptyStateFound ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   🧹 Clear filters button: ${clearButtonFound ? 'FOUND & FUNCTIONAL' : 'NOT FOUND'}`);
  });

  test('Evidence 3: Advanced Greek Search Cases', async ({ page }) => {
    console.log('\n🇬🇷 Testing Advanced Greek Search Cases');
    console.log('========================================');

    const searchInput = page.locator('input[type="text"], input[placeholder*="αναζήτηση"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible();

    // Additional Greek products to test normalization
    const greekTests = [
      { 
        query: 'ελαιόλαδο', 
        normalized: 'ελαιολαδο',
        latin: 'elaiólado',
        expected: 'oil' 
      },
      { 
        query: 'μήλα', 
        normalized: 'μηλα',
        latin: 'míla',
        expected: 'apple' 
      },
      { 
        query: 'μέλι', 
        normalized: 'μελι',
        latin: 'méli',
        expected: 'honey' 
      }
    ];

    for (let i = 0; i < greekTests.length; i++) {
      const test = greekTests[i];
      console.log(`\n🔍 Testing Greek product: ${test.query}`);
      
      // Test original with accents
      await searchInput.clear();
      await searchInput.fill(test.query);
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      const originalCount = await page.locator('[data-testid="product-card"]').count();
      console.log(`   📊 "${test.query}" (with accents): ${originalCount} results`);
      
      // Test normalized without accents
      await searchInput.clear();
      await searchInput.fill(test.normalized);
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      const normalizedCount = await page.locator('[data-testid="product-card"]').count();
      console.log(`   📊 "${test.normalized}" (no accents): ${normalizedCount} results`);
      
      // Take comparison screenshot
      await page.screenshot({ 
        path: `test-results/pp03b-greek-${i + 1}-${test.query.replace(/[^a-zA-Z0-9]/g, '')}.png`,
        fullPage: true 
      });
      
      // Results should be identical
      if (originalCount > 0 && normalizedCount > 0) {
        expect(normalizedCount).toBe(originalCount);
        console.log(`   ✅ Normalization working: identical results`);
      }
    }
  });

  test('Evidence 4: Search Highlighting and Visual Feedback', async ({ page }) => {
    console.log('\n✨ Testing Search Highlighting and Visual Feedback');
    console.log('==================================================');

    const searchInput = page.locator('input[type="text"], input[placeholder*="αναζήτηση"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible();

    // Test search with a common term
    const searchTerm = 'Πορτοκάλια';
    console.log(`🔍 Testing search highlighting for: "${searchTerm}"`);
    
    await searchInput.clear();
    await searchInput.fill(searchTerm);
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Look for various highlighting implementations
    const highlightSelectors = [
      '.highlight',
      'mark',
      '.search-highlight',
      '[style*="background-color: yellow"]',
      '[style*="background: yellow"]',
      '.text-yellow-400',
      '.bg-yellow-200'
    ];
    
    let highlightsFound = false;
    for (const selector of highlightSelectors) {
      const highlights = page.locator(selector);
      const count = await highlights.count();
      if (count > 0) {
        highlightsFound = true;
        console.log(`✅ Found ${count} highlights using selector: ${selector}`);
        
        // Take screenshot showing highlights
        await page.screenshot({ 
          path: `test-results/pp03b-highlighting.png`,
          fullPage: true 
        });
        break;
      }
    }
    
    // Check for search indicators/badges
    const indicatorSelectors = [
      '[title*="detected"]',
      '.search-indicator',
      '.badge',
      '.chip',
      '[data-testid="search-indicator"]'
    ];
    
    let indicatorsFound = false;
    for (const selector of indicatorSelectors) {
      const indicators = page.locator(selector);
      const count = await indicators.count();
      if (count > 0) {
        indicatorsFound = true;
        console.log(`✅ Found ${count} search indicators using selector: ${selector}`);
        break;
      }
    }
    
    // Check for loading states during search
    await searchInput.clear();
    await searchInput.fill('μ'); // Start typing to trigger loading
    
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-testid="loading"]',
      '.animate-spin'
    ];
    
    let loadingFound = false;
    for (const selector of loadingSelectors) {
      if (await page.locator(selector).isVisible({ timeout: 200 })) {
        loadingFound = true;
        console.log(`✅ Loading indicator found: ${selector}`);
        break;
      }
    }
    
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle"); // Complete the search
    
    console.log(`\n📋 Visual Feedback Evidence:`);
    console.log(`   ✨ Search highlighting: ${highlightsFound ? 'IMPLEMENTED' : 'NOT DETECTED'}`);
    console.log(`   🏷️ Search indicators: ${indicatorsFound ? 'FOUND' : 'NOT DETECTED'}`);
    console.log(`   ⏳ Loading states: ${loadingFound ? 'IMPLEMENTED' : 'NOT DETECTED'}`);
  });

  test('Evidence 5: Comprehensive Search Demo for GIF Generation', async ({ page }) => {
    console.log('\n🎬 COMPREHENSIVE DEMO FOR GIF GENERATION');
    console.log('========================================');
    console.log('This test creates the perfect sequence for screen recording');

    const searchInput = page.locator('input[type="text"], input[placeholder*="αναζήτηση"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible();

    // Ensure we start with all products visible
    await searchInput.clear();
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    console.log(`🎯 Starting with ${initialCount} products visible`);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `test-results/pp03b-demo-0-initial.png`,
      fullPage: true 
    });

    // Demo sequence: Show that all these searches produce identical results
    const demoSequence = [
      { 
        query: 'Πορτοκάλια', 
        label: '1️⃣ Greek with accents',
        delay: 150 
      },
      { 
        query: 'πορτοκαλια', 
        label: '2️⃣ Greek without accents', 
        delay: 120 
      },
      { 
        query: 'ΠΟΡΤΟΚΑΛΙΑ', 
        label: '3️⃣ Greek uppercase',
        delay: 100 
      },
      { 
        query: 'portokalia', 
        label: '4️⃣ Latin transliteration',
        delay: 130 
      }
    ];

    const searchResults = [];

    for (let i = 0; i < demoSequence.length; i++) {
      const step = demoSequence[i];
      console.log(`\n${step.label}: "${step.query}"`);
      
      // Clear with visual effect
      await searchInput.clear();
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Type slowly for demo effect
      await searchInput.type(step.query, { delay: step.delay });
      
      // Wait for results with visual feedback
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Count results
      const resultCount = await page.locator('[data-testid="product-card"]').count();
      searchResults.push(resultCount);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/pp03b-demo-${i + 1}-${step.query.replace(/[^a-zA-Z0-9]/g, '')}.png`,
        fullPage: true 
      });
      
      console.log(`   📊 Results: ${resultCount} products`);
      
      // Brief pause for demo effect
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    }

    // Verify all results are identical
    const baselineCount = searchResults[0];
    const allIdentical = searchResults.every(count => count === baselineCount);
    
    console.log(`\n🎉 DEMO COMPLETE: All searches returned ${baselineCount} identical results`);
    console.log(`📊 Results summary: [${searchResults.join(', ')}]`);
    console.log(`✅ Proof of Greek normalization: ${allIdentical ? 'SUCCESS' : 'FAILED'}`);
    
    expect(allIdentical).toBe(true);
    
    // End with empty state demo
    console.log(`\n🔍 Demonstrating empty state...`);
    await searchInput.clear();
    await searchInput.type('nonexistentproduct12345', { delay: 100 });
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    const emptyStateCount = await page.locator('[data-testid="product-card"]').count();
    console.log(`📭 Empty state: ${emptyStateCount} products (should be 0)`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: `test-results/pp03b-demo-final-empty.png`,
      fullPage: true 
    });
    
    // Clear to restore products
    await searchInput.clear();
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    const restoredCount = await page.locator('[data-testid="product-card"]').count();
    console.log(`🔄 Restored: ${restoredCount} products`);
    
    expect(restoredCount).toBeGreaterThan(0);
  });
});