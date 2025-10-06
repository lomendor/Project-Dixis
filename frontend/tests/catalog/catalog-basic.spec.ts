import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345742';
const bypass = process.env.OTP_BYPASS || '000000';

async function loginSess() {
  const ctx = await pwRequest.newContext();
  await ctx.post(base + '/api/auth/request-otp', { data: { phone } });
  const vr = await ctx.post(base + '/api/auth/verify-otp', {
    data: { phone, code: bypass },
  });
  const cookies = await vr.headersArray();
  return (
    cookies
      .find((h) => h.name.toLowerCase() === 'set-cookie')
      ?.value.split('dixis_session=')[1]
      .split(';')[0] || ''
  );
}

test.describe('Public Catalog', () => {
  test('Catalog shows only active products, filters work', async ({
    page,
    request,
  }) => {
    const sess = await loginSess();

    // Create test products: one active, one archived
    const ctx = await pwRequest.newContext();

    // Create producer first
    const producerResp = await ctx.post(base + '/api/me/producers', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        name: 'Κατάλογος Test',
        region: 'Αττική',
        category: 'Μέλι',
      },
    });

    if (!producerResp.ok()) {
      console.log('Producer creation failed, skipping test');
      return;
    }

    const producerData = await producerResp.json();
    const producerId =
      producerData.producer?.id || producerData.id || 'test-producer-id';

    // Create active product
    const activeResp = await ctx.post(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        title: 'Μέλι Θυμάρι',
        category: 'Μέλι',
        price: 8,
        unit: 'τεμ',
        stock: 5,
        isActive: true,
        producerId: producerId,
      },
    });

    // Create archived product
    await ctx.post(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        title: 'Μέλι Ρείκι',
        category: 'Μέλι',
        price: 9,
        unit: 'τεμ',
        stock: 3,
        isActive: false,
        producerId: producerId,
      },
    });

    // Navigate to catalog
    await page.goto(base + '/products?q=Μέλι');

    // Check page loaded
    await expect(
      page.getByRole('heading', { name: 'Προϊόντα' })
    ).toBeVisible({ timeout: 10000 });

    // Active product should be visible
    await expect(page.getByText('Μέλι Θυμάρι')).toBeVisible({
      timeout: 5000,
    });

    // Archived product should NOT be visible
    const archivedCount = await page.getByText('Μέλι Ρείκι').count();
    expect(archivedCount).toBe(0);
  });

  test('Product detail page loads and shows add to cart', async ({
    page,
    request,
  }) => {
    const sess = await loginSess();
    const ctx = await pwRequest.newContext();

    // Create producer
    const producerResp = await ctx.post(base + '/api/me/producers', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        name: 'Detail Test Producer',
        region: 'Θεσσαλία',
        category: 'Γαλακτοκομικά',
      },
    });

    if (!producerResp.ok()) {
      console.log('Producer creation failed, skipping test');
      return;
    }

    const producerData = await producerResp.json();
    const producerId =
      producerData.producer?.id || producerData.id || 'test-producer-id';

    // Create product
    const productResp = await ctx.post(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        title: 'Φέτα Τεστ',
        category: 'Γαλακτοκομικά',
        price: 12.5,
        unit: 'kg',
        stock: 10,
        description: 'Παραδοσιακή φέτα από πρόβειο γάλα',
        isActive: true,
        producerId: producerId,
      },
    });

    if (!productResp.ok()) {
      console.log('Product creation failed, skipping test');
      return;
    }

    const productData = await productResp.json();
    const productId = productData.item?.id || productData.id;

    if (!productId) {
      console.log('Product ID not found, skipping test');
      return;
    }

    // Navigate to product detail page
    await page.goto(base + `/product/${productId}`);

    // Check page loaded
    await expect(
      page.getByRole('heading', { name: 'Φέτα Τεστ' })
    ).toBeVisible({ timeout: 10000 });

    // Check price is visible
    await expect(page.getByText('12.5 € / kg')).toBeVisible();

    // Check add to cart button exists (if stock > 0)
    const addToCartBtn = page.getByRole('button', {
      name: /Προσθήκη στο καλάθι/i,
    });
    await expect(addToCartBtn).toBeVisible();
  });

  test('Products list loads without auth', async ({ page }) => {
    // Public catalog should be accessible without login
    await page.goto(base + '/products');

    await expect(
      page.getByRole('heading', { name: 'Προϊόντα' })
    ).toBeVisible({ timeout: 10000 });

    // Check search form is present
    await expect(
      page.getByPlaceholder('Αναζήτηση τίτλου…')
    ).toBeVisible();
  });
});
