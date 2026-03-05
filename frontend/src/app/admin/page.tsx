export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { fetchDashboardSummary, fetchOrdersAnalytics, fetchProductsAnalytics } from '@/lib/laravel/dashboard';
import { fetchProductCounts } from '@/lib/laravel/counts';
import Link from 'next/link';

/**
 * FIX-ADMIN-DASHBOARD-DATA-01: Dashboard now reads from Laravel (SSOT).
 *
 * Previously this page queried Prisma/Neon directly, which only had stale
 * data from before the Laravel migration. Now all data comes from the
 * Laravel AnalyticsService via authenticated admin API endpoints.
 */

function formatDateStable(date: string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

function thr() { return Number.parseInt(process.env.LOW_STOCK_THRESHOLD || '3') || 3; }

export default async function Page() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      redirect('/auth/admin-login?from=/admin');
    }
    throw e;
  }

  // Fetch all data from Laravel (SSOT) in parallel
  const [summary, ordersData, productsData, productCounts] = await Promise.all([
    fetchDashboardSummary(),
    fetchOrdersAnalytics(),
    fetchProductsAnalytics(10),
    fetchProductCounts(thr()),
  ]);

  const lowStockCount = productCounts.lowStock;

  // KPI values from Laravel
  const monthOrders = summary?.month.orders ?? 0;
  const monthRevenue = summary?.month.sales ? Number(summary.month.sales) : 0;
  const pendingCount = ordersData?.summary.pending_orders ?? 0;

  // Revenue breakdown
  const rev30 = {
    total: monthRevenue,
    count: monthOrders,
    avg: summary?.month.average_order_value ?? 0,
    growth: summary?.month.sales_growth ?? 0,
  };
  const lifetimeRevenue = summary?.totals.lifetime_revenue ? Number(summary.totals.lifetime_revenue) : 0;

  // Recent orders
  const latest = ordersData?.recent_orders ?? [];

  // Top products
  const topItems = productsData?.top_products ?? [];

  const fmtMoney = (n: number) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <h1 className="text-2xl font-bold text-neutral-900">
        Πίνακας Ελέγχου
      </h1>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Παραγγελίες (μήνα)" value={String(monthOrders)} />
        <KpiCard label="Έσοδα (μήνα)" value={fmtMoney(monthRevenue)} />
        <KpiCard label="Εκκρεμείς" value={String(pendingCount)} accent={pendingCount > 0} />
        <KpiCard label={`Χαμηλό απόθεμα (\u2264 ${thr()})`} value={String(lowStockCount)} accent={lowStockCount > 0} />
      </section>

      {/* Revenue Insights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="revenue-insights">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Έσοδα · Τρέχων Μήνας
          </h3>
          <div className="text-2xl font-bold text-neutral-900 mb-1">{fmtMoney(rev30.total)}</div>
          {rev30.growth !== 0 && (
            <div className={`text-sm font-medium ${rev30.growth > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {rev30.growth > 0 ? '▲' : '▼'} {Math.abs(rev30.growth).toFixed(1)}% vs προηγ. μήνα
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-900">{rev30.count}</div>
              <div className="text-xs text-neutral-500">Παραγγελίες</div>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-900">{fmtMoney(rev30.avg)}</div>
              <div className="text-xs text-neutral-500">Μ.Ο. παραγγελίας</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Συνολικά
          </h3>
          <div className="text-2xl font-bold text-neutral-900 mb-1">{fmtMoney(lifetimeRevenue)}</div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-900">{summary?.totals.products ?? 0}</div>
              <div className="text-xs text-neutral-500">Προϊόντα</div>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-900">{summary?.totals.producers ?? 0}</div>
              <div className="text-xs text-neutral-500">Παραγωγοί</div>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-900">{summary?.totals.users ?? 0}</div>
              <div className="text-xs text-neutral-500">Χρήστες</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Ενέργειες
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <QuickAction href="/admin/orders" icon="📦" label="Παραγγελίες" />
          <QuickAction href="/admin/products" icon="🏷️" label="Προϊόντα" />
          <QuickAction href="/admin/producers" icon="🧑‍🌾" label="Παραγωγοί" />
          <QuickAction href="/admin/categories" icon="📂" label="Κατηγορίες" />
          <QuickAction href="/admin/analytics" icon="📈" label="Αναλυτικά" />
          <QuickAction href="/admin/commissions" icon="💰" label="Προμήθειες" />
        </div>
      </section>

      {/* Recent Orders Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-neutral-900">Τελευταίες παραγγελίες</h2>
          <Link href="/admin/orders" className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">
            Όλες &rarr;
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200" data-testid="recent-orders-table">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ημ/νία</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Πελάτης</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Σύνολο</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Κατάσταση</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {latest.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400 text-sm">
                    Δεν υπάρχουν παραγγελίες.
                  </td>
                </tr>
              ) : (
                latest.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/admin/orders/${o.id}`} className="text-emerald-700 hover:text-emerald-900 font-medium">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDateStable(o.created_at)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{o.user_email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-right font-medium">{fmtMoney(Number(o.total_amount || 0))}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Products Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-neutral-900">Top προϊόντα (πληρωμένα)</h2>
          <Link href="/admin/products" className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">
            Όλα &rarr;
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200" data-testid="top-products-table">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Προϊόν</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Τεμάχια</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Έσοδα</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {topItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-neutral-400 text-sm">
                    Δεν υπάρχουν δεδομένα.
                  </td>
                </tr>
              ) : (
                topItems.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-neutral-700">{t.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-right font-medium">{t.total_quantity_sold}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-right font-medium">{fmtMoney(t.total_revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* --- Sub-components --- */

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-4">
      <div className="text-xs font-medium text-neutral-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-amber-600' : 'text-neutral-900'}`}>
        {value}
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-3 bg-white rounded-lg border border-neutral-200 shadow-sm hover:border-emerald-300 hover:shadow transition-all text-sm font-medium text-neutral-700 hover:text-emerald-800"
    >
      <span className="text-lg" aria-hidden="true">{icon}</span>
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const labels: Record<string, string> = {
    pending: 'Εκκρεμής',
    confirmed: 'Επιβεβαιωμένη',
    processing: 'Σε επεξεργασία',
    shipped: 'Απεσταλμένη',
    delivered: 'Παραδοθείσα',
    cancelled: 'Ακυρωθείσα',
  };
  const cls = colors[status] || 'bg-neutral-100 text-neutral-700';

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {labels[status] || status}
    </span>
  );
}
