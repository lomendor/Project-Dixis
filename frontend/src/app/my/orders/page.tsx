'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type OrderItem = {
  id: string;
  titleSnap: string;
  priceSnap: number;
  unitSnap?: string;
  qty: number;
  subtotal: number;
};

type Order = {
  id: string;
  status: string;
  total: number;
  shippingName: string;
  shippingLine1: string;
  shippingCity: string;
  shippingPostal: string;
  createdAt: string;
  items: OrderItem[];
};

export default function MyOrdersPage(){
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{ (async()=>{
    try{
      const r = await fetch('/api/me/orders');
      if(!r.ok){
        const j = await r.json().catch(()=>({error:'Σφάλμα φόρτωσης'}));
        setError(j.error || 'Απαιτείται σύνδεση');
        setLoading(false);
        return;
      }
      const j = await r.json();
      setOrders(j.items || []);
    }catch(e){
      setError('Σφάλμα φόρτωσης παραγγελιών');
    }
    setLoading(false);
  })(); },[]);

  if(loading) return <main style={{padding:16}}><p>Φόρτωση...</p></main>;
  if(error) return <main style={{padding:16}}><h1>Οι Παραγγελίες μου</h1><p style={{color:'#b91c1c'}}>{error}</p><Link href="/auth">Σύνδεση</Link></main>;

  return (
    <main style={{padding:16}}>
      <h1>Οι Παραγγελίες μου</h1>
      <div style={{margin:'8px 0'}}><a className="btn" href="/api/me/orders/export.csv" download>Εξαγωγή CSV</a></div>
      {orders.length === 0 ? (
        <p style={{color:'#6b7280'}}>Δεν έχετε πραγματοποιήσει παραγγελίες ακόμα.</p>
      ) : (
        <ul style={{listStyle:'none',padding:0,display:'grid',gap:16,marginTop:16}}>
          {orders.map(order=>(
            <li key={order.id} className="card" style={{padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:12}}>
                <div>
                  <strong>Παραγγελία #{order.id.slice(0,8)}</strong>
                  <div style={{color:'#6b7280',fontSize:14}}>
                    {new Date(order.createdAt).toLocaleDateString('el-GR')} · {order.status === 'PLACED' ? 'Καταχωρημένη' : order.status}
                  </div>
                </div>
                <strong style={{fontSize:18}}>€ {Number(order.total).toFixed(2)}</strong>
              </div>

              <div style={{marginBottom:12}}>
                <div style={{fontSize:14,color:'#6b7280'}}>Αποστολή σε:</div>
                <div>{order.shippingName}</div>
                <div style={{fontSize:14}}>{order.shippingLine1}, {order.shippingCity} {order.shippingPostal}</div>
              </div>

              <div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>Προϊόντα ({order.items.length})</div>
                <ul style={{listStyle:'none',padding:0,display:'grid',gap:8}}>
                  {order.items.map(item=>(
                    <li key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
                      <span>
                        {item.titleSnap} × {item.qty}
                        {item.unitSnap && <span style={{color:'#6b7280'}}> ({item.unitSnap})</span>}
                      </span>
                      <span>€ {Number(item.subtotal).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{marginTop:24}}>
        <Link href="/" className="btn">← Πίσω στην αρχική</Link>
      </div>
    </main>
  );
}
