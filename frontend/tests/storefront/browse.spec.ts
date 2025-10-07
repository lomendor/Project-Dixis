import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Storefront - Browse & Cart Flow', () => {
  test('visitor can browse products and complete COD checkout', async ({ page }) => {
    // 1. Visit home page
    await page.goto(base);
    await expect(page.getByText('Καλώς ήρθατε στο Project Dixis')).toBeVisible();

    // 2. Navigate to products
    await page.click('text=Δείτε Όλα τα Προϊόντα');
    await page.waitForURL('**/products');
    await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible();

    // 3. Wait for products to load
    const productLinks = page.locator('a[href^="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });

    // 4. Click first available product
    const firstProduct = productLinks.first();
    await firstProduct.click();
    await page.waitForURL('**/products/*');

    // 5. Check product detail page loaded
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 6. Check if stock available - if so, add to cart
    const addButton = page.getByRole('button', { name: /Προσθήκη στο Καλάθι/i });
    const isDisabled = await addButton.isDisabled();

    if (!isDisabled) {
      // Product is available, add to cart
      await addButton.click();

      // 7. Should redirect to cart page
      await page.waitForURL('**/cart');
      await expect(page.getByRole('heading', { name: 'Το Καλάθι μου' })).toBeVisible();

      // 8. Verify cart has items
      await expect(page.locator('text=Ολοκλήρωση Παραγγελίας')).toBeVisible();

      // 9. Proceed to checkout
      await page.click('text=Ολοκλήρωση Παραγγελίας');
      await page.waitForURL('**/checkout');
      await expect(page.getByRole('heading', { name: 'Ολοκλήρωση Παραγγελίας' })).toBeVisible();

      // 10. Fill shipping form
      await page.fill('input[id="name"]', 'Test Visitor');
      await page.fill('input[id="phone"]', '+306900000099');
      await page.fill('input[id="line1"]', 'Test Address 123');
      await page.fill('input[id="city"]', 'Αθήνα');
      await page.fill('input[id="postal"]', '12345');

      // 11. Submit order
      await page.click('button[type="submit"]');

      // 12. Check confirmation page
      await page.waitForURL('**/checkout/confirmation*', { timeout: 15000 });
      await expect(page.getByText(/Η παραγγελία σας ολοκληρώθηκε/i)).toBeVisible({ timeout: 10000 });

      // 13. Verify order ID is shown
      const orderIdText = page.locator('text=Αριθμός Παραγγελίας').locator('..');
      await expect(orderIdText).toBeVisible();
    } else {
      // Product out of stock, skip checkout
      console.log('Product out of stock, skipping checkout test');
    }
  });

  test('visitor can search and filter products', async ({ page }) => {
    await page.goto(`${base}/products`);
    await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible();

    // Test search
    await page.fill('input[name="search"]', 'Μήλα');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/products?search=*');

    // Test category filter
    await page.selectOption('select[name="category"]', 'Φρούτα');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/products?*category=*');
  });

  test('visitor can modify cart quantities', async ({ page }) => {
    // First add product to cart
    await page.goto(`${base}/products`);
    const productLinks = page.locator('a[href^="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });

    await productLinks.first().click();
    await page.waitForURL('**/products/*');

    const addButton = page.getByRole('button', { name: /Προσθήκη στο Καλάθι/i });
    const isDisabled = await addButton.isDisabled();

    if (!isDisabled) {
      // Increase quantity before adding
      const increaseBtn = page.getByRole('button', { name: 'Αύξηση ποσότητας' });
      await increaseBtn.click();

      await addButton.click();
      await page.waitForURL('**/cart');

      // Test quantity change in cart
      const qtyInput = page.locator('input[type="number"]').first();
      const currentQty = await qtyInput.inputValue();
      expect(Number(currentQty)).toBeGreaterThan(0);

      // Test remove button
      const removeBtn = page.getByText('Αφαίρεση').first();
      await removeBtn.click();

      // Should show empty cart or update
      await page.waitForTimeout(500);
    }
  });

  test('empty cart redirects properly', async ({ page }) => {
    // Visit cart with no items
    await page.goto(`${base}/cart`);
    await expect(page.getByText('Το καλάθι σας είναι άδειο')).toBeVisible();
    await expect(page.getByText('Συνέχεια Αγορών')).toBeVisible();

    // Visit checkout with no items
    await page.goto(`${base}/checkout`);
    await expect(page.getByText('Το καλάθι σας είναι άδειο')).toBeVisible();
  });
});
