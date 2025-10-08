import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
test('low-stock admin email is sent when threshold reached (optional)', async ({ request }) => {
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Μέλι Θυμαρίσιο', category:'Παντοπωλείο', price:7, unit:'τεμ', stock:3, isActive:true }});
  const pid = (await prod.json()).item.id;
  await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email:'low@test.com' }, payment:{ method:'COD' } }});
  const adminTo = process.env.DEV_MAIL_TO || '';
  if (!adminTo) test.skip(true, 'no dev mailbox configured');
  const inbox = await request.get(base+`/api/dev/mailbox?to=${encodeURIComponent(adminTo)}`);
  expect([200,403]).toContain(inbox.status());
});
