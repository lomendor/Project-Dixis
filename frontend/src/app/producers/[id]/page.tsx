'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function ProducerPage({ params }:{ params:{ id:string } }){
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(){
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000';
      const r = await fetch(`${base}/api/producers/${params.id}`, { cache:'no-store' });
      if(r.ok) setP(await r.json());
      setLoading(false);
    }
    load();
  }, [params.id]);

  if(loading) return <main style={{padding:'16px'}}><p>Φόρτωση...</p></main>;
  if(!p) return <main style={{padding:'16px'}}><h1>Παραγωγός</h1><p>Δεν βρέθηκε.</p><Link href="/producers">← Πίσω στη λίστα</Link></main>;

  return (
    <main style={{padding:'16px', maxWidth:960, margin:'0 auto'}}>
      <nav style={{marginBottom:12}}><Link href="/producers">← Πίσω στη λίστα</Link></nav>

      {p.imageUrl ? (
        // LCP-friendly hero
        <img src={p.imageUrl} alt={p.name} fetchPriority="high" style={{width:'100%',height:320,objectFit:'cover',borderRadius:16}} />
      ) : (
        <div style={{width:'100%',height:320,background:'#f3f4f6',borderRadius:16,display:'grid',placeItems:'center'}}>Χωρίς εικόνα</div>
      )}

      <header style={{marginTop:16}}>
        <h1 style={{margin:'8px 0'}}>{p.name}</h1>
        <p style={{color:'#6b7280'}}>
          {p.region} · {p.category} · {typeof p.products==='number'? `${p.products} προϊόντα` : ''}
          {typeof p.rating==='number' ? ` · ★ ${p.rating.toFixed(1)}` : ''}
        </p>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          {p.phone && <a className="btn btn-primary" href={`tel:${p.phone}`} aria-label="Τηλέφωνο επικοινωνίας">Κλήση</a>}
          <button className="btn" onClick={async ()=>{
            const url = typeof window !== 'undefined' ? window.location.href : '';
            if (navigator.share){ try{ await navigator.share({title:p.name, url}); } catch{} }
            else { await navigator.clipboard.writeText(url); alert('Ο σύνδεσμος αντιγράφηκε.'); }
          }}>Κοινοποίηση</button>
        </div>
      </header>

      {p.description && <section style={{marginTop:16, lineHeight:1.6}}><p>{p.description}</p></section>}
    </main>
  );
}
