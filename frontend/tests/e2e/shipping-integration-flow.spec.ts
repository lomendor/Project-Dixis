import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test Suite: Shipping Integration Flow
 * Tests the complete shipping cost calculation and cart total updates
 */

class ShippingFlowHelper {
  constructor(private page: Page) {}

  async loginAsConsumer() {
    await this.page.goto('/auth/login');
    await this.page.fill('[name="email"]', 'consumer@example.com');
    await this.page.fill('[name="password"]', 'password'); 
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  async addProductToCart() {
    await this.page.goto('/');
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    const firstProduct = this.page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await this.page.waitForURL(/\/products\/\d+/);
    
    const addToCartBtn = this.page.locator('[data-testid="add-to-cart"]');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    
    // Wait for add to cart to process
    await this.page.waitForTimeout(2000);
  }

  async navigateToCart() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for cart items to load
    const cartItems = this.page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible();
  }

  async fillShippingInfo(postalCode: string, city: string) {
    const postalField = this.page.locator('[data-testid="postal-code-input"]');
    const cityField = this.page.locator('[data-testid="city-input"]');
    
    await expect(postalField).toBeVisible();
    await expect(cityField).toBeVisible();
    
    await postalField.clear();
    await postalField.fill(postalCode);
    
    await cityField.clear(); 
    await cityField.fill(city);
    
    // Wait for debounced API call (500ms + processing time)
    await this.page.waitForTimeout(1000);
  }

  async captureNetworkRequests() {
    const shippingRequests: any[] = [];
    
    this.page.on('request', (request) => {
      if (request.url().includes('/api/v1/shipping/quote')) {
        shippingRequests.push({
          method: request.method(),
          url: request.url(),
          postData: request.postData()
        });
      }
    });
    
    return shippingRequests;
  }

  async getCartTotal(): Promise<string> {
    const totalElement = this.page.locator('[data-testid="cart-total"], .total, :text("Total")').last();
    return await totalElement.textContent() || '';
  }

  async getShippingCost(): Promise<string> {
    const shippingElement = this.page.locator('[data-testid="shipping-cost"], :text("Shipping"), :text("Μεταφορικά")').last();
    return await shippingElement.textContent() || '';
  }
}

test.describe('Shipping Integration Flow', () => {
  
  test('C1: Complete shipping cost calculation and total update', async ({ page }) => {
    const helper = new ShippingFlowHelper(page);
    const networkRequests = await helper.captureNetworkRequests();
    
    console.log('🧪 C1: Testing complete shipping flow...');
    
    // Phase 1: Setup user and cart
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.navigateToCart();
    
    // Capture initial total
    const initialTotal = await helper.getCartTotal();
    console.log('📊 Initial total:', initialTotal);
    
    // Phase 2: Test Athens Metro Zone (11527)
    console.log('🏛️ Testing Athens Metro zone...');
    await helper.fillShippingInfo('11527', 'Athens');
    
    // Wait for shipping API response
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Verify Athens Express appears
    await expect(page.locator(':text("Athens Express")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(':text("1 day")')).toBeVisible();
    
    // Verify total updates
    const athensTotal = await helper.getCartTotal();
    console.log('📊 Athens total:', athensTotal);
    
    // Phase 3: Test Thessaloniki Zone (54623)  
    console.log('🏛️ Testing Thessaloniki zone...');
    await helper.fillShippingInfo('54623', 'Thessaloniki');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    await expect(page.locator(':text("Northern Courier")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(':text("2 day")')).toBeVisible();
    
    const thessalonikiTotal = await helper.getCartTotal();
    console.log('📊 Thessaloniki total:', thessalonikiTotal);
    
    // Phase 4: Test Islands Zone (84600)
    console.log('🏝️ Testing Islands zone...');
    await helper.fillShippingInfo('84600', 'Mykonos');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    await expect(page.locator(':text("Island Logistics")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(':text("4 day")')).toBeVisible();
    
    const islandsTotal = await helper.getCartTotal();
    console.log('📊 Islands total:', islandsTotal);
    
    // Verify different zones have different costs
    expect(athensTotal).not.toBe(thessalonikiTotal);
    expect(thessalonikiTotal).not.toBe(islandsTotal);
    
    console.log('✅ C1: Shipping flow test completed successfully');
  });
  
  test('C1a: Shipping input validation and error handling', async ({ page }) => {
    const helper = new ShippingFlowHelper(page);
    
    console.log('🧪 C1a: Testing shipping validation...');
    
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.navigateToCart();
    
    // Test invalid postal code (too short)
    console.log('❌ Testing invalid postal code...');
    await helper.fillShippingInfo('123', 'Athens');
    
    // Checkout button should be disabled
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(checkoutBtn).toBeDisabled();
    
    // Test valid postal code enables checkout
    console.log('✅ Testing valid postal code...');
    await helper.fillShippingInfo('11527', 'Athens');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    await expect(checkoutBtn).toBeEnabled();
    
    console.log('✅ C1a: Shipping validation test completed');
  });
  
  test('C1b: Real-time shipping cost API integration', async ({ page }) => {
    const helper = new ShippingFlowHelper(page);
    
    console.log('🧪 C1b: Testing real-time API integration...');
    
    // Set up network monitoring
    const apiCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/shipping/quote')) {
        apiCalls.push(request.url());
        console.log('📡 Shipping API call:', request.postData());
      }
    });
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/v1/shipping/quote')) {
        const responseBody = await response.json();
        console.log('📡 Shipping API response:', JSON.stringify(responseBody, null, 2));
      }
    });
    
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.navigateToCart();
    
    // Trigger shipping calculation
    await helper.fillShippingInfo('11527', 'Athens');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Verify API was called
    expect(apiCalls.length).toBeGreaterThan(0);
    console.log(`📡 Made ${apiCalls.length} shipping API calls`);
    
    console.log('✅ C1b: API integration test completed');
  });
});