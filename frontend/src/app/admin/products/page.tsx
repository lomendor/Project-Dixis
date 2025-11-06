import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — Προϊόντα | Dixis' };

function thr() {
  return Number.parseInt(process.env.LOW_STOCK_THRESHOLD || '3') || 3;
}

export default async function Page({
  searchParams
}: {
  searchParams?: { q?: string; active?: string; low?: string; page?: string };
}) {
  try {
    await requireAdmin?.();

  const q = (searchParams?.q || '').trim();
  const active = searchParams?.active || '';
  const low = searchParams?.low === '1';
  const page = Math.max(1, parseInt(String(searchParams?.page || '1')) || 1);
  const take = 25;

  const where: any = {};
  if (q) {
    where.title = { contains: q };
  }
  if (active === '1') where.isActive = true;
  if (active === '0') where.isActive = false;

  const total = await prisma.product.count({ where });
  const items = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * take,
    take,
    select: { id: true, title: true, stock: true, isActive: true, price: true, unit: true }
  });

  const T = thr();
  const fmt = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);

  const filtered = low ? items.filter((p: any) => Number(p.stock || 0) <= T) : items;

  return (
    <main style={{ display: 'grid', gap: 12, padding: 16 }}>
      <h1>Προϊόντα</h1>
      <form
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 8
        }}
      >
        <input name="q" placeholder="Αναζήτηση τίτλου" defaultValue={q} />
        <select name="active" defaultValue={active}>
          <option value="">Όλα</option>
          <option value="1">Ενεργά</option>
          <option value="0">Ανενεργά</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" name="low" value="1" defaultChecked={low} /> Μόνο Low Stock
        </label>
        <button type="submit">Φίλτρα</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Τίτλος</th>
            <th>Τιμή</th>
            <th>Απόθεμα</th>
            <th>Κατάσταση</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p: any) => (
            <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
              <td>
                <Link href={`/products/${p.id}`}>{p.title}</Link>
              </td>
              <td>
                {fmt(Number(p.price || 0))} / {p.unit}
              </td>
              <td>
                {String(p.stock || 0)}
                {Number(p.stock || 0) <= T && (
                  <span
                    style={{
                      marginLeft: 8,
                      padding: '2px 6px',
                      border: '1px solid #f59e0b',
                      borderRadius: 6,
                      color: '#92400e'
                    }}
                  >
                    Low
                  </span>
                )}
              </td>
              <td>{p.isActive ? 'Ενεργό' : 'Ανενεργό'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <a
          href={`?q=${encodeURIComponent(q)}&active=${encodeURIComponent(active)}&low=${low ? '1' : ''}&page=${Math.max(1, page - 1)}`}
          aria-disabled={page <= 1}
        >
          « Προηγ.
        </a>
        <span>Σελίδα {page}</span>
        <a
          href={`?q=${encodeURIComponent(q)}&active=${encodeURIComponent(active)}&low=${low ? '1' : ''}&page=${page + 1}`}
        >
          Επόμ.»
        </a>
      </nav>
    </main>
  );
  } catch {
    return (
      <main style={{ padding: 16 }}>
        <h1>Δεν επιτρέπεται</h1>
        <p>Απαιτείται σύνδεση διαχειριστή.</p>
      </main>
    );
  }
}
