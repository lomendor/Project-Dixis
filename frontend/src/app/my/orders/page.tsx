import { prisma } from '@/lib/db/client';
import { setOrderItemStatus } from './actions/actions';

const TABS = ['PENDING', 'ACCEPTED', 'REJECTED', 'FULFILLED'] as const;
const EL: Record<string, string> = {
  PENDING: 'Εκκρεμείς',
  ACCEPTED: 'Εγκεκριμένες',
  REJECTED: 'Απορριφθείσες',
  FULFILLED: 'Ολοκληρωμένες'
};

function TabLink({
  v,
  cur
}: {
  v: (typeof TABS)[number];
  cur: string;
}) {
  const active = v === cur;
  const base = `/my/orders?tab=${v}`;
  return (
    <a
      href={base}
      className={`px-3 py-2 border rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {EL[v]}
    </a>
  );
}

export default async function Page({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const tab = (searchParams?.tab || 'PENDING').toUpperCase();
  const cur = TABS.includes(tab as any) ? tab : 'PENDING';

  const rows = await prisma.orderItem.findMany({
    where: { status: cur.toLowerCase() },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      qty: true,
      status: true,
      titleSnap: true,
      priceSnap: true,
      productId: true,
      orderId: true,
      createdAt: true
    }
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Παραγγελίες</h1>

      <nav className="flex gap-2 mb-6" role="tablist">
        {TABS.map((t) => (
          <TabLink key={t} v={t} cur={cur} />
        ))}
      </nav>

      <ul className="space-y-4">
        {rows.map((r) => (
          <li
            key={r.id}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-1">
                  {r.titleSnap || '—'}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Ποσότητα: {r.qty}</div>
                  <div>Τιμή: {r.priceSnap} €</div>
                  <div>Παραγγελία: {r.orderId}</div>
                  <div>
                    Ημερομηνία:{' '}
                    {new Date(r.createdAt).toLocaleDateString('el-GR')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {cur === 'PENDING' && (
                  <>
                    <form
                      action={async () => {
                        'use server';
                        await setOrderItemStatus(r.id, 'ACCEPTED');
                      }}
                    >
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        aria-label="Αποδοχή παραγγελίας"
                      >
                        Αποδοχή
                      </button>
                    </form>
                    <form
                      action={async () => {
                        'use server';
                        await setOrderItemStatus(r.id, 'REJECTED');
                      }}
                    >
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        aria-label="Απόρριψη παραγγελίας"
                      >
                        Απόρριψη
                      </button>
                    </form>
                  </>
                )}

                {cur === 'ACCEPTED' && (
                  <form
                    action={async () => {
                      'use server';
                      await setOrderItemStatus(r.id, 'FULFILLED');
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      aria-label="Ολοκλήρωση παραγγελίας"
                    >
                      Ολοκλήρωση
                    </button>
                  </form>
                )}
              </div>
            </div>
          </li>
        ))}

        {rows.length === 0 && (
          <li className="text-center text-gray-600 py-8">
            Δεν υπάρχουν εγγραφές.
          </li>
        )}
      </ul>
    </main>
  );
}
