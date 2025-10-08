export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db/client';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Παρακολούθηση | Dixis' };

const fmtMoney = (n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

export default async function Page({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { phone?: string };
}) {
  const id = String(params.id || '');
  const phone = String(searchParams?.phone || '').trim();

  // Public tracking: phone is optional (Pass 156 - temporary until trackingCode is added)
  const o = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      total: true,
      updatedAt: true,
      items: { select: { titleSnap: true, qty: true, price: true } }
    }
  });

  if (!o) return notFound();

  return (
    <main style={{display:'grid',gap:16,padding:16,maxWidth:960,margin:'0 auto'}}>
      <h1>Παρακολούθηση Παραγγελίας #{o.id}</h1>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Κατάσταση</div>
          <div style={{fontSize:22,fontWeight:700}}>{String(o.status)}</div>
        </div>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Σύνολο</div>
          <div style={{fontSize:22,fontWeight:700}}>{fmtMoney(Number(o.total||0))}</div>
        </div>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Τελευταία ενημέρωση</div>
          <div style={{fontSize:22,fontWeight:700}}>{new Date(o.updatedAt as any).toLocaleString('el-GR')}</div>
        </div>
      </section>

      <section>
        <h3>Προϊόντα</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><th>Προϊόν</th><th>Ποσότητα</th><th>Τιμή</th><th>Μερικό</th></tr></thead>
          <tbody>
            {o.items.map((i:any,idx:number)=>(
              <tr key={idx} style={{borderTop:'1px solid #eee'}}>
                <td>{String(i.titleSnap||'')}</td>
                <td>{Number(i.qty||0)}</td>
                <td>{fmtMoney(Number(i.price||0))}</td>
                <td>{fmtMoney(Number(i.price||0)*Number(i.qty||0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p style={{opacity:.7}}>Για λεπτομέρειες αποστολής ή αλλαγές, επικοινωνήστε με την υποστήριξη.</p>
    </main>
  );
}
