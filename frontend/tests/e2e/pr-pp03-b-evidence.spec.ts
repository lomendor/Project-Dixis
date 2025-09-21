import { test, expect } from '@playwright/test';

test.describe('PR-PP03-B Evidence Collection - Greek Normalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('Evidence 1: Greek Search Normalization - Identical Results', async ({ page }) => {
    console.log('🎯 PR-PP03-B EVIDENCE COLLECTION');
    console.log('=================================');
    
    const searchInput = page.locator('input[type="text"]').first();
    
    // Test scenarios that should produce identical results
    const scenarios = [
      { query: 'Πορτοκάλια', description: 'Greek with accents (baseline)' },
      { query: 'πορτοκαλια', description: 'Greek without accents (lowercase)' },
      { query: 'ΠΟΡΤΟΚΑΛΙΑ', description: 'Greek uppercase without accents' },
      { query: 'portokalia', description: 'Latin transliteration' }
    ];

    const results = [];
    
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n🔍 Test ${i + 1}: "${scenario.query}" (${scenario.description})`);
      
      // Clear and search
      await searchInput.clear();
      await searchInput.fill(scenario.query);
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle"); // Wait for debounce
      
      // Take screenshot for evidence
      await page.screenshot({ 
        path: `test-results/pp03b-evidence-${i + 1}.png`,
        fullPage: true 
      });
      
      // Count results
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      results.push(count);
      
      if (count > 0) {
        const firstTitle = await productCards.first().locator('[data-testid="product-title"]').textContent();
        console.log(`   ✅ Found: "${firstTitle}" (${count} results)`);
      } else {
        console.log(`   ❌ No results found`);
      }
      
      // Brief pause for demo effect
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    }
    
    // Verify all results are identical
    const baselineCount = results[0];
    const allIdentical = results.every(count => count === baselineCount);
    
    console.log(`\n📊 RESULTS SUMMARY:`);
    console.log(`   Baseline (Πορτοκάλια): ${results[0]} products`);
    console.log(`   No accents (πορτοκαλια): ${results[1]} products`);
    console.log(`   Uppercase (ΠΟΡΤΟΚΑΛΙΑ): ${results[2]} products`);
    console.log(`   Latin (portokalia): ${results[3]} products`);
    console.log(`\n🎉 EVIDENCE: All variants return ${allIdentical ? 'IDENTICAL' : 'DIFFERENT'} results`);
    
    expect(allIdentical).toBe(true);
    expect(baselineCount).toBeGreaterThan(0);
  });

  test('Evidence 2: Empty State and Filter Clearing', async ({ page }) => {
    console.log('\n🔍 Testing Empty State and Filter Clearing');
    console.log('==========================================');

    const searchInput = page.locator('input[type="text"]').first();
    
    // Search for something that won't exist
    const nonsenseQuery = 'ξζχψωφγηδσαπλκμνβ987654321';
    console.log(`🔍 Searching for nonsense: "${nonsenseQuery}"`);
    
    await searchInput.clear();
    await searchInput.fill(nonsenseQuery);
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Take screenshot of empty state
    await page.screenshot({ 
      path: `test-results/pp03b-empty-state.png`,
      fullPage: true 
    });
    
    const productCards = page.locator('[data-testid="product-card"]');
    const emptyCount = await productCards.count();
    console.log(`📭 Empty state: ${emptyCount} products found`);
    
    // Clear search and verify products return
    await searchInput.clear();
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    await page.screenshot({ 
      path: `test-results/pp03b-after-clear.png`,
      fullPage: true 
    });
    
    const restoredCount = await productCards.count();
    console.log(`🔄 After clearing: ${restoredCount} products restored`);
    
    expect(emptyCount).toBe(0);
    expect(restoredCount).toBeGreaterThan(0);
    
    console.log('✅ Empty state and clearing functionality verified');
  });

  test('Evidence 3: GIF Generation Sequence', async ({ page }) => {
    console.log('\n🎬 GIF GENERATION SEQUENCE');
    console.log('==========================');
    console.log('This test creates perfect sequence for screen recording');

    const searchInput = page.locator('input[type="text"]').first();
    
    // Ensure clean start
    await searchInput.clear();
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Initial state
    await page.screenshot({ 
      path: `test-results/pp03b-gif-0-initial.png`,
      fullPage: true 
    });
    console.log('📸 Initial state captured');
    
    const gifSequence = [
      { query: 'Πορτοκάλια', label: 'Greek with accents', delay: 150 },
      { query: 'πορτοκαλια', label: 'Greek no accents', delay: 120 },  
      { query: 'ΠΟΡΤΟΚΑΛΙΑ', label: 'Greek uppercase', delay: 100 },
      { query: 'portokalia', label: 'Latin transliteration', delay: 130 }
    ];
    
    const gifResults = [];
    
    for (let i = 0; i < gifSequence.length; i++) {
      const step = gifSequence[i];
      console.log(`\n🎬 Frame ${i + 1}: "${step.query}" (${step.label})`);
      
      // Clear with visual pause
      await searchInput.clear();
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Type slowly for demo effect
      await searchInput.type(step.query, { delay: step.delay });
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle"); // Wait for results
      
      // Count results
      const count = await page.locator('[data-testid="product-card"]').count();
      gifResults.push(count);
      
      // Capture frame
      await page.screenshot({ 
        path: `test-results/pp03b-gif-${i + 1}-${step.query.replace(/[^a-zA-Z0-9]/g, '')}.png`,
        fullPage: true 
      });
      
      console.log(`   📊 Results: ${count} products`);
      
      // Dramatic pause for effect
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    }
    
    // Verify all identical
    const allSame = gifResults.every(count => count === gifResults[0]);
    console.log(`\n🎬 GIF SEQUENCE COMPLETE:`);
    console.log(`   📊 Results: [${gifResults.join(', ')}]`);
    console.log(`   ✅ All identical: ${allSame ? 'YES' : 'NO'}`);
    
    expect(allSame).toBe(true);
    
    // Final demo: empty state
    console.log('\n🎬 Final frame: Empty state demo');
    await searchInput.clear();
    await searchInput.type('nonexistentproduct999', { delay: 100 });
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    await page.screenshot({ 
      path: `test-results/pp03b-gif-final-empty.png`,
      fullPage: true 
    });
    
    console.log('🎬 GIF sequence screenshots complete!');
  });
});