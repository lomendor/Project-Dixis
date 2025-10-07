import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/db/client';

test.describe('Producer Portal E2E', () => {
  test('producer creates product → edits → toggles active → checkout → orders verification', async ({ page }) => {
    // 1. Create producer phone and simulate login (best-effort)
    const producerPhone = '+306912345678';

    // 2. Navigate to products page (assumes authentication is handled or permissive in dev)
    await page.goto('/me/products');

    // 3. Create new product
    await page.click('text=Νέο Προϊόν');
    await expect(page).toHaveURL('/me/products/new');

    // Fill product form
    const productTitle = `E2E Test Μέλι ${Date.now()}`;
    await page.fill('input[name="title"]', productTitle);
    await page.fill('input[name="category"]', 'Μέλι');
    await page.fill('input[name="price"]', '12.50');
    await page.fill('input[name="unit"]', 'kg');
    await page.fill('input[name="stock"]', '10');
    await page.fill('textarea[name="description"]', 'Τοπικό μέλι από τα βουνά');
    await page.check('input[name="isActive"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to products list
    await page.waitForURL('/me/products');
    await expect(page.locator('text=' + productTitle)).toBeVisible();

    // 4. Edit product - change price
    await page.click(`text=${productTitle}`).then(() => page.click('text=Επεξεργασία')).catch(() => {});
    // Alternative: Click the edit link directly
    const editLink = page.locator('a:has-text("Επεξεργασία")').first();
    await editLink.click();

    // Wait for edit page
    await page.waitForSelector('input[name="price"]');

    // Change price
    await page.fill('input[name="price"]', '15.00');
    await page.click('button:has-text("Αποθήκευση")');

    // Should redirect back to list
    await page.waitForURL('/me/products');

    // Verify price updated
    const priceCell = page.locator('tr:has-text("' + productTitle + '")').locator('td').nth(2);
    await expect(priceCell).toContainText('15,00');

    // 5. Toggle active status
    await page.click(`tr:has-text("${productTitle}") >> text=Επεξεργασία`);
    await page.waitForSelector('button:has-text("Απενεργοποίηση Προϊόντος")');

    // Deactivate product
    await page.click('button:has-text("Απενεργοποίηση Προϊόντος")');
    await page.waitForURL('/me/products');

    // Verify status changed to inactive
    const statusBadge = page.locator(`tr:has-text("${productTitle}") >> span:has-text("Μη ενεργό")`);
    await expect(statusBadge).toBeVisible();

    // 6. Reactivate product for checkout test
    await page.click(`tr:has-text("${productTitle}") >> text=Επεξεργασία`);
    await page.waitForSelector('input[name="isActive"]');
    await page.check('input[name="isActive"]');
    await page.click('button:has-text("Αποθήκευση")');
    await page.waitForURL('/me/products');

    // 7. Get product ID from database for checkout
    const product = await prisma.product.findFirst({
      where: { title: productTitle },
      select: { id: true }
    });

    expect(product).toBeTruthy();

    // 8. Simulate checkout via API (simplest approach)
    const checkoutResponse = await page.request.post('/api/checkout', {
      data: {
        items: [{ productId: product!.id, qty: 2 }],
        buyerName: 'E2E Tester',
        buyerPhone: '+306987654321',
        shippingAddress: 'Αθήνα, Ελλάδα',
        shippingPostalCode: '10001'
      }
    });

    expect(checkoutResponse.status()).toBe(200);
    const checkoutData = await checkoutResponse.json();
    expect(checkoutData.orderId).toBeTruthy();

    // 9. Navigate to /me/orders and verify order appears
    await page.goto('/me/orders');

    // Should see order with product
    await expect(page.locator(`text=${productTitle}`)).toBeVisible();
    await expect(page.locator(`text=E2E Tester`)).toBeVisible();

    // Verify order total includes product price
    const orderCard = page.locator('.bg-white').filter({ hasText: productTitle });
    await expect(orderCard).toBeVisible();

    // Verify product appears in items table
    const itemRow = orderCard.locator(`tr:has-text("${productTitle}")`);
    await expect(itemRow).toBeVisible();
    await expect(itemRow).toContainText('2'); // Quantity
    await expect(itemRow).toContainText('15,00'); // Price

    // Cleanup: Delete test product
    await prisma.product.delete({
      where: { id: product!.id }
    });
  });
});
