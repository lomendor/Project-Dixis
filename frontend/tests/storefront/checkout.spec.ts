import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function seed(request:any, payload:any){
  const r = await request.post(`${base}/api/dev/seed/product`, { data: payload });
  expect([200,201]).toContain(r.status());
  const j = await r.json();
  return j.item?.id || j.id;
}

test('checkout end-to-end (COD)', async ({ request, page }) => {
  // Seed test product
  const pid = await seed(request, {
    title:'Checkout Test Ελαιόλαδο',
    category:'Ελαιόλαδο',
    price:7.5,
    unit:'τεμ',
    stock:5,
    isActive:true
  });

  // Product page → add to cart
  await page.goto(`${base}/products/${pid}`);
  await page.fill('input[name="qty"]', '2');
  await page.click('button[type="submit"]');

  // Should redirect to cart
  await expect(page).toHaveURL(`${base}/cart`);

  // Go to checkout
  await page.goto(`${base}/checkout`);
  await expect(page.getByText('Ολοκλήρωση Παραγγελίας')).toBeVisible();

  // Verify cart summary is visible
  await expect(page.getByText('Checkout Test Ελαιόλαδο')).toBeVisible();

  // Fill form and submit
  await page.fill('input[name="name"]', 'Πελάτης Δοκιμή');
  await page.fill('input[name="phone"]', '+306900000001');
  await page.fill('input[name="email"]', 'checkout@example.com');
  await page.fill('input[name="line1"]', 'Οδός 1');
  await page.fill('input[name="city"]', 'Αθήνα');
  await page.fill('input[name="postal"]', '11111');
  await page.click('button[type="submit"]');

  // Should redirect to thank-you
  await expect(page).toHaveURL(new RegExp(`${base}/thank-you`));
  await expect(page.getByText('Ευχαριστούμε')).toBeVisible();
  await expect(page.getByText('Η παραγγελία σας καταχωρήθηκε επιτυχώς')).toBeVisible();
});
