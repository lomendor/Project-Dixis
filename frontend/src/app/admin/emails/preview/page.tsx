import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';
import { renderOrderEmail } from '@/lib/mail/mailer';

export const metadata = { title: 'Email Preview (Admin) | Dixis' };

export default async function EmailPreviewPage({ searchParams }:{ searchParams?:{ id?:string, kind?:string } }){
  await requireAdmin();
  
  const id = String(searchParams?.id||'');
  const kind = (String(searchParams?.kind||'confirm') as 'confirm'|'status');
  
  if(!id) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Email Preview</h1>
        <p>Δώσε παράμετρο ?id=ORDER_ID&kind=confirm|status</p>
      </main>
    );
  }
  
  const o = await prisma.order.findUnique({ 
    where:{ id }, 
    include:{ items:true }
  });
  
  if(!o) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Δεν βρέθηκε παραγγελία</h1>
      </main>
    );
  }
  
  const tpl = await renderOrderEmail(kind, {
    id: o.id, 
    buyerName: o.buyerName || undefined,
    buyerEmail: (o as any).customerEmail || undefined,
    status: String(o.status||'PENDING'), 
    total: Number(o.total||0), 
    createdAt: o.createdAt,
    shippingLine1: o.shippingLine1 || undefined,
    shippingCity: o.shippingCity || undefined,
    shippingPostal: o.shippingPostal || undefined,
    items: o.items.map(i=>({ 
      titleSnap: i.titleSnap || undefined, 
      qty: i.qty, 
      price: i.price 
    }))
  });
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Preview: {tpl.subject}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div dangerouslySetInnerHTML={{__html: tpl.html}}/>
      </div>
      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Plain Text Version:</h3>
        <pre className="whitespace-pre-wrap">{tpl.text}</pre>
      </div>
    </main>
  );
}
