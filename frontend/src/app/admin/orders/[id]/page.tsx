import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CopyTrackingLink } from './CopyTrackingLink';
import PrintButton from '@/components/PrintButton';
import { OrderStatusQuickActions } from './OrderStatusQuickActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Παραγγελία (Admin) | Dixis' };

const transitions: Record<string, string[]> = {
  PENDING: ['PACKING', 'CANCELLED'],
  PAID: ['PACKING', 'CANCELLED'],
  PACKING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
};

async function changeStatusAction(orderId: string, newStatus: string) {
  'use server';
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/admin/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!res.ok) {
      throw new Error('Status change failed');
    }
    
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
  } catch (e) {
    console.error('Status change error:', e);
  }
  
  redirect(`/admin/orders/${orderId}`);
}

export default async function AdminOrderDetailPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin?.();

  const id = params.id;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        select: {
          id: true,
          titleSnap: true,
          qty: true,
          price: true
        }
      }
    }
  });

  if (!order) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Παραγγελία</h1>
        <p>Δεν βρέθηκε.</p>
        <Link href="/admin/orders" className="text-green-600 hover:text-green-700">
          ← Πίσω στη λίστα
        </Link>
      </main>
    );
  }

  const total = Number(
    order.total || order.items.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0)
  );

  const currentStatus = String(order.status || 'PENDING').toUpperCase();
  const availableTransitions = transitions[currentStatus] || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-green-600 hover:text-green-700 flex items-center gap-2 mb-4"
        >
          ← Πίσω στη λίστα
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Παραγγελία #{order.id.substring(0, 8)}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Πληροφορίες Παραγγελίας</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Ημερομηνία:</span>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleString('el-GR')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Κατάσταση:</span>
                <p className="font-medium">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      currentStatus === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : currentStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : currentStatus === 'SHIPPED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {currentStatus}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Πελάτης:</span>
                <p className="font-medium">{order.buyerName || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Τηλέφωνο:</span>
                <p className="font-medium">{order.buyerPhone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Διεύθυνση Αποστολής</h2>
            <p>{order.shippingLine1 || '-'}</p>
            {order.shippingLine2 && <p>{order.shippingLine2}</p>}
            <p>
              {order.shippingCity || ''} {order.shippingPostal || ''}
            </p>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Προϊόντα</h2>
            <div className="space-y-3">
              {order.items.map(it => (
                <div
                  key={it.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{it.titleSnap}</p>
                    <p className="text-sm text-gray-600">Ποσότητα: {it.qty}</p>
                  </div>
                  <p className="font-semibold">
                    {new Intl.NumberFormat('el-GR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(Number(it.price || 0) * Number(it.qty || 0))}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Σύνολο:</span>
                <span className="text-xl font-bold text-green-600">
                  {new Intl.NumberFormat('el-GR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Ενέργειες</h2>

            {/* Quick Actions */}
            <OrderStatusQuickActions
              orderId={order.id}
              currentStatus={currentStatus}
            />

            {/* Tracking Link */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Tracking Link:</p>
              <CopyTrackingLink publicToken={order.publicToken || ''} />
            </div>

            {availableTransitions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">Αλλαγή κατάστασης:</p>
                {availableTransitions.map(nextStatus => (
                  <form
                    key={nextStatus}
                    action={async () => {
                      'use server';
                      await changeStatusAction(order.id, nextStatus);
                    }}
                  >
                    <button
                      type="submit"
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        nextStatus === 'CANCELLED'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      Αλλαγή σε {nextStatus}
                    </button>
                  </form>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Δεν υπάρχουν διαθέσιμες ενέργειες για αυτήν την κατάσταση.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
