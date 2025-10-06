'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Line = {
  productId:string;
  qty:number;
  title?:string;
  price?:number;
  unit?:string;
  imageUrl?:string;
  producerId?:string;
  stock?:number
};

export default function CartPage(){
  const [lines,setLines]=useState<Line[]>([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);
  const [ship,setShip]=useState({name:'',line1:'',city:'',postal:''});
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{ (async()=>{
    const raw = JSON.parse(localStorage.getItem('dixis_cart')||'[]') as Line[];
    if(raw.length===0){ setLines([]); setLoading(false); return; }
    // εμπλουτισμός με τίτλο/τιμή
    const enriched: Line[] = [];
    for(const ln of raw){
      const r = await fetch(`/api/products/${ln.productId}`).catch(():null=>null);
      if(r && r.ok){
        const p = await r.json();
        enriched.push({
          ...ln,
          title:p.title,
          price: Number(p.price||0),
          unit: p.unit||'',
          imageUrl:p.imageUrl||'',
          producerId:p.producerId,
          stock:p.stock
        });
      } else {
        enriched.push(ln);
      }
    }
    setLines(enriched);
    setLoading(false);
  })(); },[]);

  const total = lines.reduce((s,l)=> s + (Number(l.price||0)*l.qty), 0);

  function updateQty(id:string, v:number){
    const next = lines.map(l=> {
      if(l.productId===id){
        const max = typeof l.stock==='number'? l.stock : 999;
        return {...l, qty: Math.max(1, Math.min(v, max))};
      }
      return l;
    });
    setLines(next);
    localStorage.setItem('dixis_cart', JSON.stringify(next.map(({title,price,unit,imageUrl,producerId,stock,...r})=>r)));
  }

  const hasOverstock = lines.some(l=> typeof l.stock==='number' && l.qty > l.stock);

  async function checkout(){
    setErr(null);
    if(!ship.name || !ship.line1 || !ship.city || !ship.postal){
      setErr('Συμπληρώστε στοιχεία αποστολής');
      return;
    }
    if(lines.length===0){ setErr('Το καλάθι είναι άδειο'); return; }
    if(hasOverstock){ setErr('Ποσότητα μεγαλύτερη από το διαθέσιμο απόθεμα'); return; }

    setSubmitting(true);
    const body = {
      items: lines.map(l=>({productId:l.productId, qty:l.qty})),
      shipping: ship
    };
    try {
      const r = await fetch('/api/checkout',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      if(r.status===401){
        window.location.href = '/join?next=/cart-simple';
        return;
      }
      const j = await r.json();
      if(!r.ok){ setErr(j?.error || 'Σφάλμα παραγγελίας'); setSubmitting(false); return; }
      localStorage.removeItem('dixis_cart');
      window.location.href = '/orders-simple/'+j.orderId;
    } catch {
      setErr('Σφάλμα σύνδεσης');
      setSubmitting(false);
    }
  }

  if(loading) return <main style={{padding:16}}><p>Φόρτωση…</p></main>;
  return (<main style={{padding:16}}>
    <h1>Καλάθι</h1>
    {lines.length===0 ? <p>Το καλάθι είναι άδειο.</p> : (
      <ul style={{
        listStyle:'none',
        padding:0,
        display:'grid',
        gap:12,
        gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'
      }}>
        {lines.map(l=>{
          const isOverstock = typeof l.stock==='number' && l.qty > l.stock;
          return (
          <li key={l.productId} className="card" style={{padding:12}}>
            {l.imageUrl && <img src={l.imageUrl} alt={l.title||''} style={{width:'100%',height:120,objectFit:'cover',borderRadius:8}}/>}
            <strong>{l.title||l.productId}</strong>
            <div style={{color:'#6b7280'}}>
              {typeof l.price==='number'? `${l.price.toFixed(2)}${l.unit? ' / '+l.unit:''}`: ''}
            </div>
            {typeof l.stock==='number' && (
              <div style={{fontSize:14,color: isOverstock?'#b91c1c':'#059669',marginTop:4}}>
                {isOverstock? 'Υπέρβαση αποθέματος': `Διαθέσιμο: ${l.stock}`}
              </div>
            )}
            <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
              <input
                type="number"
                min={1}
                max={typeof l.stock==='number'? l.stock : undefined}
                value={l.qty}
                onChange={e=>updateQty(l.productId, Number(e.target.value||1))}
                style={{width:72}}
              />
              <button className="btn" onClick={()=>{ updateQty(l.productId, l.qty+1); }}>+1</button>
            </div>
          </li>
        )})}
      </ul>
    )}
    <section style={{marginTop:16, display:'grid', gap:8, maxWidth:520}}>
      <h2>Στοιχεία αποστολής</h2>
      <label>
        Ονοματεπώνυμο
        <input value={ship.name} onChange={e=>setShip({...ship,name:e.target.value})} required/>
      </label>
      <label>
        Διεύθυνση
        <input value={ship.line1} onChange={e=>setShip({...ship,line1:e.target.value})} required/>
      </label>
      <label>
        Πόλη
        <input value={ship.city} onChange={e=>setShip({...ship,city:e.target.value})} required/>
      </label>
      <label>
        Τ.Κ.
        <input value={ship.postal} onChange={e=>setShip({...ship,postal:e.target.value})} required/>
      </label>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <strong>Σύνολο: € {total.toFixed(2)}</strong>
        <button
          className="btn btn-primary"
          onClick={checkout}
          disabled={submitting || hasOverstock || lines.length===0}
        >
          {submitting? 'Προετοιμασία…' : 'Ολοκλήρωση παραγγελίας'}
        </button>
      </div>
      {err && <p style={{color:'#b91c1c'}}>{err}</p>}
    </section>
  </main>);
}
