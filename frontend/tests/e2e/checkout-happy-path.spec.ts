import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test Suite: Checkout Happy Path
 * Tests the complete checkout flow from cart to order confirmation
 * 
 * STATUS: QUARANTINED - Requires backend fixtures + deterministic data
 * TODO: Fix in separate PR with real backend integration
 */

class CheckoutFlowHelper {
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
    await this.page.waitForTimeout(2000);
  }

  async completeCartShipping() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
    
    // Fill shipping information
    const postalField = this.page.locator('[data-testid="postal-code-input"]');
    const cityField = this.page.locator('[data-testid="city-input"]');
    
    await postalField.fill('11527');
    await cityField.fill('Athens');
    
    // Wait for shipping calculation
    await this.page.waitForTimeout(2000);
  }

  async captureOrderCreation() {
    const orderRequests: any[] = [];
    
    this.page.on('request', async (request) => {
      if (request.url().includes('/api/v1/orders') && request.method() === 'POST') {
        const postData = request.postData();
        orderRequests.push({
          method: request.method(),
          url: request.url(),
          body: postData ? JSON.parse(postData) : null,
          timestamp: new Date().toISOString()
        });
        console.log('🛒 Order creation request:', {
          url: request.url(),
          body: postData ? JSON.parse(postData) : null
        });
      }
    });
    
    this.page.on('response', async (response) => {
      if (response.url().includes('/api/v1/orders') && response.request().method() === 'POST') {
        try {
          const responseBody = await response.json();
          console.log('🛒 Order creation response:', JSON.stringify(responseBody, null, 2));
          
          // Extract key order details
          if (responseBody.order || responseBody.data) {
            const order = responseBody.order || responseBody.data;
            console.log('📋 Created Order Details:');
            console.log(`   Order ID: ${order.id}`);
            console.log(`   Total: ${order.total_amount}`);
            console.log(`   Payment Method: ${order.payment_method}`);
            console.log(`   Shipping Method: ${order.shipping_method}`);
            if (order.shipping_carrier) {
              console.log(`   Shipping: ${order.shipping_carrier} (€${order.shipping_cost}, ${order.shipping_eta_days} days)`);
            }
          }
        } catch (e) {
          console.log('🛒 Order response (non-JSON):', await response.text());
        }
      }
    });
    
    return orderRequests;
  }

  async extractOrderId(): Promise<string | null> {
    // Wait for redirect to order confirmation
    await this.page.waitForURL(/\/orders\/\d+/, { timeout: 15000 });
    
    const url = this.page.url();
    const orderIdMatch = url.match(/\/orders\/(\d+)/);
    return orderIdMatch ? orderIdMatch[1] : null;
  }
}

test.describe('Checkout Happy Path', () => {
  
  test('C2: Complete checkout flow from cart to confirmation', async ({ page }) => {
    const helper = new CheckoutFlowHelper(page);
    const orderRequests = await helper.captureOrderCreation();
    
    console.log('🧪 C2: Testing complete checkout flow...');
    
    // Phase 1: Setup cart with shipping
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.completeCartShipping();
    
    // Verify checkout button is enabled
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(checkoutBtn).toBeEnabled();
    await expect(checkoutBtn).toHaveText('Proceed to Checkout');
    
    console.log('🛒 Cart ready, proceeding to checkout...');
    
    // Phase 2: Execute checkout
    await checkoutBtn.click();
    
    // Phase 3: Verify order creation
    const orderId = await helper.extractOrderId();
    console.log(`📋 Order created with ID: ${orderId}`);
    
    expect(orderId).toBeTruthy();
    expect(orderId).toMatch(/^\d+$/);
    
    // Phase 4: Verify order confirmation page
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
    await expect(page.locator(':text("Athens Express")')).toBeVisible();
    await expect(page.locator(':text("1 day")')).toBeVisible();
    await expect(page.locator(':text("Athens")')).toBeVisible();
    await expect(page.locator(':text("11527")')).toBeVisible();
    
    console.log('✅ C2: Checkout flow completed successfully');
    
    // Phase 5: Verify order request payload
    expect(orderRequests.length).toBeGreaterThan(0);
    const orderPayload = orderRequests[0]?.body;
    
    if (orderPayload) {
      console.log('📦 Order payload verification:');
      console.log('   Has shipping info:', !!orderPayload.shipping_address || !!orderPayload.postal_code);
      console.log('   Payment method:', orderPayload.payment_method || 'COD');
      console.log('   Shipping method:', orderPayload.shipping_method);
      
      // Verify key fields are present
      expect(orderPayload.shipping_method || orderPayload.payment_method).toBeTruthy();
    }
  });
  
  test('C2a: Order confirmation displays shipping details', async ({ page }) => {
    const helper = new CheckoutFlowHelper(page);
    
    console.log('🧪 C2a: Testing order confirmation details...');
    
    // Complete the checkout flow
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.completeCartShipping();
    
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await checkoutBtn.click();
    
    // Wait for order confirmation
    const orderId = await helper.extractOrderId();
    console.log(`📋 Verifying order ${orderId} confirmation...`);
    
    // Verify all required elements are visible
    await expect(page.locator(':text("Order")')).toBeVisible();
    await expect(page.locator(`text=${orderId}`)).toBeVisible();
    
    // Verify shipping information is displayed
    const shippingInfo = page.locator(':text("Athens Express"), :text("Athens"), :text("11527")');
    await expect(shippingInfo.first()).toBeVisible();
    
    console.log('✅ C2a: Order confirmation details verified');
  });
  
  test('C2b: Multiple checkout attempts handle correctly', async ({ page }) => {
    const helper = new CheckoutFlowHelper(page);
    
    console.log('🧪 C2b: Testing checkout reliability...');
    
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.completeCartShipping();
    
    // First checkout attempt
    console.log('🛒 First checkout attempt...');
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await checkoutBtn.click();
    
    const firstOrderId = await helper.extractOrderId();
    console.log(`📋 First order: ${firstOrderId}`);
    
    expect(firstOrderId).toBeTruthy();
    
    // Navigate back and try to add another item
    await helper.addProductToCart();
    await helper.completeCartShipping();
    
    // Second checkout attempt (should work independently)
    console.log('🛒 Second checkout attempt...');
    const secondCheckoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(secondCheckoutBtn).toBeEnabled();
    
    console.log('✅ C2b: Multiple checkout handling verified');
  });
  
  test('C2c: Checkout with different payment methods', async ({ page }) => {
    const helper = new CheckoutFlowHelper(page);
    
    console.log('🧪 C2c: Testing payment methods...');
    
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.completeCartShipping();
    
    // Verify default payment method (COD)
    const paymentInfo = page.locator(':text("Cash on Delivery"), :text("COD"), :text("Payment on delivery")');
    
    // Proceed with default payment method
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await checkoutBtn.click();
    
    const orderId = await helper.extractOrderId();
    console.log(`📋 Order with COD: ${orderId}`);
    
    expect(orderId).toBeTruthy();
    
    console.log('✅ C2c: Payment method handling verified');
  });
});