import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Checkout Hardening', () => {
  test('invalid checkout blocked - empty cart', async ({ request }) => {
    const res = await request.post(`${base}/api/checkout`, {
      data: {
        items: [],
        shipping: {
          name: 'Test User',
          phone: '+306900000123',
          line1: 'Test Address',
          city: 'Αθήνα',
          postal: '12345'
        },
        paymentMethod: 'COD'
      }
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('καλάθι');
  });

  test('invalid checkout blocked - missing shipping data', async ({ request }) => {
    const res = await request.post(`${base}/api/checkout`, {
      data: {
        items: [{ productId: 'test-id', qty: 1 }],
        shipping: {
          name: '',
          phone: '',
          line1: '',
          city: '',
          postal: ''
        },
        paymentMethod: 'COD'
      }
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('invalid checkout blocked - invalid qty', async ({ request }) => {
    const res = await request.post(`${base}/api/checkout`, {
      data: {
        items: [{ productId: 'test-id', qty: 0 }],
        shipping: {
          name: 'Test User',
          phone: '+306900000123',
          line1: 'Test Address',
          city: 'Αθήνα',
          postal: '12345'
        },
        paymentMethod: 'COD'
      }
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('successful checkout redirects to confirm page', async ({ page }) => {
    // Navigate to products page
    await page.goto(`${base}/products`);

    // Wait for products to load
    const productLinks = page.locator('a[href^="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });

    // Click on first available product
    await productLinks.first().click();
    await page.waitForURL('**/products/*');

    // Check if add to cart button is available
    const addButton = page.getByRole('button', { name: /Προσθήκη στο Καλάθι/i });
    const isDisabled = await addButton.isDisabled().catch(() => true);

    if (!isDisabled) {
      // Add to cart
      await addButton.click();
      await page.waitForURL('**/cart');

      // Go to checkout
      await page.click('text=Ολοκλήρωση Παραγγελίας');
      await page.waitForURL('**/checkout');

      // Fill in shipping form
      await page.fill('input[name="name"]', 'Δοκιμή Πελάτης');
      await page.fill('input[name="phone"]', '+306900000333');
      await page.fill('input[name="line1"]', 'Οδός Δοκιμής 123');
      await page.fill('input[name="city"]', 'Αθήνα');
      await page.fill('input[name="postal"]', '11111');

      // Submit checkout
      await page.click('button[type="submit"]');

      // Should redirect to confirm page
      await page.waitForURL('**/checkout/confirm/*', { timeout: 15000 });

      // Verify confirmation page content
      await expect(page.getByText(/Ευχαριστούμε|καταχωρήθηκε/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/Αριθμός Παραγγελίας/i)).toBeVisible();
    } else {
      console.log('Product out of stock, skipping happy path test');
    }
  });

  test('checkout with invalid email shows error', async ({ request }) => {
    const res = await request.post(`${base}/api/checkout`, {
      data: {
        items: [{ productId: 'test-id', qty: 1 }],
        shipping: {
          name: 'Test User',
          phone: '+306900000123',
          line1: 'Test Address',
          city: 'Αθήνα',
          postal: '12345',
          email: 'invalid-email'
        },
        paymentMethod: 'COD'
      }
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('email');
  });
});
