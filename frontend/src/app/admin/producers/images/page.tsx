'use client';
import { useEffect, useState } from 'react';

type Producer = { id: string; name: string; imageUrl?: string };

export default function ImagesAdmin() {
  const [items, setItems] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/producers');
    const j = await r.json();
    setItems((j.items || []).map((x: any) => ({ id: x.id, name: x.name, imageUrl: x.imageUrl })));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(id: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);

    const up = await fetch('/api/uploads', {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });

    if (!up.ok) {
      alert('Αποτυχία upload');
      return;
    }

    const { url } = await up.json();

    const p = await fetch('/api/producers/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: url }),
      credentials: 'include',
    });

    if (!p.ok) {
      alert('Αποτυχία αποθήκευσης');
      return;
    }

    await load();
  }

  if (loading) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Εικόνες Παραγωγών</h1>
        <p>Φόρτωση...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>Εικόνες Παραγωγών</h1>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {items.map((p) => (
          <li key={p.id} className="card" style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <strong>{p.name}</strong>
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                style={{
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 12,
                  marginTop: 8,
                }}
              />
            ) : (
              <p style={{ color: '#6b7280', marginTop: 8 }}>Χωρίς εικόνα</p>
            )}
            <label style={{ display: 'block', marginTop: 8 }}>
              Μεταφόρτωση
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(p.id, f);
                }}
                style={{ display: 'block', marginTop: 4 }}
              />
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
