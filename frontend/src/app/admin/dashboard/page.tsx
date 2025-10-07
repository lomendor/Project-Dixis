import { requireAdmin } from '@/lib/auth/admin';

export const metadata = { title: 'Dashboard (Admin) | Dixis' };

async function getStats(){
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/admin/stats`, { cache: 'no-store' });
  if(!res.ok){ throw new Error('stats fetch failed'); }
  return res.json();
}

export default async function AdminDashboardPage(){
  await requireAdmin();
  const data = await getStats();

  const fmt = (n:number)=> new Intl.NumberFormat('el-GR',{ style:'currency', currency:'EUR'}).format(n);
  const statuses = ['PENDING','PAID','PACKING','SHIPPED','DELIVERED','CANCELLED'] as const;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Πίνακας Ελέγχου</h1>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Σύνολο Παραγγελιών</div>
          <div className="text-3xl font-bold text-green-600">{data.kpis.totalOrders}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Συνολικά Έσοδα</div>
          <div className="text-3xl font-bold text-green-600">{fmt(data.kpis.revenueTotal||0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Μ.Ο. Παραγγελίας</div>
          <div className="text-3xl font-bold text-green-600">{fmt(data.kpis.avgOrder||0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Παραγγελίες Σήμερα</div>
          <div className="text-3xl font-bold text-green-600">{data.kpis.ordersToday}</div>
        </div>
      </section>

      {/* Status breakdown */}
      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Καταστάσεις Παραγγελιών</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {statuses.map(s=>(
                  <th key={s} className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {statuses.map(s=>(
                  <td key={s} className="py-3 px-4 font-semibold">
                    {data.status[s]||0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Last 14 days */}
      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Τελευταίες 14 Ημέρες</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ημερομηνία</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Παραγγελίες</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Έσοδα</th>
              </tr>
            </thead>
            <tbody>
              {data.last14d.map((d:any)=>(
                <tr key={d.date} className="border-b border-gray-100">
                  <td className="py-3 px-4">{d.date}</td>
                  <td className="py-3 px-4">{d.orders}</td>
                  <td className="py-3 px-4 font-semibold">{fmt(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top products */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Προϊόντα (30 ημέρες)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Προϊόν</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Πωλήσεις (τεμ.)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Έσοδα</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p:any, idx:number)=>(
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-gray-500 font-mono text-sm">#{idx+1}</span>
                      {p.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{p.qty}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.topProducts.length === 0 && (
          <p className="text-center py-4 text-gray-500">Δεν υπάρχουν δεδομένα</p>
        )}
      </section>
    </main>
  );
}
