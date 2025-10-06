'use client';
import React from 'react';

type P = {
  id: string;
  name: string;
  region?: string;
  category?: string;
  products?: number;
  rating?: number;
  phone?: string;
  imageUrl?: string;
  description?: string;
};

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

export default function HeaderClient({ p }: { p: P }){
  async function onShare(){
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;

    if (navigator.share){
      try { await navigator.share({ title: p.name, url }); return; } catch {}
    }
    const ok = await copyToClipboard(url);
    alert(ok ? 'Ο σύνδεσμος αντιγράφηκε.' : 'Αποτυχία αντιγραφής.');
  }

  return (
    <>
      {p.imageUrl ? (
        <img src={p.imageUrl} alt={p.name} fetchPriority="high"
             style={{width:'100%',height:320,objectFit:'cover',borderRadius:16}} />
      ) : (
        <div style={{width:'100%',height:320,background:'#f3f4f6',borderRadius:16,display:'grid',placeItems:'center'}}>Χωρίς εικόνα</div>
      )}

      <header style={{marginTop:16}}>
        <h1 style={{margin:'8px 0'}}>{p.name}</h1>
        <p style={{color:'#6b7280'}}>
          {p.region || ''}{p.region && p.category ? ' · ' : ''}{p.category || ''}
          {typeof p.products==='number' ? ` · ${p.products} προϊόντα` : ''}
          {typeof p.rating==='number' ? ` · ★ ${p.rating.toFixed(1)}` : ''}
        </p>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          {p.phone && <a className="btn btn-primary" href={`tel:${p.phone}`} aria-label="Τηλέφωνο επικοινωνίας">Κλήση</a>}
          <button className="btn" onClick={onShare}>Κοινοποίηση</button>
          <button className="btn" onClick={async ()=>{
            const url = typeof window !== 'undefined' ? window.location.href : '';
            const ok = url && await copyToClipboard(url);
            alert(ok ? 'Ο σύνδεσμος αντιγράφηκε.' : 'Αποτυχία αντιγραφής.');
          }}>Αντιγραφή συνδέσμου</button>
        </div>
      </header>

      {p.description && <section style={{marginTop:16, lineHeight:1.6}}><p>{p.description}</p></section>}
    </>
  );
}
