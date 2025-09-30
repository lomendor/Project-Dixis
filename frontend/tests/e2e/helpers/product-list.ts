import { Page, expect } from '@playwright/test';

/**
 * Phase-3c: Product-load stabilizers for reliable E2E testing
 * Replaces flaky API waits with robust element-based detection
 */

export interface ProductCardOptions {
  timeout?: number;
  minCount?: number;
  maxRetries?: number;
}

/**
 * Wait for product cards to appear and be visible
 * Primary stabilizer for product list loading
 */
export async function waitForProductCards(
  page: Page,
  options: ProductCardOptions = {}
): Promise<void> {
  const { timeout = 15000, minCount = 1, maxRetries = 3 } = options;

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      // Wait for at least one product card to be visible
      await page.waitForSelector('[data-testid="product-card"]', {
        timeout,
        state: 'visible'
      });

      // Verify minimum count if specified
      if (minCount > 1) {
        const cards = await page.locator('[data-testid="product-card"]').count();
        if (cards >= minCount) {
          console.log(`✅ Product cards loaded: ${cards} (min: ${minCount})`);
          return;
        }
        throw new Error(`Only ${cards} cards loaded, expected ${minCount}`);
      }

      console.log('✅ Product cards successfully loaded');
      return;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`❌ Failed to load product cards after ${maxRetries} attempts:`, error);
        throw error;
      }
      console.log(`⚠️ Product cards loading attempt ${attempt} failed, retrying...`);
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Wait for product list API to complete and products to render
 * Combines API response detection with element visibility
 */
export async function waitForProductListStable(page: Page): Promise<void> {
  console.log('🔄 Waiting for product list to stabilize...');

  // Wait for network activity to settle
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Wait for product cards to appear
  await waitForProductCards(page, { timeout: 15000, minCount: 1 });

  // Additional stability check: ensure cards are fully interactive
  const firstCard = page.locator('[data-testid="product-card"]').first();
  await expect(firstCard).toBeVisible();

  console.log('✅ Product list stabilized');
}

/**
 * Navigate to products page with stable loading
 * Primary entry point for product-related tests
 */
export async function gotoProductsStable(page: Page, baseURL = '/'): Promise<void> {
  const url = (baseURL?.replace(/\/$/, '') || '') + '/products';
  console.log(`🔄 Navigating to products page: ${url}`);

  await page.goto(url, { waitUntil: 'load' });
  await waitForProductListStable(page);
}

/**
 * Search for products with stable results loading
 */
export async function searchProductsStable(
  page: Page,
  searchTerm: string,
  expectedMinResults = 1
): Promise<void> {
  console.log(`🔍 Searching for: "${searchTerm}"`);

  // Find and use search input
  const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i], input[name="search"]').first();
  await searchInput.fill(searchTerm);
  await searchInput.press('Enter');

  // Wait for search results to load
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await waitForProductCards(page, {
    timeout: 15000,
    minCount: expectedMinResults
  });

  console.log(`✅ Search results loaded for: "${searchTerm}"`);
}

/**
 * Select first available product with stable interaction
 */
export async function selectFirstProductStable(page: Page): Promise<void> {
  console.log('🔄 Selecting first product...');

  await waitForProductCards(page, { timeout: 15000, minCount: 1 });

  const firstCard = page.locator('[data-testid="product-card"]').first();
  await expect(firstCard).toBeVisible();

  // Click the first product card or its link
  const clickTarget = firstCard.locator('a, [role="button"]').first();
  if (await clickTarget.count() > 0) {
    await clickTarget.click();
  } else {
    await firstCard.click();
  }

  // Wait for navigation to product details
  await page.waitForLoadState('load');

  console.log('✅ First product selected and loaded');
}

/**
 * Add product to cart with stable UI interaction
 */
export async function addToCartStable(page: Page): Promise<void> {
  console.log('🛒 Adding product to cart...');

  // Wait for add to cart button to be available
  const addToCartBtn = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart"), button:has-text("Προσθήκη στο Καλάθι")').first();

  await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
  await expect(addToCartBtn).toBeEnabled();

  await addToCartBtn.click();

  // Wait for cart update confirmation
  try {
    await page.waitForSelector('[data-testid="cart-notification"], .toast, [role="alert"]', {
      timeout: 5000,
      state: 'visible'
    });
    console.log('✅ Product added to cart (notification confirmed)');
  } catch {
    console.log('✅ Product added to cart (no notification)');
  }
}

/**
 * Verify product list is not empty
 */
export async function verifyProductsExist(page: Page): Promise<void> {
  await waitForProductCards(page, { timeout: 15000, minCount: 1 });

  const productCount = await page.locator('[data-testid="product-card"]').count();
  expect(productCount).toBeGreaterThan(0);

  console.log(`✅ Verified ${productCount} products exist`);
}

/**
 * Wait for category filtering to complete
 */
export async function filterByCategoryStable(page: Page, categoryName: string): Promise<void> {
  console.log(`🏷️ Filtering by category: ${categoryName}`);

  // Find and click category filter
  const categoryFilter = page.locator(`[data-testid="category-${categoryName}"], text="${categoryName}"`).first();
  await expect(categoryFilter).toBeVisible({ timeout: 10000 });
  await categoryFilter.click();

  // Wait for filtered results
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await waitForProductCards(page, { timeout: 15000, minCount: 1 });

  console.log(`✅ Category filter applied: ${categoryName}`);
}