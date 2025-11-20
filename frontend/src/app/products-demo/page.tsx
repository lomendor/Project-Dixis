'use client';
import { useEffect, useState } from 'react';

type Product = { id:string; title:string; priceCents:number; image:string; producer:string };

export default function ProductsDemo() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/demo/products.json')
      .then(r => { if(!r.ok) throw new Error('demo json'); return r.json(); })
      .then(setItems)
      .catch(() => setErr('Δεν βρέθηκαν demo δεδομένα.'));
  }, []);

  return (
    <main style={{maxWidth: '1200px', margin:'0 auto', padding:'16px'}}>
      <h1 style={{fontSize:'1.75rem', fontWeight:700, margin:'8px 0'}}>Products (Demo)</h1>
      <p style={{opacity:0.7, marginBottom: '12px'}}>
        Σελίδα επίδειξης: σταθερό grid προϊόντων χωρίς καμία επίδραση στο production backend.
      </p>
      {err && <div style={{color:'#b00020', margin:'8px 0'}}>{err}</div>}

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))',
        gap:'16px'
      }}>
        {items.map(p => (
          <article key={p.id} style={{
            border:'1px solid #e5e7eb',
            borderRadius:'10px',
            overflow:'hidden',
            display:'flex',
            flexDirection:'column',
            background:'#fff'
          }}>
            <div style={{aspectRatio:'3/2', background:'#f5f5f5'}}>
              <img src={p.image} alt={p.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
            </div>
            <div style={{padding:'12px'}}>
              <h2 style={{fontSize:'1rem', fontWeight:600, margin:'0 0 6px'}}>{p.title}</h2>
              <div style={{fontSize:'.9rem', opacity:.8, marginBottom:'6px'}}>Παραγωγός: {p.producer}</div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{fontWeight:700}}>
                  {(p.priceCents/100).toLocaleString('el-GR', { style:'currency', currency:'EUR' })}
                </span>
                <button style={{
                  padding:'6px 10px', border:'1px solid #111827', borderRadius:'8px', background:'#111827', color:'#fff', cursor:'pointer'
                }}
                  onClick={() => alert('Demo only')}>
                  Προσθήκη
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!items.length && !err && (
        <div style={{marginTop:'12px', opacity:.7}}>Φόρτωση…</div>
      )}
    </main>
  );
}
