'use client';
import { useEffect, useState } from 'react';

type P = {
  id: string;
  slug: string;
  name: string;
  region: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  products: number;
  rating?: number;
  isActive: boolean;
};

export default function AdminProducers() {
  const [items, setItems] = useState<P[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<P>>({
    slug: '',
    name: '',
    region: '',
    category: '',
    products: 0,
    isActive: true
  });

  async function load() {
    setLoading(true);
    const r = await fetch('/api/producers');
    const j = await r.json();
    setItems(j.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: any) {
    e.preventDefault();
    const payload = {
      slug: form.slug,
      name: form.name,
      region: form.region,
      category: form.category,
      description: form.description || '',
      phone: form.phone || '',
      email: form.email || '',
      products: Number(form.products || 0),
      rating: Number(form.rating || 0),
      isActive: !!form.isActive
    };
    const r = await fetch('/api/producers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (r.ok) {
      setForm({ slug: '', name: '', region: '', category: '', products: 0, isActive: true });
      load();
    } else {
      alert('Σφάλμα δημιουργίας');
    }
  }

  async function update(p: P) {
    const r = await fetch('/api/producers/' + p.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    r.ok ? load() : alert('Σφάλμα ενημέρωσης');
  }

  async function remove(id: string) {
    if (!confirm('Να διαγραφεί;')) return;
    const r = await fetch('/api/producers/' + id, { method: 'DELETE' });
    r.ok ? load() : alert('Σφάλμα διαγραφής');
  }

  const filtered = items.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <main style={{ padding: '16px' }}>
      <h1>Διαχείριση Παραγωγών</h1>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'start'
        }}
      >
        <form
          onSubmit={create}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16
          }}
        >
          <h2>Νέος παραγωγός</h2>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Slug
            <input
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={form.slug || ''}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              required
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Όνομα
            <input
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Περιοχή
            <input
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={form.region || ''}
              onChange={e => setForm({ ...form, region: e.target.value })}
              required
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Κατηγορία
            <input
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={form.category || ''}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Τηλέφωνο
            <input
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={form.phone || ''}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Email
            <input
              type="email"
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={form.email || ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Προϊόντα
            <input
              type="number"
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={(form.products as any) || 0}
              onChange={e => setForm({ ...form, products: Number(e.target.value) })}
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Αποθήκευση
          </button>
        </form>
        <div>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Αναζήτηση
            <input
              style={{ display: 'block', width: '100%', marginTop: 4 }}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="π.χ. Μέλι"
            />
          </label>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
            {loading ? (
              <li>Φόρτωση…</li>
            ) : (
              filtered.map(p => (
                <li
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8
                  }}
                >
                  <span>
                    {p.name} · {p.region} · {p.category}
                  </span>
                  <span>
                    <a className="btn" href={`/producers/${p.id}`}>
                      Προβολή
                    </a>
                    <button
                      className="btn"
                      onClick={() => update({ ...p, products: (p.products || 0) + 1 })}
                    >
                      +1 προϊόν
                    </button>
                    <button className="btn" onClick={() => remove(p.id)}>
                      Διαγραφή
                    </button>
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
