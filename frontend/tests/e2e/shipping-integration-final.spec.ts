import { test, expect, Page } from '@playwright/test';

class ShippingDemoHelper {
  constructor(private page: Page) {}

  async loginAndNavigateToCart() {
    console.log('🔐 Logging in...');
    
    // Start from home page
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    
    // Navigate to login
    await this.page.getByRole('link', { name: /login/i }).first().click();
    await expect(this.page).toHaveURL(/\/auth\/login/);
    
    // Login
    await this.page.fill('[name="email"]', 'consumer@example.com');
    await this.page.fill('[name="password"]', 'password');
    
    await Promise.all([
      this.page.waitForURL('/', { timeout: 10000 }),
      this.page.click('button[type="submit"]')
    ]);
    
    console.log('✅ Login successful');
    
    // Add a product to cart first
    console.log('🛒 Adding product to cart...');
    
    // Wait for products to load
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    
    // Click on first product
    const firstProduct = this.page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await expect(this.page).toHaveURL(/\/products\/\d+/);
    await this.page.waitForLoadState('networkidle');
    
    // Add to cart
    const addToCartBtn = this.page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Product added to cart');
    
    // Navigate to cart
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
    
    // Verify we're on cart page and have items
    await expect(this.page).toHaveURL(/\/cart/);
    
    console.log('✅ Navigated to cart with items');
  }

  async captureScreenshotWithTimestamp(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `shipping-integration-${name}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: `test-results/${filename}`,
      fullPage: true 
    });
    console.log(`📸 Screenshot captured: ${filename}`);
    return filename;
  }

  async findAndFillShippingFields() {
    console.log('🔍 Looking for shipping fields...');
    
    // Wait a moment for the page to fully load
    await this.page.waitForTimeout(2000);
    
    // Take screenshot of current state
    await this.captureScreenshotWithTimestamp('01-cart-loaded');
    
    // Common selectors for postal code field
    const postalSelectors = [
      'input[name="postal_code"]',
      'input[name="postalCode"]',
      'input[name="zip"]',
      'input[name="zipCode"]',
      'input[placeholder*="postal"]',
      'input[placeholder*="ΤΚ"]',
      'input[placeholder*="ZIP"]',
      'input[id*="postal"]',
      'input[data-testid="postal-code"]',
      'input[data-testid="zip"]'
    ];
    
    // Common selectors for city field
    const citySelectors = [
      'input[name="city"]',
      'input[name="shipping_city"]',
      'input[placeholder*="city"]',
      'input[placeholder*="πόλη"]',
      'input[placeholder*="City"]',
      'input[id*="city"]',
      'input[data-testid="city"]'
    ];
    
    let postalField = null;
    let cityField = null;
    
    // Find postal code field
    for (const selector of postalSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          postalField = element;
          console.log(`✅ Found postal field: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    // Find city field
    for (const selector of citySelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          cityField = element;
          console.log(`✅ Found city field: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    if (postalField && cityField) {
      console.log('📝 Filling shipping fields...');
      
      // Fill postal code
      await postalField.clear();
      await postalField.fill('11527');
      await this.captureScreenshotWithTimestamp('02-postal-entered');
      
      // Fill city
      await cityField.clear();
      await cityField.fill('Athens');
      await this.captureScreenshotWithTimestamp('03-city-entered');
      
      // Wait for potential AJAX calls
      await this.page.waitForTimeout(3000);
      await this.captureScreenshotWithTimestamp('04-after-ajax-wait');
      
      console.log('✅ Shipping details entered successfully');
      return true;
      
    } else {
      console.log('⚠️ Could not find both postal and city fields');
      console.log(`  Postal field found: ${postalField ? 'Yes' : 'No'}`);
      console.log(`  City field found: ${cityField ? 'Yes' : 'No'}`);
      
      // Still capture screenshots for debugging
      await this.captureScreenshotWithTimestamp('debug-no-fields-found');
      
      return false;
    }
  }

  async searchForShippingInformation() {
    console.log('🔍 Looking for shipping cost information...');
    
    // Look for shipping-related text content
    const shippingPatterns = [
      'Athens Express',
      '€4.20',
      '4.20',
      '1 day',
      'Express',
      'shipping',
      'delivery'
    ];
    
    const foundInfo = [];
    
    for (const pattern of shippingPatterns) {
      try {
        const element = this.page.locator(`text=${pattern}`);
        const count = await element.count();
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            if (await element.nth(i).isVisible()) {
              const text = await element.nth(i).textContent();
              foundInfo.push(`${pattern}: "${text}"`);
            }
          }
        }
      } catch (e) {
        // Pattern not found
      }
    }
    
    if (foundInfo.length > 0) {
      console.log('✅ Found shipping information:');
      foundInfo.forEach(info => console.log(`  ${info}`));
    } else {
      console.log('⚠️ No shipping cost information found in visible text');
    }
    
    // Also check for any elements with shipping-related data attributes or classes
    const shippingElements = [
      '[data-testid*="shipping"]',
      '[class*="shipping"]',
      '[id*="shipping"]',
      '.cost',
      '.total',
      '.price'
    ];
    
    for (const selector of shippingElements) {
      try {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`✅ Found ${count} elements with selector: ${selector}`);
          for (let i = 0; i < Math.min(count, 3); i++) {
            const text = await elements.nth(i).textContent();
            console.log(`  Element ${i + 1}: "${text}"`);
          }
        }
      } catch (e) {
        // Selector not found
      }
    }
    
    return foundInfo.length > 0;
  }

  async analyzePage() {
    console.log('📊 Analyzing page structure...');
    
    // Get all form elements
    const forms = await this.page.locator('form').count();
    const inputs = await this.page.locator('input').count();
    const buttons = await this.page.locator('button').count();
    
    console.log(`📋 Page structure:`);
    console.log(`  Forms: ${forms}`);
    console.log(`  Input fields: ${inputs}`);
    console.log(`  Buttons: ${buttons}`);
    
    // List all input fields with their attributes
    if (inputs > 0) {
      console.log('📝 Input fields found:');
      const inputElements = this.page.locator('input');
      const inputCount = Math.min(inputs, 10); // Limit to first 10
      
      for (let i = 0; i < inputCount; i++) {
        try {
          const input = inputElements.nth(i);
          const name = await input.getAttribute('name') || 'no-name';
          const placeholder = await input.getAttribute('placeholder') || 'no-placeholder';
          const type = await input.getAttribute('type') || 'text';
          const visible = await input.isVisible();
          console.log(`  ${i + 1}. name="${name}", placeholder="${placeholder}", type="${type}", visible=${visible}`);
        } catch (e) {
          console.log(`  ${i + 1}. Could not analyze this input`);
        }
      }
    }
  }
}

test.describe('Shipping Integration Final Demo', () => {
  test('comprehensive shipping workflow demonstration', async ({ page }) => {
    const helper = new ShippingDemoHelper(page);
    
    console.log('🚀 Starting comprehensive shipping integration demo...');
    console.log('==================================================');
    
    try {
      // Step 1: Login and get to cart with items
      await helper.loginAndNavigateToCart();
      
      // Step 2: Analyze the page structure
      await helper.analyzePage();
      
      // Step 3: Look for and fill shipping fields
      const fieldsFound = await helper.findAndFillShippingFields();
      
      // Step 4: Search for shipping cost information
      const shippingInfoFound = await helper.searchForShippingInformation();
      
      // Step 5: Final screenshot
      await helper.captureScreenshotWithTimestamp('05-final-state');
      
      // Summary
      console.log('');
      console.log('📊 Demo Summary');
      console.log('===============');
      console.log(`✅ Login: Successful`);
      console.log(`✅ Cart Navigation: Successful`);
      console.log(`✅ Product Added: Successful`);
      console.log(`${fieldsFound ? '✅' : '⚠️'} Shipping Fields: ${fieldsFound ? 'Found and filled' : 'Not found'}`);
      console.log(`${shippingInfoFound ? '✅' : '⚠️'} Shipping Info: ${shippingInfoFound ? 'Found' : 'Not visible'}`);
      
      if (fieldsFound) {
        console.log('');
        console.log('🎯 Target Verification:');
        console.log('• Postal Code "11527": Entered');
        console.log('• City "Athens": Entered');
        console.log('• Screenshots captured showing the workflow');
      }
      
      console.log('');
      console.log('🎉 Shipping integration demo completed!');
      console.log('📂 Check test-results/ directory for screenshots');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      await helper.captureScreenshotWithTimestamp('error-state');
      throw error;
    }
  });
});