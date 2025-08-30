import { test, expect } from '@playwright/test';

test.describe('Shipping Demo Capture for PR #41', () => {
  test('Cart shipping calculation flow', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:3001/auth/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/shipping-demo/01-login.png', fullPage: true });

    // Login
    await page.fill('[data-testid="email"], input[type="email"], input[name="email"]', 'consumer@example.com');
    await page.fill('[data-testid="password"], input[type="password"], input[name="password"]', 'password');
    await page.click('[data-testid="login-button"], button[type="submit"], .login-button');
    await page.waitForLoadState('networkidle');
    
    // Go to main page and add product
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/shipping-demo/02-products.png', fullPage: true });

    // Click on first product
    await page.click('.product-card:first-child, [data-testid="product-card"]:first-child, a[href*="/products/"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/shipping-demo/03-product-detail.png', fullPage: true });

    // Add to cart (try multiple selectors)
    const addToCartSelectors = [
      '[data-testid="add-to-cart"]',
      'button:has-text("Add to Cart")', 
      'button:has-text("Προσθήκη στο Καλάθι")',
      '.add-to-cart-btn',
      'button[type="submit"]'
    ];

    for (const selector of addToCartSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.click(selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000); // Wait for cart update
    
    // Navigate to cart
    await page.goto('http://localhost:3001/cart');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/shipping-demo/04-cart-initial.png', fullPage: true });

    // DEMO STEP 1: Fill Athens postal code
    console.log('🎬 DEMO: Filling Athens postal code...');
    const postalSelectors = [
      '[data-testid="postal-code"]',
      'input[name="postalCode"]',
      'input[name="zip"]', 
      'input[placeholder*="ΤΚ"]',
      'input[placeholder*="postal"]'
    ];

    for (const selector of postalSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, '11527');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/shipping-demo/05-postal-athens.png', fullPage: true });

    // DEMO STEP 2: Fill Athens city
    console.log('🎬 DEMO: Filling Athens city...');
    const citySelectors = [
      '[data-testid="city"]',
      'input[name="city"]',
      'input[placeholder*="Πόλη"]',
      'input[placeholder*="City"]'
    ];

    for (const selector of citySelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'Athens');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000); // Wait for AJAX shipping calculation
    await page.screenshot({ path: 'test-results/shipping-demo/06-shipping-athens.png', fullPage: true });

    // DEMO STEP 3: Change to Thessaloniki
    console.log('🎬 DEMO: Changing to Thessaloniki...');
    
    // Clear and fill Thessaloniki postal code
    for (const selector of postalSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, '54623');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(1000);
    
    // Fill Thessaloniki city
    for (const selector of citySelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'Thessaloniki');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000); // Wait for AJAX shipping calculation
    await page.screenshot({ path: 'test-results/shipping-demo/07-shipping-thessaloniki.png', fullPage: true });

    // DEMO STEP 4: Change to Islands (Mykonos)
    console.log('🎬 DEMO: Changing to Islands (Mykonos)...');
    
    // Clear and fill Mykonos postal code  
    for (const selector of postalSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, '84600');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(1000);
    
    // Fill Mykonos city
    for (const selector of citySelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.fill(selector, 'Mykonos');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(3000); // Wait for AJAX shipping calculation
    await page.screenshot({ path: 'test-results/shipping-demo/08-shipping-islands.png', fullPage: true });

    // Final screenshot showing all shipping zones work
    await page.screenshot({ path: 'test-results/shipping-demo/09-final-state.png', fullPage: true });

    console.log('🎉 Shipping demo capture completed! Screenshots saved to test-results/shipping-demo/');
  });
});