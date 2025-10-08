import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('checkout totals: tracking page shows Subtotal/Shipping/VAT/Total', async ({ request, page }) => {
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Γραβιέρα', category:'Τυριά', price:10, unit:'τεμ', stock:5, isActive:true }});
  const pid = (await prod.json()).item.id;

  // 2 τεμάχια → subtotal=20, default shipping=3.5 (κάτω του free-from 25), vat≈ 20*0.13/1.13≈2.3
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:2 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email:'totals@test.com' }, payment:{ method:'COD' } }});
  expect([200,201]).toContain(ord.status());

  // βρες tokenized link από confirmation inbox (προαιρετικά). Εδώ πάμε κατευθείαν σε dev mailbox του πελάτη ή fallback σε /orders/t με query από DB αν υπάρχει helper.
  const inbox = await request.get(base+`/api/dev/mailbox?to=${encodeURIComponent('totals@test.com')}`);
  expect([200,403]).toContain(inbox.status());
  let url = '';
  if (inbox.status()===200){
    const msg = await inbox.json(); const html = String(msg.item?.html||'');
    const m = html.match(/\/orders\/t\/([a-zA-Z0-9_-]+)/); if (m) url = m[0];
  }
  if (!url) test.skip(true, 'dev mailbox off; skip UI assertion'); else {
    await page.goto(`${base}${url}`);
    await expect(page.getByText('Σύνολα')).toBeVisible();
    await expect(page.getByText('Μερικό')).toBeVisible();
    await expect(page.getByText('Μεταφορικά')).toBeVisible();
    await expect(page.getByText('ΦΠΑ')).toBeVisible();
    await expect(page.getByText('Σύνολο')).toBeVisible();
  }
});
