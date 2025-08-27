import { test, expect } from '@playwright/test';

test('happy path - catalog to checkout flow', async ({ page }) => {
  // 1. Open home, see catalog list item
  await page.goto('http://localhost:3001');
  
  // Wait for catalog to load and verify at least one product is visible
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  
  const firstProductCard = page.locator('[data-testid="product-card"]').first();
  const productName = await firstProductCard.locator('[data-testid="product-name"]').textContent();
  const firstProductLink = firstProductCard.locator('a').first();
  
  // 2. View first product page
  await firstProductLink.click();
  
  // Verify we're on product details page
  await expect(page).toHaveURL(/\/products\/\d+/);
  await expect(page.locator('h1')).toContainText(productName || '');
  
  // 3. Login via API and store token
  const response = await page.request.post('http://127.0.0.1:8001/api/v1/auth/login', {
    data: {
      email: 'consumer@example.com',
      password: 'password'
    }
  });
  
  expect(response.ok()).toBeTruthy();
  const loginData = await response.json();
  const token = loginData.token;
  
  // Set auth token in browser storage
  await page.evaluate((token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify({
      id: 1,
      name: 'Test Consumer',
      email: 'consumer@example.com',
      role: 'consumer'
    }));
  }, token);
  
  // Refresh to apply auth state
  await page.reload();
  
  // Verify login worked - should see user menu (primary auth indicator)
  await expect(page.locator('[data-testid="user-menu"]').first()).toBeVisible();
  
  // 4. Add product to cart
  const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"], button:has-text("Add to Cart")');
  await expect(addToCartBtn).toBeVisible();
  await addToCartBtn.click();
  
  // Wait for success message or cart update
  await expect(page.locator('[data-testid="cart-success"], .alert-success, [data-testid="cart-count"]')).toBeVisible();
  
  // Navigate to cart
  await page.goto('http://localhost:3001/cart');
  
  // Verify product is in cart
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  await expect(page.locator('text=' + productName)).toBeVisible();
  
  // 5. Proceed to checkout
  const checkoutBtn = page.locator('[data-testid="checkout-btn"], button:has-text("Checkout"), button:has-text("Proceed")');
  await expect(checkoutBtn).toBeVisible();
  await checkoutBtn.click();
  
  // Fill checkout form
  await page.fill('[name="shipping_address"], [data-testid="shipping-address"]', '123 Test Street, Athens, Greece');
  
  // Submit checkout
  const submitBtn = page.locator('[data-testid="place-order-btn"], button[type="submit"], button:has-text("Place Order")');
  await submitBtn.click();
  
  // Expect success message or redirect to orders page
  await expect(page.locator('[data-testid="order-success"], .alert-success, text=success').or(page.locator('[data-testid="orders-page"]'))).toBeVisible({ timeout: 10000 });
  
  // Verify we're either on success page or orders page
  await expect(page).toHaveURL(/\/(checkout\/success|orders)/);
});

test('catalog page loads and displays products', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  // Wait for page to load
  await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
  
  // Check that products are displayed
  const productCards = page.locator('[data-testid="product-card"]');
  await expect(productCards).not.toHaveCount(0);
  
  // Verify each product card has required elements
  const firstProduct = page.locator('[data-testid="product-card"]').first();
  await expect(firstProduct.locator('img, [data-testid="product-image"]')).toBeVisible();
  await expect(firstProduct.locator('h3, [data-testid="product-name"]')).toBeVisible();
  await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
});

test('product detail page displays correctly', async ({ page }) => {
  // Go to catalog first
  await page.goto('http://localhost:3001');
  
  // Click on first product
  await page.locator('[data-testid="product-card"] a').first().click();
  
  // Verify product details are shown
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.text-xl.text-green-600:has-text("€")').first()).toBeVisible();
  await expect(page.locator('button:has-text("Add to Cart")').first()).toBeVisible();
});