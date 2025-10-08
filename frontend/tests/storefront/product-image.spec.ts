import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('storefront shows product image & description when available', async ({ request, page }) => {
  const imageUrl = 'https://via.placeholder.co/300x300';
  const prod = await request.post(base+'/api/me/products', {
    data: {
      title: 'Θρούμπες Θάσου',
      category: 'Ελιές',
      price: 4.2,
      unit: 'τεμ',
      stock: 5,
      isActive: true,
      imageUrl,
      description: 'Ελιές παραδοσιακές από Θάσο.'
    }
  });
  const pid = (await prod.json()).item.id;

  // Check product detail page shows image and description
  await page.goto(`${base}/products/${pid}`);
  await expect(page.getByRole('img')).toBeVisible();
  await expect(page.getByText('Ελιές παραδοσιακές από Θάσο.')).toBeVisible();

  // Check product list shows thumbnail
  await page.goto(`${base}/products?q=Θρούμπες`);
  await expect(page.getByText('Θρούμπες Θάσου')).toBeVisible();
  const images = page.locator('img[alt*="Θρούμπες"]');
  await expect(images.first()).toBeVisible();
});
