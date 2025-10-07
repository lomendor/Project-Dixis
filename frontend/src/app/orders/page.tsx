import { prisma } from '@/lib/db/client';
import { requireSessionUser } from '@/lib/auth/session';
import Link from 'next/link';

export const metadata = { title: 'Οι παραγγελίες μου | Dixis' };

export default async function OrdersListPage() {
  const user = await requireSessionUser();

  // Fetch orders by buyerPhone (our user identifier)
  const orders = await prisma.order.findMany({
    where: { buyerPhone: user.phone },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, total: true, status: true }
  });

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>Οι παραγγελίες μου</h1>

      {orders.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: '#f9fafb', borderRadius: 8 }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>Δεν έχετε ακόμη παραγγελίες.</p>
          <Link href="/products" style={{ color: '#16a34a', textDecoration: 'underline' }}>
            Περιηγηθείτε στα προϊόντα
          </Link>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, background: 'white', borderRadius: 8, overflow: 'hidden' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>#</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Ημερομηνία</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Σύνολο</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Κατάσταση</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 12 }}>
                  <Link href={`/orders/${order.id}`} style={{ color: '#16a34a', textDecoration: 'underline' }}>
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td style={{ padding: 12 }}>
                  {new Date(order.createdAt).toLocaleString('el-GR', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}
                </td>
                <td style={{ padding: 12 }}>
                  {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(Number(order.total || 0))}
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: 16, 
                    background: order.status === 'pending' ? '#fef3c7' : '#d1fae5',
                    color: order.status === 'pending' ? '#92400e' : '#065f46',
                    fontSize: 14,
                    fontWeight: 500
                  }}>
                    {order.status === 'pending' ? 'Εκκρεμής' : order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
