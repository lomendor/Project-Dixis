import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        select: {
          id: true,
          titleSnap: true,
          qty: true,
          priceSnap: true
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Εκκρεμής',
    CONFIRMED: 'Επιβεβαιωμένη',
    SHIPPED: 'Απεσταλμένη',
    DELIVERED: 'Παραδομένη',
    CANCELLED: 'Ακυρωμένη'
  };

  const handleResend = async (formData: FormData) => {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001'}/api/orders/${id}/resend`, {
      method: 'POST'
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Επιβεβαίωση Παραγγελίας
      </h1>

      <div style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Αριθμός Παραγγελίας</p>
        <p style={{ fontSize: 20, fontWeight: 600 }}>{order.id}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Κατάσταση</h2>
        <p style={{ fontSize: 16 }}>
          {statusLabels[order.status] || order.status}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Είδη Παραγγελίας</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: 12 }}>Προϊόν</th>
              <th style={{ textAlign: 'center', padding: 12 }}>Ποσότητα</th>
              <th style={{ textAlign: 'right', padding: 12 }}>Τιμή</th>
              <th style={{ textAlign: 'right', padding: 12 }}>Σύνολο</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 12 }}>{item.titleSnap}</td>
                <td style={{ textAlign: 'center', padding: 12 }}>{item.qty}</td>
                <td style={{ textAlign: 'right', padding: 12 }}>€{Number(item.priceSnap).toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: 12 }}>
                  €{(Number(item.priceSnap) * item.qty).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Στοιχεία Αποστολής</h2>
        <p>{order.buyerName}</p>
        <p>{order.shippingLine1}</p>
        {order.shippingLine2 && <p>{order.shippingLine2}</p>}
        <p>{order.shippingCity}, {order.shippingPostal}</p>
        <p>Τηλ: {order.buyerPhone}</p>
      </div>

      <div style={{
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Υποσύνολο:</span>
          <span>€{Number(order.total).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Μεταφορικά:</span>
          <span>€0.00</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 20,
          fontWeight: 700,
          borderTop: '2px solid #e5e7eb',
          paddingTop: 12,
          marginTop: 12
        }}>
          <span>Σύνολο:</span>
          <span>€{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <form action={handleResend}>
        <button
          type="submit"
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Επαν-αποστολή Email Επιβεβαίωσης
        </button>
      </form>
    </div>
  );
}
