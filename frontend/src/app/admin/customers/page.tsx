export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { requireAdmin, AdminError } from '@/lib/auth/admin';

/**
 * Pass ADMIN-CUSTOMERS-01: Customer management page.
 *
 * Aggregates customer data from orders — no separate customers table needed.
 * Groups by email, shows order count, total spent, last order date.
 */

interface CustomerRow {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date;
}

export default async function AdminCustomersPage() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      redirect('/auth/admin-login?from=/admin/customers');
    }
    throw e;
  }

  // Aggregate customer data from orders
  const orders = await prisma.order.findMany({
    select: {
      email: true,
      name: true,
      buyerName: true,
      phone: true,
      buyerPhone: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by email (primary) or phone (fallback)
  const customerMap = new Map<string, CustomerRow>();

  for (const order of orders) {
    const key = order.email || order.phone || order.buyerPhone || 'unknown';
    if (key === 'unknown') continue;

    const existing = customerMap.get(key);
    const orderName = order.name || order.buyerName || '';
    const orderPhone = order.phone || order.buyerPhone || '';

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += Number(order.total ?? 0);
      // Keep the most recent name/phone
      if (!existing.name && orderName) existing.name = orderName;
      if (!existing.phone && orderPhone) existing.phone = orderPhone;
    } else {
      customerMap.set(key, {
        email: order.email || '',
        name: orderName,
        phone: orderPhone,
        orderCount: 1,
        totalSpent: Number(order.total ?? 0),
        lastOrderAt: order.createdAt,
      });
    }
  }

  // Sort by total spent descending
  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);

  const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="space-y-6" data-testid="admin-customers-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Πελάτες</h1>
        <span className="text-sm text-neutral-500">
          {customers.length} πελάτες
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200" data-testid="customers-table">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Πελάτης
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Τηλέφωνο
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Παραγγελίες
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Σύνολο
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Τελευταία
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-400 text-sm">
                  Δεν υπάρχουν πελάτες ακόμα.
                </td>
              </tr>
            ) : (
              customers.map((customer, i) => (
                <tr key={customer.email || customer.phone || i} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                    {customer.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {customer.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {customer.phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900 text-right font-medium">
                    {customer.orderCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900 text-right font-medium">
                    {fmtMoney(customer.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {fmtDate(customer.lastOrderAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-50 rounded-lg p-4 text-xs text-neutral-500">
        <strong>Σημείωση:</strong> Τα δεδομένα πελατών συλλέγονται από τις παραγγελίες.
        Ομαδοποίηση κατά email ή τηλέφωνο.
      </div>
    </div>
  );
}
