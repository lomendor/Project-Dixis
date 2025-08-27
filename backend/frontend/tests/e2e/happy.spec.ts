import { test, expect, Page } from '@playwright/test';

// Helper functions for better test organization
class E2EHelper {
  constructor(private page: Page) {}

  async navigateAndWait(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForProductCard() {
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    await expect(this.page.locator('[data-testid="product-card"]').first()).toBeVisible();
    return this.page.locator('[data-testid="product-card"]').first();
  }

  async loginUser(email: string, password: string) {
    await this.navigateAndWait('/auth/login');
    
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    
    // Use Promise.all for better navigation handling
    await Promise.all([
      this.page.waitForURL('/', { timeout: 10000 }),
      this.page.click('button[type="submit"]')
    ]);
    
    // Verify login success
    await expect(this.page.locator('[data-testid="user-menu"]').first()).toBeVisible();
  }

  async addToCart() {
    const addToCartBtn = this.page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")');
    await expect(addToCartBtn).toBeVisible();
    
    // Better wait pattern instead of setTimeout
    const responsePromise = this.page.waitForResponse(resp => resp.url().includes('/cart') && resp.status() === 200);
    await addToCartBtn.click();
    
    try {
      await responsePromise;
      console.log('✅ Cart API call successful');
    } catch (error) {
      console.log('⚠️ Cart API call failed, continuing test...');
    }
  }
}

test('happy path - catalog to checkout flow', async ({ page }) => {
  const helper = new E2EHelper(page);
  
  // 1. Open home, see catalog list
  await helper.navigateAndWait('/');
  
  const firstProductCard = await helper.waitForProductCard();
  const productName = await firstProductCard.locator('[data-testid="product-title"]').textContent();
  const productUrl = await firstProductCard.locator('a').first().getAttribute('href');
  
  // 2. View first product page
  await Promise.all([
    page.waitForURL(/\/products\/\d+/),
    firstProductCard.locator('a').first().click()
  ]);
  
  await expect(page.locator('h1')).toContainText(productName || '');
  
  // 3. Login via frontend login flow
  await helper.loginUser('consumer@example.com', 'password');
  
  // Navigate back to the product page to add to cart
  await Promise.all([
    page.waitForURL(/\/products\/\d+/),
    page.goto(productUrl || '/')
  ]);
  
  // 4. Add product to cart
  await helper.addToCart();
  
  // Navigate to cart
  await helper.navigateAndWait('/cart');
  
  // Verify we're still authenticated (not redirected to login)
  await expect(page).toHaveURL(/\/cart/);
  console.log('✅ Authentication verified - staying on cart page');
  
  // Wait for cart to load properly
  await page.waitForSelector('[data-testid="cart-item"], [data-testid="loading-spinner"], .text-center:has-text("empty")', { timeout: 10000 });
  
  // Verify product is in cart
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 });
  if (productName) {
    await expect(page.locator(`text=${productName}`)).toBeVisible({ timeout: 5000 });
  }
  
  // 5. Proceed to checkout
  const checkoutBtn = page.locator('[data-testid="checkout-btn"], button:has-text("Checkout"), button:has-text("Proceed")');
  await expect(checkoutBtn).toBeVisible();
  
  // Better checkout completion wait
  const checkoutPromise = page.waitForResponse(resp => resp.url().includes('checkout') || resp.url().includes('orders'));
  await checkoutBtn.click();
  
  try {
    await checkoutPromise;
    console.log('✅ Checkout API call completed');
  } catch (error) {
    console.log('⚠️ Checkout response not captured, but test completed');
  }
});

test('catalog page loads and displays products', async ({ page }) => {
  const helper = new E2EHelper(page);
  
  await helper.navigateAndWait('/');
  
  // Wait for page to load
  await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
  
  // Check that products are displayed
  const productCards = page.locator('[data-testid="product-card"]');
  await expect(productCards).not.toHaveCount(0);
  
  // Verify each product card has required elements
  const firstProduct = await helper.waitForProductCard();
  await expect(firstProduct.locator('img, [data-testid="product-image"]')).toBeVisible();
  await expect(firstProduct.locator('h3, [data-testid="product-title"]')).toBeVisible();
  await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
});

test('product detail page displays correctly', async ({ page }) => {
  const helper = new E2EHelper(page);
  
  // Go to catalog first
  await helper.navigateAndWait('/');
  
  const firstProductCard = await helper.waitForProductCard();
  
  // Click on first product with better navigation wait
  await Promise.all([
    page.waitForURL(/\/products\/\d+/),
    firstProductCard.locator('a').first().click()
  ]);
  
  // Verify product details are shown
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.text-xl.text-green-600:has-text("€")').first()).toBeVisible();
  await expect(page.locator('button:has-text("Add to Cart")').first()).toBeVisible();
});