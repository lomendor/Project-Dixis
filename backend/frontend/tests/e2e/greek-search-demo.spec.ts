import { test, expect } from '@playwright/test';

test.describe('Greek Search Demo for PR #42', () => {
  test('Greek text search with and without accents', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/greek-search/01-homepage.png', fullPage: true });

    // DEMO STEP 1: Search with Greek text WITH accents
    console.log('🎬 DEMO: Searching with accents - "πορτοκάλια"...');
    
    const searchSelectors = [
      '[data-testid="search"]',
      'input[type="search"]',
      'input[name="search"]',
      'input[placeholder*="Search"]',
      'input[placeholder*="Αναζήτηση"]',
      '.search-input'
    ];

    // Try to find and use search input
    for (const selector of searchSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'πορτοκάλια');
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'test-results/greek-search/02-search-with-accents.png', fullPage: true });
    await page.waitForTimeout(1500); // Wait for search results

    // DEMO STEP 2: Search with Greek text WITHOUT accents  
    console.log('🎬 DEMO: Searching without accents - "πορτοκαλια"...');
    
    for (const selector of searchSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'πορτοκαλια'); // No accents
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'test-results/greek-search/03-search-without-accents.png', fullPage: true });
    await page.waitForTimeout(1500);

    // DEMO STEP 3: Search with mixed case
    console.log('🎬 DEMO: Searching with mixed case - "ΠοΡτΟκΑλΙα"...');
    
    for (const selector of searchSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'ΠοΡτΟκΑλΙα');
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'test-results/greek-search/04-search-mixed-case.png', fullPage: true });
    await page.waitForTimeout(1500);

    // DEMO STEP 4: Search with partial match
    console.log('🎬 DEMO: Searching partial match - "πορτ"...');
    
    for (const selector of searchSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'πορτ');
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'test-results/greek-search/05-search-partial.png', fullPage: true });
    await page.waitForTimeout(1500);

    // DEMO STEP 5: Search with English transliteration
    console.log('🎬 DEMO: Searching with transliteration - "portokalia"...');
    
    for (const selector of searchSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'portokalia');
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'test-results/greek-search/06-search-transliteration.png', fullPage: true });
    await page.waitForTimeout(1500);

    // Final state
    await page.screenshot({ path: 'test-results/greek-search/07-final-state.png', fullPage: true });

    console.log('🎉 Greek search demo completed! Screenshots saved to test-results/greek-search/');
  });
});