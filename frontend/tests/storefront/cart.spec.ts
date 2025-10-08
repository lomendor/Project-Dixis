import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test.describe('Cart (cookie-based)', () => {
  test('add to cart from product page → cart page → update qty', async ({ page }) => {
    // 1) Seed test product via dev API
    const res = await page.request.post(`${base}/api/dev/seed/product`, {
      data: {
        title: 'E2E Cart Test Product',
        category: 'Test',
        price: 10.5,
        unit: 'kg',
        stock: 50
      }
    });
    expect(res.ok()).toBeTruthy();
    const _j = await res.json();
    const productId = _j.item?.id || _j.id;

    // 2) Navigate to product detail page
    await page.goto(`${base}/products/${productId}`);
    await expect(page.locator('h1')).toContainText('E2E Cart Test Product');

    // 3) Add to cart with quantity 2
    await page.fill('input[name="qty"]', '2');
    await page.click('button[type="submit"]:has-text("Προσθήκη στο Καλάθι")');

    // 4) Should redirect to /cart
    await expect(page).toHaveURL(`${base}/cart`);

    // 5) Verify item is in cart
    await expect(page.locator('text=E2E Cart Test Product')).toBeVisible();
    await expect(page.locator('text=21,00')).toBeVisible(); // 10.5 × 2 = 21.00 EUR

    // 6) Update quantity to 3
    const qtyInput = page.locator('input[name="qty"]').first();
    await qtyInput.fill('3');
    await page.locator('button[type="submit"]:has-text("✓")').first().click();

    // 7) Verify total updated
    await expect(page).toHaveURL(`${base}/cart`);
    await expect(page.locator('text=31,50')).toBeVisible(); // 10.5 × 3 = 31.50 EUR

    // 8) Remove item
    await page.locator('button[type="submit"]:has-text("✕")').first().click();

    // 9) Verify empty cart
    await expect(page).toHaveURL(`${base}/cart`);
    await expect(page.locator('text=Το καλάθι σας είναι άδειο')).toBeVisible();
  });

  test('out-of-stock product should disable add-to-cart', async ({ page }) => {
    // 1) Seed out-of-stock product via dev API
    const res = await page.request.post(`${base}/api/dev/seed/product`, {
      data: {
        title: 'E2E Out of Stock Product',
        category: 'Test',
        price: 5,
        unit: 'piece',
        stock: 0
      }
    });
    expect(res.ok()).toBeTruthy();
    const _j = await res.json();
    const productId = _j.item?.id || _j.id;

    // 2) Navigate to product detail
    await page.goto(`${base}/products/${productId}`);

    // 3) Verify button is disabled
    const btn = page.locator('button[type="submit"]:has-text("Μη Διαθέσιμο")');
    await expect(btn).toBeDisabled();
    await expect(page.locator('text=Μη διαθέσιμο')).toBeVisible();
  });
});
