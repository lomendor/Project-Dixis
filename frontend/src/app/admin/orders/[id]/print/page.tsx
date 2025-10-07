import { prisma } from '@/lib/db/client';

export const metadata = { title: 'Εκτύπωση Παραγγελίας | Dixis' };

async function checkAdmin() {
  const { requireAdmin } = await import('@/lib/auth/admin');
  await requireAdmin();
}

export default async function PrintOrderPage({ params }: { params: { id: string } }) {
  await checkAdmin();
  
  const id = params.id;
  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: { select: { id: true, titleSnap: true, qty: true, price: true } } }
  });
  
  if (!o) {
    return (
      <main style={{ padding: '24px' }}>
        <p>Δεν βρέθηκε παραγγελία</p>
      </main>
    );
  }
  
  const total = Number(o.total ?? o.items.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0));

  return (
    <html lang="el">
      <head>
        <meta charSet="utf-8" />
        <title>Παραγγελία #{o.id}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print { .no-print { display: none; } body { font-size: 12pt; } }
          body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; margin: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: 600; }
          .header { margin-bottom: 24px; }
          .section { margin: 16px 0; }
          .total { font-size: 1.5em; font-weight: bold; margin-top: 16px; }
        `}} />
      </head>
      <body>
        <div className="no-print" style={{ marginBottom: '16px' }}>
          <button 
            onClick={() => (globalThis as any).print?.()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            🖨 Εκτύπωση
          </button>
          <a 
            href={`/admin/orders/${o.id}`}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            « Πίσω
          </a>
        </div>

        <div className="header">
          <h1>Παραγγελία #{o.id.substring(0, 8)}</h1>
          <div className="section">
            <p><strong>Ημερομηνία:</strong> {new Date(o.createdAt as any).toLocaleString('el-GR')}</p>
            <p><strong>Κατάσταση:</strong> {String(o.status || 'PENDING')}</p>
          </div>
        </div>

        <div className="section">
          <h2>Πληροφορίες Πελάτη</h2>
          <p><strong>Όνομα:</strong> {o.buyerName || '-'}</p>
          <p><strong>Τηλέφωνο:</strong> {o.buyerPhone || '-'}</p>
        </div>

        <div className="section">
          <h2>Διεύθυνση Αποστολής</h2>
          <p>{o.shippingLine1 || '-'}</p>
          {o.shippingLine2 && <p>{o.shippingLine2}</p>}
          <p>{o.shippingCity || ''} {o.shippingPostal || ''}</p>
        </div>

        <div className="section">
          <h2>Προϊόντα</h2>
          <table>
            <thead>
              <tr>
                <th>Προϊόν</th>
                <th>Ποσότητα</th>
                <th>Τιμή Μονάδας</th>
                <th>Σύνολο</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map(it => (
                <tr key={it.id}>
                  <td>{it.titleSnap}</td>
                  <td>{it.qty}</td>
                  <td>
                    {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(Number(it.price || 0))}
                  </td>
                  <td>
                    {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(
                      Number(it.price || 0) * Number(it.qty || 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="total">
          Σύνολο: {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(total)}
        </div>
      </body>
    </html>
  );
}
