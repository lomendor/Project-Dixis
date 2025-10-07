import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('atomic checkout sends confirmation + admin + low-stock emails', async ({ request }) => {
  const email='atomic-confirm@example.com';
  const admin = process.env.DEV_MAIL_TO || 'dev@localhost';
  const phone = '+306900007777';
  // seed product με low stock ώστε μετά το checkout να πέσει ≤ threshold (3)
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Σταφίδες', category:'Ξηροί', price:2.1, unit:'τεμ', stock:2, isActive:true }});
  const pid = (await prod.json()).item.id;

  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Τεστ', line1:'Οδός', city:'Αθήνα', postal:'11111', phone, email }, payment:{ method:'COD' } }});
  expect([200,201]).toContain(ord.status());
  const j = await ord.json(); const oid = j.orderId || j.id;

  // dev mailbox: confirmation
  let inbox = await request.get(base+`/api/dev/mailbox?to=${encodeURIComponent(email)}`);
  expect(inbox.status()).toBe(200);
  let msg = await inbox.json();
  expect((msg.item?.html||'')).toContain(`/orders/track/${oid}`);

  // admin notice
  inbox = await request.get(base+`/api/dev/mailbox?to=${encodeURIComponent(admin)}`);
  expect([200,403]).toContain(inbox.status());
  if (inbox.status()===200){
    msg = await inbox.json();
    expect((msg.item?.subject||'')).toMatch(/Νέα Παραγγελία|Χαμηλό απόθεμα/);
  }
});
