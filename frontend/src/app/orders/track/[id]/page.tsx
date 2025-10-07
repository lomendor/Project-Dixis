import { prisma } from '@/lib/db/client';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Παρακολούθηση | Dixis' };

function norm(s: string) {
  return (s || '').replace(/\s+/g, '').toLowerCase();
}

export default async function Page({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { phone?: string };
}) {
  const id = String(params.id || '');
  const phone = String(searchParams?.phone || '').trim();

  if (!id || !phone) {
    return notFound();
  }

  // Server-side filter: απαιτείται ταύτιση τηλεφώνου
  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: { select: { titleSnap: true, qty: true, price: true } } }
  });

  if (!o) return notFound();

  const ok = norm((o as any).buyerPhone || '') === norm(phone);
  if (!ok) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Δεν βρέθηκε παραγγελία</h1>
        <p>Ελέγξτε το τηλέφωνο και τον αριθμό παραγγελίας.</p>
      </main>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);
  const timeline = ['PENDING', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const status = String((o as any).status || 'PENDING').toUpperCase();

  return (
    <main style={{ display: 'grid', gap: 12, padding: 16 }}>
      <h1>Παραγγελία #{o.id}</h1>
      <div>
        Κατάσταση: <b>{status}</b>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {timeline.map((s) => (
          <span
            key={s}
            style={{
              padding: '4px 8px',
              border: '1px solid #eee',
              borderRadius: 6,
              opacity: s === status ? 1 : 0.4
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <h3>Είδη</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Προϊόν</th>
            <th>Ποσότητα</th>
            <th>Σύνολο</th>
          </tr>
        </thead>
        <tbody>
          {o.items.map((i: any, idx: number) => (
            <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
              <td>{i.titleSnap}</td>
              <td>{i.qty}</td>
              <td>{fmt(Number(i.price || 0) * Number(i.qty || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <b>Σύνολο:</b> {fmt(Number((o as any).total || 0))}
      </div>
    </main>
  );
}
