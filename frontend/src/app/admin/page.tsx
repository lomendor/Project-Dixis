export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import Link from 'next/link';

/**
 * Pass FIX-ADMIN-DASHBOARD-418-01: Deterministic date formatter for Server Components.
 * Using toISOString() slice avoids hydration mismatch from locale-dependent formatting.
 */
function formatDateStable(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

interface OrderSummary {
  id: string;
  total: number | null;
}

interface RecentOrder {
  id: string;
  createdAt: Date;
  buyerName: string | null;
  total: number | null;
  status: string | null;
}

interface TopProduct {
  titleSnap: string | null;
  _sum: { qty: number | null };
}

function thr() { return Number.parseInt(process.env.LOW_STOCK_THRESHOLD || '3') || 3; }
const T7 = 1000 * 60 * 60 * 24 * 7;
const T30 = 1000 * 60 * 60 * 24 * 30;

/**
 * Pass ADMIN-DASHBOARD-POLISH-01: Tailwind rewrite with quick actions.
 *
 * Same data queries as before — only presentation changed.
 */
export default async function Page() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      redirect('/auth/admin-login?from=/admin');
    }
    throw e;
  }

  const now = new Date();
  const from7 = new Date(now.getTime() - T7);
  const from30 = new Date(now.getTime() - T30);

  const [orders7, pendingCount, lowStockCount, latest, topItems] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: from7 } }, select: { id: true, total: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { stock: { lte: thr() } } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, createdAt: true, buyerName: true, total: true, status: true },
    }),
    prisma.orderItem.groupBy({
      by: ['titleSnap'],
      where: { createdAt: { gte: from30 } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 10,
    }).catch((): TopProduct[] => []),
  ]);

  const revenue7 = orders7.reduce((s: number, o: OrderSummary) => s + Number(o.total ?? 0), 0);
  const orders7Count = orders7.length;
  const fmtMoney = (n: number) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <h1 className="text-2xl font-bold text-neutral-900">
        Πίνακας Ελέγχου
      </h1>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Παραγγελίες (7ημ)" value={String(orders7Count)} />
        <KpiCard label="Έσοδα (7ημ)" value={fmtMoney(revenue7)} />
        <KpiCard label="Εκκρεμείς" value={String(pendingCount)} accent={pendingCount > 0} />
        <KpiCard label={`Χαμηλό απόθεμα (\u2264 ${thr()})`} value={String(lowStockCount)} accent={lowStockCount > 0} />
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
                latest.map((o: RecentOrder) => (
                  <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/admin/orders/${o.id}`} className="text-emerald-700 hover:text-emerald-900 font-medium">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDateStable(o.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{o.buyerName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-right font-medium">{fmtMoney(Number(o.total || 0))}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={String(o.status)} />
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
          <h2 className="text-lg font-semibold text-neutral-900">Top προϊόντα (30ημ)</h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(!Array.isArray(topItems) || topItems.length === 0) ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-neutral-400 text-sm">
                    Δεν υπάρχουν δεδομένα.
                  </td>
                </tr>
              ) : (
                topItems.map((t: TopProduct, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-neutral-700">{String(t.titleSnap || '—')}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-right font-medium">{Number(t._sum?.qty || 0)}</td>
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
    PENDING: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  const labels: Record<string, string> = {
    PENDING: 'Εκκρεμής',
    CONFIRMED: 'Επιβεβαιωμένη',
    SHIPPED: 'Απεσταλμένη',
    DELIVERED: 'Παραδοθείσα',
    CANCELLED: 'Ακυρωθείσα',
  };
  const cls = colors[status] || 'bg-neutral-100 text-neutral-700';

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {labels[status] || status}
    </span>
  );
}
