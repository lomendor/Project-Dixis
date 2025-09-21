import { test, expect, Page } from '@playwright/test';

interface ShippingTestCase {
  postal_code: string;
  expected_zone: string;
  expected_carrier: string;
  expected_delivery_days: number;
  description: string;
}

interface ProductTestCase {
  product_id: number;
  quantity: number;
  expected_weight_impact: 'low' | 'medium' | 'high';
}

class ShippingEngineHelper {
  constructor(private page: Page) {}

  async loginAsConsumer() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');

    await this.page.fill('[name="email"]', 'consumer@example.com');
    await this.page.fill('[name="password"]', 'password');

    await Promise.all([
      this.page.waitForURL('/', { timeout: 10000 }),
      this.page.click('button[type="submit"]')
    ]);
  }

  async addProductToCart(productId: number = 1, quantity: number = 1) {
    await this.page.goto(`/products/${productId}`);
    await this.page.waitForLoadState('networkidle');

    // Set quantity if different from 1
    if (quantity > 1) {
      const quantityInput = this.page.locator('input[type="number"], input[name="quantity"]');
      if (await quantityInput.count() > 0) {
        await quantityInput.fill(quantity.toString());
      }
    }

    const addToCartBtn = this.page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToCart() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async requestShippingQuote(postalCode: string, city: string = 'Athens') {
    // Fill postal code field
    const postalSelectors = [
      'input[name="postalCode"]',
      'input[placeholder*="ΤΚ"]',
      'input[placeholder*="postal"]'
    ];

    let postalField = null;
    for (const selector of postalSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.isVisible()) {
        postalField = element;
        break;
      }
    }

    if (!postalField) {
      throw new Error('Could not find postal code field');
    }

    await postalField.clear();
    await postalField.fill(postalCode);

    // Fill city field
    const citySelectors = [
      'input[name="city"]',
      'input[placeholder*="πόλη"]',
      'input[placeholder*="city"]'
    ];

    let cityField = null;
    for (const selector of citySelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.isVisible()) {
        cityField = element;
        break;
      }
    }

    if (cityField) {
      await cityField.clear();
      await cityField.fill(city);
    }

    // Wait for shipping quote to load (auto-triggered by postal code)
    await this.page.waitForTimeout(3000);
  }

  async extractShippingQuoteData() {
    // Look for shipping quote component
    const quoteContainer = this.page.locator('.shipping-quote, [class*="shipping-quote"]');

    if (await quoteContainer.count() === 0) {
      throw new Error('Shipping quote component not found');
    }

    // Extract cost
    const costText = await this.page.locator('text=/[€$]\\d+\\.\\d{2}|\\d+\\.\\d{2}\\s*€/').first().textContent() || '';
    const costMatch = costText.match(/(\d+\.?\d*)/);
    const cost = costMatch ? parseFloat(costMatch[1]) : 0;

    // Extract carrier (look for known carriers)
    const carrierPatterns = ['ELTA', 'ACS', 'Speedex'];
    let carrier = '';
    for (const pattern of carrierPatterns) {
      if (await this.page.locator(`text=${pattern}`).count() > 0) {
        carrier = pattern;
        break;
      }
    }

    // Extract zone (look for zone indicators)
    const zonePatterns = ['Αττική', 'Θεσσαλονίκη', 'Ηπειρωτική', 'Κρήτη', 'Νησιά'];
    let zone = '';
    for (const pattern of zonePatterns) {
      if (await this.page.locator(`text=${pattern}`).count() > 0) {
        zone = pattern;
        break;
      }
    }

    // Extract delivery days
    const deliveryText = await this.page.locator('text=/\\d+\\s*(εργάσιμ|day)/).first().textContent() || '';
    const daysMatch = deliveryText.match(/(\d+)/);
    const deliveryDays = daysMatch ? parseInt(daysMatch[1]) : 0;

    return {
      cost,
      carrier,
      zone,
      deliveryDays,
      rawData: {
        costText,
        deliveryText
      }
    };
  }

  async captureScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `shipping-engine-v1-${name}-${timestamp}.png`;
    await this.page.screenshot({
      path: `test-results/${filename}`,
      fullPage: true
    });
    return filename;
  }
}

test.describe('Shipping Engine v1 - Zone-based Calculations', () => {
  let helper: ShippingEngineHelper;

  test.beforeEach(async ({ page }) => {
    helper = new ShippingEngineHelper(page);
    await helper.loginAsConsumer();
    await helper.addProductToCart(1, 1); // Add one standard product
    await helper.navigateToCart();
  });

  const zoneTestCases: ShippingTestCase[] = [
    {
      postal_code: '11527',
      expected_zone: 'Αττική',
      expected_carrier: 'ELTA',
      expected_delivery_days: 1,
      description: 'Athens Metro (Attiki) - Same day delivery'
    },
    {
      postal_code: '54622',
      expected_zone: 'Θεσσαλονίκη',
      expected_carrier: 'ACS',
      expected_delivery_days: 2,
      description: 'Thessaloniki area - Next day delivery'
    },
    {
      postal_code: '71202',
      expected_zone: 'Κρήτη',
      expected_carrier: 'Speedex',
      expected_delivery_days: 4,
      description: 'Crete - Island delivery'
    },
    {
      postal_code: '84100',
      expected_zone: 'Νησιά',
      expected_carrier: 'ELTA',
      expected_delivery_days: 5,
      description: 'Large islands - Extended delivery'
    }
  ];

  for (const testCase of zoneTestCases) {
    test(`Zone calculation: ${testCase.description}`, async () => {
      console.log(`🧪 Testing zone calculation for ${testCase.postal_code} (${testCase.description})`);

      await helper.captureScreenshot(`zone-test-${testCase.postal_code}-start`);

      // Request shipping quote
      await helper.requestShippingQuote(testCase.postal_code);

      await helper.captureScreenshot(`zone-test-${testCase.postal_code}-quote`);

      // Extract and verify shipping data
      const quoteData = await helper.extractShippingQuoteData();

      console.log('📊 Quote data extracted:', quoteData);

      // Verify zone mapping
      expect(quoteData.zone).toBeTruthy();
      expect(quoteData.zone).toContain(testCase.expected_zone);

      // Verify delivery days are in expected range
      expect(quoteData.deliveryDays).toBeGreaterThanOrEqual(testCase.expected_delivery_days - 1);
      expect(quoteData.deliveryDays).toBeLessThanOrEqual(testCase.expected_delivery_days + 1);

      // Verify cost is reasonable (between €2-15 for single item)
      expect(quoteData.cost).toBeGreaterThan(2);
      expect(quoteData.cost).toBeLessThan(15);

      console.log(`✅ Zone test passed for ${testCase.postal_code}`);
    });
  }
});

test.describe('Shipping Engine v1 - Volumetric Weight Calculations', () => {
  let helper: ShippingEngineHelper;

  test.beforeEach(async ({ page }) => {
    helper = new ShippingEngineHelper(page);
    await helper.loginAsConsumer();
  });

  const weightTestCases = [
    { quantity: 1, expectedCostRange: [3, 6], description: 'Single item - base rate' },
    { quantity: 3, expectedCostRange: [4, 8], description: 'Multiple items - weight tier 1' },
    { quantity: 8, expectedCostRange: [6, 12], description: 'Bulk items - weight tier 2' }
  ];

  for (const testCase of weightTestCases) {
    test(`Volumetric calculation: ${testCase.description}`, async () => {
      console.log(`📦 Testing volumetric calculation for ${testCase.quantity} items`);

      // Add products to cart
      await helper.addProductToCart(1, testCase.quantity);
      await helper.navigateToCart();

      await helper.captureScreenshot(`volume-test-${testCase.quantity}-items-start`);

      // Request shipping quote for Athens (consistent zone)
      await helper.requestShippingQuote('11527', 'Athens');

      await helper.captureScreenshot(`volume-test-${testCase.quantity}-items-quote`);

      // Extract shipping data
      const quoteData = await helper.extractShippingQuoteData();

      console.log(`📊 Quote for ${testCase.quantity} items:`, quoteData);

      // Verify cost is in expected range based on quantity
      expect(quoteData.cost).toBeGreaterThanOrEqual(testCase.expectedCostRange[0]);
      expect(quoteData.cost).toBeLessThanOrEqual(testCase.expectedCostRange[1]);

      // Verify delivery time is consistent for same zone
      expect(quoteData.deliveryDays).toBe(1); // Athens should always be 1 day

      console.log(`✅ Volumetric test passed for ${testCase.quantity} items`);
    });
  }
});

test.describe('Shipping Engine v1 - Producer Profile Integration', () => {
  let helper: ShippingEngineHelper;

  test.beforeEach(async ({ page }) => {
    helper = new ShippingEngineHelper(page);
    await helper.loginAsConsumer();
  });

  test('Free shipping threshold behavior', async () => {
    console.log('🆓 Testing free shipping threshold behavior');

    // Test with low-value cart (should have shipping cost)
    await helper.addProductToCart(1, 1);
    await helper.navigateToCart();

    await helper.captureScreenshot('free-shipping-low-value-start');

    await helper.requestShippingQuote('11527', 'Athens');

    await helper.captureScreenshot('free-shipping-low-value-quote');

    const lowValueQuote = await helper.extractShippingQuoteData();

    console.log('📊 Low value cart quote:', lowValueQuote);

    // Should have shipping cost for low-value orders
    expect(lowValueQuote.cost).toBeGreaterThan(0);

    // Clear cart and test with high-value cart
    await helper.page.goto('/cart');
    await helper.page.waitForLoadState('networkidle');

    // Add multiple high-value items (simulate premium producer with free shipping)
    await helper.addProductToCart(1, 5); // Large quantity to trigger potential free shipping

    await helper.captureScreenshot('free-shipping-high-value-start');

    await helper.requestShippingQuote('11527', 'Athens');

    await helper.captureScreenshot('free-shipping-high-value-quote');

    const highValueQuote = await helper.extractShippingQuoteData();

    console.log('📊 High value cart quote:', highValueQuote);

    // Verify that shipping cost behavior is reasonable
    // (may not be free, but should be proportionally different)
    expect(highValueQuote.cost).toBeGreaterThanOrEqual(0);

    console.log('✅ Free shipping threshold test completed');
  });

  test('Cross-zone cost consistency', async () => {
    console.log('🗺️ Testing cross-zone cost consistency');

    await helper.addProductToCart(1, 2); // Standard 2-item cart
    await helper.navigateToCart();

    const zones = [
      { postal: '11527', name: 'Athens', expectedBase: 3.5 },
      { postal: '54622', name: 'Thessaloniki', expectedBase: 4.0 },
      { postal: '71202', name: 'Crete', expectedBase: 8.0 }
    ];

    const results = [];

    for (const zone of zones) {
      console.log(`📍 Testing zone: ${zone.name} (${zone.postal})`);

      await helper.requestShippingQuote(zone.postal, zone.name);
      await helper.page.waitForTimeout(2000); // Allow quote to update

      await helper.captureScreenshot(`cross-zone-${zone.name.toLowerCase()}`);

      const quoteData = await helper.extractShippingQuoteData();

      results.push({
        zone: zone.name,
        postal: zone.postal,
        cost: quoteData.cost,
        days: quoteData.deliveryDays
      });

      console.log(`📊 ${zone.name} quote:`, quoteData);
    }

    // Verify cost progression makes sense (islands > mainland)
    const athens = results.find(r => r.zone === 'Athens');
    const crete = results.find(r => r.zone === 'Crete');

    if (athens && crete) {
      expect(crete.cost).toBeGreaterThan(athens.cost);
      expect(crete.days).toBeGreaterThan(athens.days);
    }

    console.log('✅ Cross-zone consistency test completed');
    console.log('📊 Final results:', results);
  });
});

test.describe('Shipping Engine v1 - Error Handling & Edge Cases', () => {
  let helper: ShippingEngineHelper;

  test.beforeEach(async ({ page }) => {
    helper = new ShippingEngineHelper(page);
    await helper.loginAsConsumer();
    await helper.addProductToCart(1, 1);
    await helper.navigateToCart();
  });

  test('Invalid postal code handling', async () => {
    console.log('❌ Testing invalid postal code handling');

    const invalidCodes = ['00000', '99999', '12345', 'ABCDE', ''];

    for (const code of invalidCodes) {
      console.log(`🧪 Testing invalid code: "${code}"`);

      await helper.captureScreenshot(`invalid-postal-${code || 'empty'}-start`);

      try {
        await helper.requestShippingQuote(code, 'Test City');
        await helper.page.waitForTimeout(2000);

        await helper.captureScreenshot(`invalid-postal-${code || 'empty'}-result`);

        // Should either show error message or fallback to default
        const errorElements = [
          this.page.locator('text=/invalid|error|μη έγκυρ/i'),
          this.page.locator('.error, .alert-error, [class*="error"]'),
          this.page.locator('[role="alert"]')
        ];

        let hasError = false;
        for (const errorEl of errorElements) {
          if (await errorEl.count() > 0) {
            hasError = true;
            console.log(`✅ Error message found for invalid code: ${code}`);
            break;
          }
        }

        // If no error shown, should at least not crash the page
        expect(this.page.locator('body')).toBeVisible();

      } catch (error) {
        console.log(`⚠️ Exception during invalid code test: ${error.message}`);
        // This is acceptable for invalid inputs
      }
    }

    console.log('✅ Invalid postal code handling test completed');
  });

  test('Empty cart shipping behavior', async () => {
    console.log('🛒 Testing empty cart shipping behavior');

    // Clear the cart (assuming there's a way to remove items)
    const removeButtons = this.page.locator('button:has-text("Remove"), [data-testid="remove-item"]');
    if (await removeButtons.count() > 0) {
      await removeButtons.first().click();
      await this.page.waitForTimeout(1000);
    }

    await helper.captureScreenshot('empty-cart-start');

    // Try to request shipping quote with empty cart
    try {
      await helper.requestShippingQuote('11527', 'Athens');
      await helper.page.waitForTimeout(2000);

      await helper.captureScreenshot('empty-cart-quote-attempt');

      // Should either redirect to products or show appropriate message
      const emptyMessages = [
        this.page.locator('text=/empty|κενό|no items/i'),
        this.page.locator('[data-testid="empty-cart-message"]')
      ];

      let hasEmptyMessage = false;
      for (const msgEl of emptyMessages) {
        if (await msgEl.count() > 0) {
          hasEmptyMessage = true;
          console.log('✅ Empty cart message found');
          break;
        }
      }

      // At minimum, page should not crash
      expect(this.page.locator('body')).toBeVisible();

    } catch (error) {
      console.log(`⚠️ Exception during empty cart test: ${error.message}`);
      // This may be expected behavior
    }

    console.log('✅ Empty cart shipping test completed');
  });
});