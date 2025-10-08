export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Νέο Προϊόν | Admin — Dixis' };

export default async function Page() {
  await requireAdmin?.();

  async function create(formData: FormData) {
    'use server';
    await requireAdmin?.();

    // Get or create default producer for admin-created products
    let producer = await prisma.producer.findFirst({
      where: { slug: 'admin-default' }
    });

    if (!producer) {
      producer = await prisma.producer.create({
        data: {
          slug: 'admin-default',
          name: 'Admin',
          region: 'System',
          category: 'System',
          isActive: true
        }
      });
    }

    const data: any = {
      title: String(formData.get('title') || '').trim(),
      category: String(formData.get('category') || '').trim(),
      unit: String(formData.get('unit') || 'τεμ'),
      price: Number(formData.get('price') || 0),
      stock: Number(formData.get('stock') || 0),
      isActive: formData.get('isActive') === 'on',
      imageUrl: String(formData.get('imageUrl') || '').trim() || null,
      description: String(formData.get('description') || '').trim() || null,
      producerId: producer.id
    };

    await prisma.product.create({ data });
    redirect('/admin/products');
  }

  return (
    <main style={{ display: 'grid', gap: 12, padding: 16, maxWidth: 600 }}>
      <h1>Νέο προϊόν</h1>
      <form action={create} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="title">Τίτλος *</label>
          <input
            id="title"
            name="title"
            placeholder="Τίτλος"
            required
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="category">Κατηγορία</label>
          <input
            id="category"
            name="category"
            placeholder="Κατηγορία"
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <label htmlFor="price">Τιμή *</label>
            <input
              id="price"
              name="price"
              placeholder="Τιμή"
              type="number"
              step="0.01"
              required
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <label htmlFor="unit">Μονάδα</label>
            <input
              id="unit"
              name="unit"
              placeholder="π.χ. τεμ, kg, lt"
              defaultValue="τεμ"
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="stock">Απόθεμα *</label>
          <input
            id="stock"
            name="stock"
            placeholder="Απόθεμα"
            type="number"
            required
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="imageUrl">Εικόνα (URL)</label>
          <input
            id="imageUrl"
            name="imageUrl"
            placeholder="https://example.com/image.jpg ή /uploads/..."
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
          <small style={{ opacity: 0.7 }}>Χρησιμοποιήστε το /api/uploads για ανέβασμα αρχείων</small>
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label htmlFor="description">Περιγραφή</label>
          <textarea
            id="description"
            name="description"
            placeholder="Περιγραφή προϊόντος..."
            rows={4}
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, fontFamily: 'inherit' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="isActive" defaultChecked />
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
