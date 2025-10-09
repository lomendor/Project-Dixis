'use client';
import { useEffect, useState } from 'react';

type Method = 'PICKUP'|'COURIER'|'COURIER_COD';
function fmt(n:number){ return n.toFixed(2); }

export default function ShippingSummary({ method='COURIER' as Method }){
  const [subtotal,setSubtotal] = useState<number>(0);
  const [shipping,setShipping] = useState<number>(0);
  const [total,setTotal] = useState<number>(0);

  useEffect(()=> {
    // 1) Από localStorage (γραμμένο από το e2e ή το UI του καλαθιού), 2) από query ?subtotal=, 3) 0
    const q = new URLSearchParams(window.location.search);
    const fromQuery = Number(q.get('subtotal')||'');
    const fromLS = Number(window.localStorage.getItem('cartSubtotal')||'');
    const sub = Number.isFinite(fromLS) && fromLS>0 ? fromLS :
                Number.isFinite(fromQuery) && fromQuery>0 ? fromQuery : 0;
    setSubtotal(sub);
    // Φέρε quote από API (feature-flagged στο server)
    fetch(`/api/shipping/quote?method=${method}&subtotal=${sub}`)
      .then(r=>r.json()).then(j=>{
        const ship = Number(j?.cost||0);
        setShipping(ship);
        setTotal(Number(sub + ship));
      }).catch(()=>{ setShipping(0); setTotal(sub); });
  }, [method]);

  return (
    <div style={{marginTop:16, padding:'12px 14px', border:'1px solid #eee', borderRadius:8}}>
      <div style={{fontWeight:600, marginBottom:8}}>Σύνοψη</div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span>Υποσύνολο</span><span>€ {fmt(subtotal)}</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
        <span>Μεταφορικά</span><span>€ {fmt(shipping)}</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px dashed #ddd', paddingTop:8, fontWeight:700}}>
        <span>Σύνολο</span><span>€ {fmt(total)}</span>
      </div>
      <div style={{marginTop:8, fontSize:12, color:'#666'}}>Οι χρεώσεις μεταφορικών υπολογίζονται αυτόματα με βάση τη μέθοδο αποστολής.</div>
    </div>
  );
}
