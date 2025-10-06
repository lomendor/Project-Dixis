import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345684';
const bypass = process.env.OTP_BYPASS || '000000';

test.describe('Order Lifecycle Status Management', () => {
  test('Producer ACCEPT/REJECT/FULFILL and Buyer cancel with stock returns', async ({ request }) => {
    // Login and get session
    await request.post(base+'/api/auth/request-otp', { data: { phone }});
    const vr = await request.post(base+'/api/auth/verify-otp', { data: { phone, code: bypass }});
    const cookies = await vr.headers();
    const sessMatch = cookies['set-cookie']?.match(/dixis_session=([^;]+)/);
    const sess = sessMatch?.[1] || '';
    if (!sess) throw new Error('No session');

    // Create producer/product
    const make = await request.post(base+'/api/me/producers',{
      headers:{ cookie:`dixis_session=${sess}` },
      data:{ name:'Status Demo', region:'Αττική', category:'Μέλι', email:'prod@ex.com' }
    });
    expect(make.ok()).toBeTruthy();

    const p = await request.post(base+'/api/me/products',{
      headers:{ cookie:`dixis_session=${sess}` },
      data:{ title:'Μέλι Status', category:'Μέλι', price:10, stock:5, unit:'τεμ' }
    });
    const pid = (await p.json()).item.id;

    // Checkout 2 units
    const body = {
      items:[{productId:pid, qty:2}],
      shipping:{ name:'Α', line1:'Δ1', city:'Αθήνα', postal:'11111' }
    };
    const ck = await request.post(base+'/api/checkout',{
      data: body,
      headers:{ cookie:`dixis_session=${sess}` }
    });
    expect(ck.ok()).toBeTruthy();
    const orderId = (await ck.json()).orderId;

    // Fetch sales items
    const sales = await request.get(base+'/api/me/sales',{
      headers:{ cookie:`dixis_session=${sess}` }
    });
    const saleItems = (await sales.json()).items;
    expect(saleItems.length).toBeGreaterThan(0);
    const itemId = saleItems[0].id;

    // ACCEPT item
    const acc = await request.patch(base+'/api/me/sales/items/'+itemId,{
      headers:{ cookie:`dixis_session=${sess}` },
      data:{ status:'ACCEPTED' }
    });
    expect(acc.ok()).toBeTruthy();

    // Try CANCEL by buyer (should fail - item is ACCEPTED)
    const failCancel = await request.post(base+'/api/me/orders/'+orderId,{
      headers:{ cookie:`dixis_session=${sess}` }
    });
    expect(failCancel.status()).toBe(400);

    // FULFILL item
    const ful = await request.patch(base+'/api/me/sales/items/'+itemId,{
      headers:{ cookie:`dixis_session=${sess}` },
      data:{ status:'FULFILLED' }
    });
    expect(ful.ok()).toBeTruthy();

    // New order to test REJECT (stock return)
    const ck2 = await request.post(base+'/api/checkout',{
      data: body,
      headers:{ cookie:`dixis_session=${sess}` }
    });
    const orderId2 = (await ck2.json()).orderId;
    const sales2 = await request.get(base+'/api/me/sales',{
      headers:{ cookie:`dixis_session=${sess}` }
    });
    const items2 = (await sales2.json()).items;
    const item2 = items2.find((x:any)=>x.orderId===orderId2);

    // REJECT item (should return stock)
    const rej = await request.patch(base+'/api/me/sales/items/'+item2.id,{
      headers:{ cookie:`dixis_session=${sess}` },
      data:{ status:'REJECTED' }
    });
    expect(rej.ok()).toBeTruthy();

    // Check stock returned (initial 5, minus 4 total used, plus 2 returned from REJECT)
    const prodAfter = await request.get(base+'/api/products/'+pid);
    const pj = await prodAfter.json();
    // Stock should be >= 3 (5 initial - 2 first order - 2 second order + 2 rejected)
    expect(pj.stock).toBeGreaterThanOrEqual(3);

    // New order to test buyer CANCEL (all items PLACED)
    const ck3 = await request.post(base+'/api/checkout',{
      data: { items:[{productId:pid, qty:1}], shipping:body.shipping },
      headers:{ cookie:`dixis_session=${sess}` }
    });
    const orderId3 = (await ck3.json()).orderId;

    // Buyer CANCEL (all items PLACED, should succeed)
    const cancel3 = await request.post(base+'/api/me/orders/'+orderId3,{
      headers:{ cookie:`dixis_session=${sess}` }
    });
    expect(cancel3.ok()).toBeTruthy();

    // Verify order status is CANCELLED
    const ord3After = await request.get(base+'/api/me/orders');
    const orders = (await ord3After.json()).items;
    const cancelledOrder = orders.find((o:any)=>o.id===orderId3);
    expect(cancelledOrder?.status).toBe('CANCELLED');
  });
});
