import { test, expect } from '@playwright/test';

test('happy path - catalog to checkout flow', async ({ page }) => {
  // 1. Open home, see catalog list item
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait for product cards to appear (more reliable than waiting for API)
  const card = page.locator('[data-testid="product-card"]').first();
  await expect(card).toBeVisible({ timeout: 15000 });
  
  const productName = await card.locator('[data-testid="product-title"]').textContent();
  const firstProductLink = card.locator('a').first();
  
  // 2. View first product page
  await Promise.all([
    page.waitForURL(/\/products\/\d+/, { timeout: 10000 }),
    firstProductLink.click()
  ]);
  
  // Verify we're on product details page
  await expect(page).toHaveURL(/\/products\/\d+/);
  await expect(page.locator('h1')).toContainText(productName || '');
  
  // 3. Login via frontend login flow - use safer navigation 
  await page.waitForLoadState('networkidle');
  await Promise.all([
    page.waitForURL('**/auth/login', { timeout: 10000 }),
    page.goto('/auth/login', { waitUntil: 'load' }),
  ]);
  
  // Fill login form
  await page.fill('[name="email"]', 'consumer@example.com');
  await page.fill('[name="password"]', 'password');
  
  // Submit login form
  await Promise.all([
    page.waitForURL('/', { timeout: 10000 }),
    page.click('button[type="submit"]')
  ]);
  
  // Should be redirected to home page after successful login
  await expect(page).toHaveURL('/');
  
  // Verify login worked - should see user menu (primary auth indicator)
  await expect(page.locator('[data-testid="user-menu"]').first()).toBeVisible();
  
  // Navigate back to the product page to add to cart
  await Promise.all([
    page.waitForURL(/\/products\/\d+/, { timeout: 10000 }),
    firstProductLink.click()
  ]);
  await expect(page).toHaveURL(/\/products\/\d+/);
  await page.waitForLoadState('networkidle');
  
  // 4. Add product to cart
  const addToCartBtn = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")');
  await expect(addToCartBtn).toBeVisible();
  
  // Wait for successful add to cart (look for success message)
  const addToCartPromise = page.waitForSelector('[data-testid="cart-success"]', { timeout: 10000 });
  await addToCartBtn.click();
  
  try {
    await addToCartPromise;
    console.log('✅ Add to cart success message appeared');
  } catch (error) {
    console.log('⚠️ No success message, but continuing with test...');
  }
  
  // Wait a moment for the API call to fully complete
  await page.waitForTimeout(1000);
  
  // Navigate to cart
  await Promise.all([
    page.waitForURL(/\/cart/, { timeout: 10000 }),
    page.goto('/cart')
  ]);
  
  // Check if we're still on cart page (not redirected to login)
  const currentUrl = page.url();
  console.log('🔗 Current URL after cart navigation:', currentUrl);
  
  if (currentUrl.includes('/auth/login')) {
    console.log('❌ Still redirected to login - authentication not working');
    throw new Error('Cart page redirected to login - authentication failed');
  }
  
  console.log('✅ Authentication worked - staying on cart page');
  
  // Wait for cart to load - should see either cart items or loading state first
  await page.waitForSelector('[data-testid="cart-item"], [data-testid="loading-spinner"], .text-center:has-text("empty")', { timeout: 10000 });
  
  // Verify product is in cart
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=' + productName)).toBeVisible({ timeout: 5000 });
  
  // 5. Proceed to checkout (direct checkout - no form)
  const checkoutBtn = page.locator('[data-testid="checkout-btn"], button:has-text("Checkout"), button:has-text("Proceed")');
  await expect(checkoutBtn).toBeVisible();
  await checkoutBtn.click();
  
  // Wait for checkout to complete - may show success message or stay on cart
  await page.waitForTimeout(2000);
});

test('catalog page loads and displays products', async ({ page }) => {
  await page.goto('/');
  
  // Wait for page to load
  await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
  
  // Check that products are displayed
  const productCards = page.locator('[data-testid="product-card"]');
  await expect(productCards).not.toHaveCount(0);
  
  // Verify each product card has required elements
  const firstProduct = page.locator('[data-testid="product-card"]').first();
  await expect(firstProduct.locator('img, [data-testid="product-image"]')).toBeVisible();
  await expect(firstProduct.locator('h3, [data-testid="product-title"]')).toBeVisible();
  await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
});

test('product detail page displays correctly', async ({ page }) => {
  // Go to catalog first
  await page.goto('/');
  
  // Click on first product
  await Promise.all([
    page.waitForURL(/\/products\/\d+/, { timeout: 10000 }),
    page.locator('[data-testid="product-card"] a').first().click()
  ]);
  
  // Verify product details are shown
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.text-xl.text-green-600:has-text("€")').first()).toBeVisible();
  await expect(page.locator('button:has-text("Add to Cart")').first()).toBeVisible();
});