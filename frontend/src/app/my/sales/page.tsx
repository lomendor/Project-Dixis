'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type SaleItem = {
  id: string;
  orderId: string;
  titleSnap: string;
  qty: number;
  priceSnap: number;
  subtotal: number;
  status: string;
};

export default function MySales(){
  const [items,setItems]=useState<SaleItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);

  async function load(){
    try {
      const r = await fetch('/api/me/sales');
      const j = await r.json();
      if(!r.ok){ setErr(j?.error||'Σφάλμα φόρτωσης'); return; }
      setItems(j.items||[]);
    } catch {
      setErr('Σφάλμα σύνδεσης');
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); },[]);

  async function act(id:string, status:'ACCEPTED'|'REJECTED'|'FULFILLED'){
    try {
      const r = await fetch(`/api/me/sales/items/${id}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status })
      });
      if(!r.ok){
        const j = await r.json();
        alert(j?.error || 'Σφάλμα ενημέρωσης');
        return;
      }
      load();
    } catch {
      alert('Σφάλμα σύνδεσης');
    }
  }

  const badge = (s:string)=>({
    PLACED:'bg-gray-100 text-gray-700',
    ACCEPTED:'bg-yellow-100 text-yellow-700',
    FULFILLED:'bg-green-100 text-green-700',
    REJECTED:'bg-red-100 text-red-700',
    CANCELLED:'bg-red-100 text-red-700'
  } as any)[s]||'bg-gray-100 text-gray-700';

  if(loading) return <main style={{padding:16}}><p>Φόρτωση…</p></main>;

  return (<main style={{padding:16, maxWidth:960, margin:'0 auto'}}>
    <h1>Οι πωλήσεις μου</h1>
    {err? <p style={{color:'#b91c1c'}}>{err}</p> : items.length === 0 ? (
      <p style={{color:'#6b7280'}}>Δεν έχετε πωλήσεις προς το παρόν.</p>
    ) : (
      <ul style={{listStyle:'none',padding:0,display:'grid',gap:12,marginTop:16}}>
        {items.map(it=>(
          <li key={it.id} className="card" style={{padding:12}}>
            <div style={{marginBottom:8}}>
              <strong>{it.titleSnap}</strong>
              <div style={{color:'#6b7280',fontSize:14}}>
                Ποσότητα: {it.qty} · Υποσύνολο: € {Number(it.subtotal).toFixed(2)}
              </div>
            </div>
            <div style={{marginBottom:8}}>
              <span className={`px-2 py-1 rounded text-sm ${badge(it.status)}`}>{it.status}</span>
            </div>
            <div style={{display:'flex',gap:8}}>
              {it.status==='PLACED' && (<>
                <button className="btn btn-primary" onClick={()=>act(it.id,'ACCEPTED')}>Αποδοχή</button>
                <button className="btn" onClick={()=>act(it.id,'REJECTED')}>Απόρριψη</button>
              </>)}
              {it.status==='ACCEPTED' && (
                <button className="btn btn-primary" onClick={()=>act(it.id,'FULFILLED')}>Ολοκλήρωση</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
    <div style={{marginTop:24}}>
      <Link href="/my" className="btn">← Πίσω στον λογαριασμό</Link>
    </div>
  </main>);
}
