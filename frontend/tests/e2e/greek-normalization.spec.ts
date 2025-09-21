import { test, expect } from '@playwright/test';

test.describe('Greek Text Normalization Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
  });

  test('should find Greek products using Greek text with accents', async ({ page }) => {
    // Search for "Πορτοκάλια" (with accent)
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    await searchInput.fill('Πορτοκάλια');
    
    // Wait for search to process
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should find "Πορτοκάλια Κρήτης"
    await expect(page.locator('text=Πορτοκάλια Κρήτης')).toBeVisible();
    
    // Verify search indicators show Greek text detected
    await expect(page.locator('text=ΕΛ')).toBeVisible();
  });

  test('should find Greek products using Greek text without accents', async ({ page }) => {
    // Search for "πορτοκαλια" (without accent, lowercase)
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    await searchInput.fill('πορτοκαλια');
    
    // Wait for search to process
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should still find "Πορτοκάλια Κρήτης"
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(1);
    await expect(productCards.first().locator('[data-testid="product-title"]')).toContainText('Πορτοκάλια Κρήτης');
  });

  test('should find Greek products using Latin transliteration', async ({ page }) => {
    // Search for "portokalia" (Latin transliteration)
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    await searchInput.fill('portokalia');
    
    // Wait for search to process
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should find "Πορτοκάλια Κρήτης"
    await expect(page.locator('text=Πορτοκάλια Κρήτης')).toBeVisible();
    
    // Verify search indicators show Latin text detected
    await expect(page.locator('text=EN')).toBeVisible();
  });

  test('should find Greek products using uppercase variants', async ({ page }) => {
    // Search for "ΠΟΡΤΟΚΑΛΙΑ" (uppercase, no accent)
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    await searchInput.fill('ΠΟΡΤΟΚΑΛΙΑ');
    
    // Wait for search to process
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should find "Πορτοκάλια Κρήτης"
    await expect(page.locator('text=Πορτοκάλια Κρήτης')).toBeVisible();
  });

  test('should show search variants for Greek text', async ({ page }) => {
    // Search for "πορτοκάλια"
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    await searchInput.fill('πορτοκάλια');
    
    // Wait for search to process
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should show search variants
    await expect(page.locator('text=Searching for:')).toBeVisible();
    await expect(page.locator('text=+').locator('text=variants')).toBeVisible();
  });

  test('should find olive oil products using various Greek terms', async ({ page }) => {
    const testCases = [
      'ελαιόλαδο',
      'ελαιολαδο', 
      'elaiola',
      'ΕΛΑΙΟΛΑΔΟ'
    ];

    for (const searchTerm of testCases) {
      const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
      await searchInput.clear();
      await searchInput.fill(searchTerm);
      
      // Wait for search to process
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Should find "Ελαιόλαδο Καλαμάτας"
      await expect(page.locator('text=Ελαιόλαδο Καλαμάτας')).toBeVisible();
      
      console.log(`✅ Found olive oil with search term: ${searchTerm}`);
    }
  });

  test('should find tomato products using various Greek terms', async ({ page }) => {
    const testCases = [
      'ντομάτες',
      'ντοματες',
      'domatez',
      'ΝΤΟΜΑΤΕΣ'
    ];

    for (const searchTerm of testCases) {
      const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
      await searchInput.clear();
      await searchInput.fill(searchTerm);
      
      // Wait for search to process
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Should find "Ντομάτες Σαντορίνης"
      await expect(page.locator('text=Ντομάτες Σαντορίνης')).toBeVisible();
      
      console.log(`✅ Found tomatoes with search term: ${searchTerm}`);
    }
  });

  test('should find honey products using various Greek terms', async ({ page }) => {
    const testCases = [
      'μέλι',
      'μελι',
      'meli',
      'ΜΕΛΙ',
      'θυμάρι',
      'thymarisio'
    ];

    for (const searchTerm of testCases) {
      const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
      await searchInput.clear();
      await searchInput.fill(searchTerm);
      
      // Wait for search to process
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Should find "Μέλι Θυμαρίσιο" 
      await expect(page.locator('text=Μέλι Θυμαρίσιο')).toBeVisible();
      
      console.log(`✅ Found honey with search term: ${searchTerm}`);
    }
  });

  test('should display search normalization info correctly', async ({ page }) => {
    // Test Greek text indicator
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    await searchInput.fill('πορτοκάλια');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should show Greek indicator
    await expect(page.locator('span[title="Greek text detected"]')).toBeVisible();
    
    // Test Latin text indicator  
    await searchInput.clear();
    await searchInput.fill('portokalia');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should show Latin indicator
    await expect(page.locator('span[title="Latin text detected (will be transliterated)"]')).toBeVisible();
    
    // Should show variant count
    await expect(page.locator('span[title*="search variants"]')).toBeVisible();
  });

  test('should clear search correctly', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    
    // Enter search term
    await searchInput.fill('πορτοκάλια');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Verify search indicators are visible
    await expect(page.locator('text=ΕΛ')).toBeVisible();
    
    // Clear search
    await searchInput.clear();
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Indicators should be hidden
    await expect(page.locator('text=ΕΛ')).not.toBeVisible();
    await expect(page.locator('text=Searching for:')).not.toBeVisible();
  });

  test('should work with combined search terms', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    
    // Search for "κρήτης πορτοκάλια" (mixed order)
    await searchInput.fill('κρήτης πορτοκάλια');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Should find "Πορτοκάλια Κρήτης"
    await expect(page.locator('text=Πορτοκάλια Κρήτης')).toBeVisible();
  });
});