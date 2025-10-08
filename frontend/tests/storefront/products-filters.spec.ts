import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('filters & search on /products', async ({ request, page }) => {
  // seed 3 products
  const mk = async (title:string, category:string, price:number, stock:number)=> {
    const r = await request.post(base+'/api/me/products', { data:{ title, category, price, unit:'τεμ', stock, isActive:true }});
    expect([200,201]).toContain(r.status());
    return (await r.json()).item.id;
  };
  await mk('Ελιές Καλαμών', 'Ελιές', 4.5, 10);
  await mk('Μέλι Θυμαρίσιο', 'Μέλι', 9.9, 0);
  await mk('Λάδι Εξαιρετικό', 'Ελαιόλαδο', 12.0, 3);

  // open with a query
  await page.goto(base + '/products?q=Ελιές&stock=in&sort=price-asc');
  await expect(page.getByText('Προϊόντα')).toBeVisible();
  await expect(page.getByText('Ελιές Καλαμών')).toBeVisible();
  // should not show out-of-stock "Μέλι Θυμαρίσιο"
  await expect(page.getByText('Μέλι Θυμαρίσιο')).toHaveCount(0);

  // change to category filter
  await page.goto(base + '/products?category=Ελαιόλαδο&sort=price-desc');
  await expect(page.getByText('Λάδι Εξαιρετικό')).toBeVisible();
});
