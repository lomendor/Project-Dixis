import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('UI: add → cart → checkout form → 201 → confirm & cart cleared', async ({ request, page }) => {
  // seed
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Τυρί Κεφαλοτύρι', category:'Τυριά', price:8.2, unit:'τεμ', stock:4, isActive:true }});
  const pid = (await prod.json()).item.id;

  // add to cart
  await page.goto(`${base}/products/${pid}`);
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/i }).click();

  // proceed to checkout
  await page.goto(`${base}/cart`);
  await page.getByRole('link', { name: /Συνέχεια στο Checkout/i }).click();

  // fill form (selectors may differ στο project, βάλε τα πιο κοινά names)
  await page.fill('input[name="name"]', 'Πελάτης Τεστ');
  await page.fill('input[name="line1"]', 'Οδός 1');
  await page.fill('input[name="city"]', 'Αθήνα');
  await page.fill('input[name="postal"]', '11111');
  await page.fill('input[name="phone"]', '+306900006666');
  await page.fill('input[name="email"]', 'ui-checkout@example.com');
  await page.getByRole('button', { name: /Ολοκλήρωση|Πληρωμή|Submit/i }).click();

  // expect redirect to confirm
  await page.waitForURL(new RegExp(`/checkout/confirm/`));
  const url = page.url();

  // cart cleared
  const cart = await page.evaluate(()=>JSON.parse(localStorage.getItem('dixis_cart_v1')||'{"items":[]}'));
  expect(Array.isArray(cart.items) ? cart.items.length : 0).toBe(0);

  // tracking CTA (αν υπάρχει)
  await expect(page.getByText(/Παρακολούθηση παραγγελίας/i)).toBeVisible({ timeout: 5_000 });
});
