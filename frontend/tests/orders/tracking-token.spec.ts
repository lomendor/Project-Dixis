import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('email contains /orders/t/<code> and page shows order', async ({ request, page }) => {
  const email='token-track@example.com';
  // seed product & place order
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Ρίγανη', category:'Μπαχαρικά', price:1.2, unit:'τεμ', stock:5, isActive:true }});
  const pid = (await prod.json()).item.id;
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email }, payment:{ method:'COD' } }});
  expect([200,201]).toContain(ord.status());

  // διαβάζουμε dev mailbox
  const inbox = await request.get(base+`/api/dev/mailbox?to=${encodeURIComponent(email)}`);
  expect(inbox.status()).toBe(200);
  const msg = await inbox.json();
  const html = String(msg.item?.html||msg.item?.text||'');
  const m = html.match(/\/orders\/t\/([a-zA-Z0-9_-]+)/);
  expect(m).not.toBeNull();
  const trackUrl = m ? m[0] : '';

  await page.goto(`${base}${trackUrl}`);
  await expect(page.getByText(/Παρακολούθηση Παραγγελίας/i)).toBeVisible();
  await expect(page.getByText(/Κατάσταση/i)).toBeVisible();
});
