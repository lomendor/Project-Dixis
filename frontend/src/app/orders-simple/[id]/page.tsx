'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

async function copyToClipboard(text: string): Promise<boolean>{
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-10000px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function OrderPage({ params }:{ params:{ id:string } }){
  const [order,setOrder]=useState<any>(null);
  const [err,setErr]=useState<string|null>(null);

  useEffect(()=>{ (async()=>{
    try{
      const r = await fetch('/api/me/orders');
      const j = await r.json();
      if(!r.ok){ setErr('Απαιτείται σύνδεση.'); return; }
      const o = (j.items||[]).find((x:any)=>x.id===params.id);
      if(!o){ setErr('Δεν βρέθηκε παραγγελία.'); return; }
      setOrder(o);
    }catch{
      setErr('Σφάλμα.');
    }
  })(); },[params.id]);

  if(err) return <main style={{padding:16}}>
    <p>{err}</p>
    <Link className="btn" href="/join">Σύνδεση</Link>
  </main>;

  if(!order) return <main style={{padding:16}}><p>Φόρτωση…</p></main>;

  const total = Number(order.total||0);

  return (<main style={{padding:16, maxWidth:720, margin:'0 auto'}}>
    <h1>Η παραγγελία σας</h1>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
      <p style={{margin:0}}>Κωδικός: <code>{order.id}</code> · Σύνολο: € {total.toFixed(2)}</p>
      <button className="btn" onClick={async ()=>{
        const ok = await copyToClipboard(order.id);
        alert(ok ? 'Ο κωδικός αντιγράφηκε.' : 'Αποτυχία αντιγραφής.');
      }}>Αντιγραφή κωδικού</button>
    </div>
    <h2>Προϊόντα</h2>
    <ul style={{listStyle:'none',padding:0}}>
      {order.items.map((it:any)=>(
        <li key={it.id} className="card" style={{padding:12, marginBottom:8}}>
          <strong>{it.titleSnap}</strong> — {it.qty} × € {Number(it.priceSnap).toFixed(2)} = € {Number(it.subtotal).toFixed(2)}
        </li>
      ))}
    </ul>
    <div style={{display:'flex',gap:8,marginTop:16}}>
      <a className="btn" href="/my/orders">Οι παραγγελίες μου</a>
      <a className="btn" href="/producers">Συνέχεια αγορών</a>
    </div>
  </main>);
}
