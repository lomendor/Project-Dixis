import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { CheckoutSchema } from '@/lib/validators/checkout';
import { getSessionPhone } from '@/lib/auth/session';
import { Prisma } from '@prisma/client';

export async function POST(req: Request){
  try{
    const phone = await getSessionPhone();
    if(!phone) return NextResponse.json({error:'Απαιτείται σύνδεση'}, {status:401});

    const body = await req.json().catch(():null=>null);
    const parsed = CheckoutSchema.safeParse(body);
    if(!parsed.success) return NextResponse.json({error:'Λάθος στοιχεία', details: parsed.error}, {status:400});
    const { items, shipping, contactEmail } = parsed.data;

    // Φέρε προϊόντα, έλεγξε διαθεσιμότητα/τιμές
    const ids = items.map(i=>i.productId);
    const products = await prisma.product.findMany({
      where:{ id: { in: ids }, isActive: true, producer: { isActive: true } }
    });
    if(products.length !== items.length) {
      return NextResponse.json({error:'Μη διαθέσιμα προϊόντα'}, {status:400});
    }

    // Υπολόγισε totals
    type Tmp = { productId:string, qty:number, price:number, title:string, unit?:string, producerId:string };
    const tmp: Tmp[] = items.map(i=>{
      const p = products.find(x=>x.id===i.productId)!;
      const price = typeof (p as any).price === 'number' ? (p as any).price : Number((p as any).price || 0);
      return {
        productId: p.id,
        qty: i.qty,
        price,
        title: p.title,
        unit: (p as any).unit || undefined,
        producerId: p.producerId
      };
    });
    const total = tmp.reduce((s,it)=> s + it.price * it.qty, 0);

    // Συναλλαγή: έλεγχος stock + decrement + δημιουργία Order
    const created = await prisma.$transaction(async (tx)=>{
      // Re-check & decrement stock
      for(const it of tmp){
        const cur = await tx.product.findUnique({ where:{ id: it.productId }});
        if(!cur || !cur.isActive) throw new Error('PRODUCT_UNAVAILABLE');
        if((cur.stock||0) < it.qty) throw new Error('OUT_OF_STOCK');
        await tx.product.update({
          where:{ id: it.productId },
          data:{ stock: { decrement: it.qty } }
        });
      }
      const order = await tx.order.create({
        data:{
          buyerPhone: phone,
          status: 'PLACED',
          currency: 'EUR',
          total: new Prisma.Decimal(total.toFixed(2)),
          shippingName: shipping.name,
          shippingLine1: shipping.line1,
          shippingCity: shipping.city,
          shippingPostal: shipping.postal,
          contactEmail: contactEmail || null
        }
      });
      for(const it of tmp){
        await tx.orderItem.create({
          data:{
            orderId: order.id,
            productId: it.productId,
            producerId: it.producerId,
            titleSnap: it.title,
            unitSnap: it.unit || null,
            priceSnap: new Prisma.Decimal(it.price.toFixed(2)),
            qty: it.qty,
            subtotal: new Prisma.Decimal((it.price*it.qty).toFixed(2))
          }
        });
      }
      return order;
    });

    return NextResponse.json({ ok:true, orderId: created.id });
  }catch(e:any){
    const msg = String(e?.message||'ERROR');
    if (msg.includes('OUT_OF_STOCK')) {
      return NextResponse.json({error:'Μη επαρκές απόθεμα'}, {status:400});
    }
    if (msg.includes('PRODUCT_UNAVAILABLE')) {
      return NextResponse.json({error:'Μη διαθέσιμο προϊόν'}, {status:400});
    }
    return NextResponse.json({error:'Σφάλμα παραγγελίας'}, {status:500});
  }
}
