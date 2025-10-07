import { prisma } from '@/lib/db/client';
import { requireSessionUser } from '@/lib/auth/session';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Παραγγελία | Dixis' };

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await requireSessionUser();
  const orderId = params.id;

  // Fetch order with items, scoped to current user's phone
  const order = await prisma.order.findFirst({
    where: { 
      id: orderId, 
      buyerPhone: user.phone 
    },
    include: { 
      items: { 
        select: { 
          id: true, 
          qty: true, 
          price: true, 
          titleSnap: true, 
          priceSnap: true 
        } 
      } 
    }
  });

  if (!order) {
    notFound();
  }

  const total = Number(order.total ?? order.items.reduce((sum, item) => 
    sum + Number(item.price || item.priceSnap || 0) * Number(item.qty || 0), 0
  ));

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/orders" style={{ color: '#16a34a', textDecoration: 'underline', fontSize: 14 }}>
          ← Πίσω στις παραγγελίες
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: 24, fontSize: 28 }}>Παραγγελία #{order.id.slice(0, 8)}</h1>

        <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ color: '#6b7280' }}>Ημερομηνία:</span>
            <span style={{ fontWeight: 500 }}>
              {new Date(order.createdAt).toLocaleString('el-GR', { 
                dateStyle: 'long', 
                timeStyle: 'short' 
              })}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ color: '#6b7280' }}>Κατάσταση:</span>
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ color: '#6b7280' }}>Παραλήπτης:</span>
            <span style={{ fontWeight: 500 }}>{order.buyerName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ color: '#6b7280' }}>Διεύθυνση:</span>
            <div style={{ textAlign: 'right' }}>
              <div>{order.shippingLine1}</div>
              {order.shippingLine2 && <div>{order.shippingLine2}</div>}
              <div>{order.shippingPostal} {order.shippingCity}</div>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: 16, fontSize: 20 }}>Προϊόντα</h2>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {order.items.map((item) => {
            const itemPrice = Number(item.price || item.priceSnap || 0);
            const itemTotal = itemPrice * item.qty;

            return (
              <li key={item.id} style={{ 
                padding: 16, 
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.titleSnap}</div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    Ποσότητα: {item.qty} × {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(itemPrice)}
                  </div>
                </div>
                <div style={{ fontWeight: 600 }}>
                  {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(itemTotal)}
                </div>
              </li>
            );
          })}
        </ul>

        <div style={{ 
          marginTop: 24, 
          paddingTop: 24, 
          borderTop: '2px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 20,
          fontWeight: 600
        }}>
          <span>Σύνολο:</span>
          <span style={{ color: '#16a34a' }}>
            {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(total)}
          </span>
        </div>
      </div>
    </main>
  );
}
