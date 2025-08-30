import { test, expect, Page } from '@playwright/test';

test.describe('Shipping Demo - Simple', () => {
  test('capture cart page with shipping calculation', async ({ page }) => {
    console.log('🚀 Starting simple shipping demo...');
    
    // Navigate directly to cart page (if it allows without login)
    await page.goto('http://localhost:3001/cart');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/shipping-simple-01-cart-initial.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 1: Initial cart page');
    
    // Look for shipping form fields
    const shippingFields = [
      'input[name="postal_code"]',
      'input[placeholder*="postal"]',
      'input[placeholder*="ΤΚ"]',
      'input[id*="postal"]',
      'input[data-testid="postal-code"]',
      'input[name="city"]',
      'input[placeholder*="city"]',
      'input[placeholder*="πόλη"]',
      'input[id*="city"]',
      'input[data-testid="city"]'
    ];
    
    let foundFields = [];
    for (const selector of shippingFields) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.first().isVisible();
          if (isVisible) {
            foundFields.push(selector);
            console.log(`✅ Found shipping field: ${selector}`);
          }
        }
      } catch (e) {
        // Field not found, continue
      }
    }
    
    if (foundFields.length > 0) {
      // Try to fill in shipping details
      try {
        const postalField = page.locator(foundFields[0]).first();
        const cityField = foundFields.length > 1 ? page.locator(foundFields[1]).first() : null;
        
        if (postalField) {
          await postalField.fill('11527');
          console.log('✅ Entered postal code: 11527');
        }
        
        if (cityField) {
          await cityField.fill('Athens');
          console.log('✅ Entered city: Athens');
        }
        
        // Wait for potential AJAX updates
        await page.waitForTimeout(3000);
        
        // Take screenshot after entering data
        await page.screenshot({ 
          path: 'test-results/shipping-simple-02-fields-filled.png',
          fullPage: true 
        });
        console.log('📸 Screenshot 2: After entering shipping details');
        
        // Look for shipping cost information
        const shippingInfo = [
          'text=/Athens Express/',
          'text=/€4.20/',
          'text=/1 day/',
          '[data-testid*="shipping"]',
          '.shipping'
        ];
        
        for (const selector of shippingInfo) {
          try {
            const element = page.locator(selector);
            if (await element.count() > 0 && await element.first().isVisible()) {
              const text = await element.first().textContent();
              console.log(`✅ Found shipping info: ${text}`);
            }
          } catch (e) {
            // Info not found, continue
          }
        }
        
      } catch (e) {
        console.log('⚠️ Could not fill shipping fields:', e.message);
      }
    } else {
      console.log('⚠️ No shipping fields found on the page');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/shipping-simple-03-final.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 3: Final state');
    
    // Get page content for analysis
    const pageContent = await page.content();
    const hasShippingContent = pageContent.includes('shipping') || 
                              pageContent.includes('Athens') || 
                              pageContent.includes('€4.20') ||
                              pageContent.includes('postal') ||
                              pageContent.includes('ΤΚ');
    
    console.log(`📊 Page has shipping-related content: ${hasShippingContent ? 'Yes' : 'No'}`);
    console.log('✅ Simple shipping demo completed');
  });

  test('verify page elements and structure', async ({ page }) => {
    console.log('🔍 Analyzing page structure...');
    
    await page.goto('http://localhost:3001/cart');
    await page.waitForLoadState('networkidle');
    
    // Check for common cart elements
    const elements = [
      'form',
      'input',
      'button',
      '[data-testid]',
      '.cart',
      '.shipping'
    ];
    
    for (const selector of elements) {
      try {
        const count = await page.locator(selector).count();
        console.log(`📋 Found ${count} elements matching: ${selector}`);
      } catch (e) {
        console.log(`❌ Error checking ${selector}: ${e.message}`);
      }
    }
    
    // Get all input fields and their attributes
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`📝 Total input fields found: ${inputCount}`);
    
    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      try {
        const input = inputs.nth(i);
        const name = await input.getAttribute('name') || 'no-name';
        const placeholder = await input.getAttribute('placeholder') || 'no-placeholder';
        const type = await input.getAttribute('type') || 'text';
        console.log(`  Input ${i + 1}: name="${name}", placeholder="${placeholder}", type="${type}"`);
      } catch (e) {
        console.log(`  Input ${i + 1}: Could not read attributes`);
      }
    }
    
    console.log('✅ Page analysis completed');
  });
});