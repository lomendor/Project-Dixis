import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/producer';
import { resolveProducerIdStrict } from '@/lib/auth/resolve-producer';

export const metadata = { title: 'Οι Παραγγελίες μου | Dixis' };
export const dynamic = 'force-dynamic'; // Prevent static generation

export default async function MyOrdersPage(){
  await requireProducer();

  const producerId = await resolveProducerIdStrict();
  if (!producerId) {
    return (
      <main style={{padding:'2rem'}}>
        <h1>Οι Παραγγελίες μου</h1>
        <p style={{color:'#b00'}}>Δεν υπάρχει αντιστοίχιση παραγωγού για τον λογαριασμό σας.</p>
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            producerId
          }
        }
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const fmt = (n:number) => new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' }).format(n);
  const fmtDate = (d:Date) => new Intl.DateTimeFormat('el-GR', {
    year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'
  }).format(new Date(d));

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Οι Παραγγελίες μου</h1>

      <div className="space-y-6">
        {orders.map(order => {
          const total = (order.items||[]).reduce((sum:number, i:any) =>
            sum + (Number(i.price||0) * Number(i.qty||0)), 0);

          const statusColors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PACKING: 'bg-blue-100 text-blue-800',
            SHIPPED: 'bg-purple-100 text-purple-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
          };
          const statusLabels = {
            PENDING: 'Εκκρεμεί',
            PACKING: 'Συσκευασία',
            SHIPPED: 'Εστάλη',
            DELIVERED: 'Παραδόθηκε',
            CANCELLED: 'Ακυρώθηκε'
          };

          return (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Παραγγελία #{order.id}</h2>
                  <p className="text-gray-600 text-sm">{fmtDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Προϊόντα μου σε αυτή την παραγγελία:</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Προϊόν</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Ποσότητα</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Τιμή</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Σύνολο</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(order.items||[]).map((item:any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">{item.titleSnap || item.product?.title || '-'}</td>
                          <td className="px-4 py-2">{item.qty || 0}</td>
                          <td className="px-4 py-2">{fmt(Number(item.price||0))}</td>
                          <td className="px-4 py-2 font-medium">{fmt(Number(item.price||0) * Number(item.qty||0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Πελάτης:</span> {order.buyerName || '-'}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Σύνολο Παραγγελίας</p>
                  <p className="text-2xl font-bold text-green-600">{fmt(total)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">Δεν υπάρχουν παραγγελίες με τα προϊόντα σας.</p>
        </div>
      )}
    </main>
  );
}
