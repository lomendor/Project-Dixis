export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Page({ params }: { params: { id: string } }) {
  await requireAdmin?.();

  const p = await prisma.product.findUnique({
    where: { id: String(params.id || '') },
    select: {
      id: true,
      title: true,
      category: true,
      unit: true,
      price: true,
      stock: true,
      isActive: true,
      imageUrl: true,
      description: true
    }
  });

  if (!p) return notFound();

  async function update(formData: FormData) {
    'use server';
    await requireAdmin?.();

    const data: any = {
      title: String(formData.get('title') || '').trim(),
      category: String(formData.get('category') || '').trim(),
      unit: String(formData.get('unit') || 'τεμ'),
      price: Number(formData.get('price') || 0),
      stock: Number(formData.get('stock') || 0),
      isActive: formData.get('isActive') === 'on',
      imageUrl: String(formData.get('imageUrl') || '').trim() || null,
      description: String(formData.get('description') || '').trim() || null
    };

    await prisma.product.update({ where: { id: p.id }, data });
    redirect('/admin/products');
  }

  return (
    <main style={{ display: 'grid', gap: 12, padding: 16, maxWidth: 600 }}>
      <h1>Επεξεργασία: {p.title}</h1>
      <form action={update} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="title">Τίτλος *</label>
          <input
            id="title"
            name="title"
            defaultValue={String(p.title || '')}
            required
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="category">Κατηγορία</label>
          <input
            id="category"
            name="category"
            defaultValue={String(p.category || '')}
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <label htmlFor="price">Τιμή *</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={Number(p.price || 0)}
              required
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <label htmlFor="unit">Μονάδα</label>
            <input
              id="unit"
              name="unit"
              defaultValue={String(p.unit || 'τεμ')}
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="stock">Απόθεμα *</label>
          <input
            id="stock"
            name="stock"
            type="number"
            defaultValue={Number(p.stock || 0)}
            required
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="imageUrl">Εικόνα (URL)</label>
          <input
            id="imageUrl"
            name="imageUrl"
            defaultValue={String(p.imageUrl || '')}
            placeholder="https://example.com/image.jpg ή /uploads/..."
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
          {p.imageUrl && (
            <div
              style={{
                marginTop: 8,
                padding: 8,
                background: '#fafafa',
                borderRadius: 6,
                textAlign: 'center'
              }}
            >
              <img
                src={p.imageUrl}
                alt={p.title}
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
              />
            </div>
          )}
          <small style={{ opacity: 0.7 }}>Χρησιμοποιήστε το /api/uploads για ανέβασμα αρχείων</small>
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="description">Περιγραφή</label>
          <textarea
            id="description"
            name="description"
            defaultValue={String(p.description || '')}
            placeholder="Περιγραφή προϊόντος..."
            rows={4}
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, fontFamily: 'inherit' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="isActive" defaultChecked={Boolean(p.isActive)} />
          Ενεργό
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            style={{
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: 6,
              backgroundColor: '#4caf50',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Αποθήκευση
          </button>
          <Link
            href="/admin/products"
            style={{
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: 6,
              backgroundColor: '#fff',
              textDecoration: 'none',
              color: '#333'
            }}
          >
            Ακύρωση
          </Link>
        </div>
      </form>
    </main>
  );
}
