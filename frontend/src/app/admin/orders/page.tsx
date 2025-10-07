import { prisma } from '@/lib/db/client';
import Link from 'next/link';

export const metadata = { title: 'Παραγγελίες (Admin) | Dixis' };

const statuses = ['PENDING', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

async function checkAdmin() {
  const { requireAdmin } = await import('@/lib/auth/admin');
  await requireAdmin();
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: { q?: string; status?: string; page?: string; pageSize?: string };
}) {
  await checkAdmin();

  const q = searchParams?.q?.trim() || '';
  const st = (searchParams?.status || '').toUpperCase();
  const page = Math.max(1, parseInt(String(searchParams?.page || '1'), 10) || 1);
  const envSize = Number(process.env.ADMIN_ORDERS_PAGE_SIZE || 20);
  const pageSize = Math.max(1, Math.min(200, parseInt(String(searchParams?.pageSize || envSize), 10) || envSize));

  const where: any = {};
  if (st && statuses.includes(st as any)) {
    where.status = st;
  }

  if (q) {
    where.OR = [
      { id: { contains: q } },
      { buyerName: { contains: q } },
      { buyerPhone: { contains: q } }
    ];
  }

  const totalCount = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      total: true,
      status: true,
      buyerName: true,
      buyerPhone: true
    },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Παραγγελίες (Admin)</h1>
      
      <form className="flex gap-4 mb-6">
        <input
          name="q"
          placeholder="Αναζήτηση (ID/όνομα/τηλέφωνο)"
          defaultValue={q}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          name="status"
          defaultValue={st}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Όλες</option>
          {statuses.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Φίλτρα
        </button>
      </form>

      <div className="mb-4">
        <a
          href={`/api/admin/orders.csv?q=${encodeURIComponent(q)}&status=${encodeURIComponent(st)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📥 Εξαγωγή CSV
        </a>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ημερομηνία
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Πελάτης
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Τηλέφωνο
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Σύνολο
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Κατάσταση
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    #{o.id.substring(0, 8)}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(o.createdAt).toLocaleString('el-GR')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {o.buyerName || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {o.buyerPhone || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Intl.NumberFormat('el-GR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(Number(o.total || 0))}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      o.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : o.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : o.status === 'SHIPPED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {String(o.status || 'PENDING')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <p className="text-center py-8 text-gray-500">Δεν βρέθηκαν παραγγελίες.</p>
        )}
      </div>

      <nav className="flex items-center justify-between mt-6">
        <a
          href={`?q=${encodeURIComponent(q)}&status=${encodeURIComponent(st)}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
          className={`px-4 py-2 rounded-lg ${
            page <= 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          aria-disabled={page <= 1}
        >
          « Προηγούμενη
        </a>
        <span className="text-gray-700">
          Σελίδα {page} από {Math.max(1, Math.ceil(totalCount / pageSize))} ({totalCount} συνολικά)
        </span>
        <a
          href={`?q=${encodeURIComponent(q)}&status=${encodeURIComponent(st)}&page=${page + 1}&pageSize=${pageSize}`}
          className={`px-4 py-2 rounded-lg ${
            page >= Math.ceil(totalCount / pageSize)
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          aria-disabled={page >= Math.ceil(totalCount / pageSize)}
        >
          Επόμενη »
        </a>
      </nav>
    </main>
  );
}
