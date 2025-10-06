'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import HeaderClient from './Header.client';

export const dynamic = 'force-dynamic';

export default function ProducerPage({ params }:{ params:{ id:string } }){
  const [p, setP] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(){
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000';
      const r = await fetch(`${base}/api/producers/${params.id}`, { cache:'no-store' });
      if(r.ok){
        const producer = await r.json();
        setP(producer);
        // Φόρτωση προϊόντων του παραγωγού
        const pr = await fetch(`${base}/api/products?producerId=${params.id}`, { cache:'no-store' });
        if(pr.ok){
          const pj = await pr.json();
          setProducts(pj.items || []);
        }
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if(loading) return <main style={{padding:'16px'}}><p>Φόρτωση...</p></main>;
  if(!p) return <main style={{padding:'16px'}}><h1>Παραγωγός</h1><p>Δεν βρέθηκε.</p><Link href="/producers">← Πίσω στη λίστα</Link></main>;

  return (
    <main style={{padding:'16px', maxWidth:960, margin:'0 auto'}}>
      <nav style={{marginBottom:12}}><Link href="/producers">← Πίσω στη λίστα</Link></nav>

      {/* Client header with reliable share/copy */}
      <HeaderClient p={p}/>

      <section style={{marginTop:24}}>
        <h2>Προϊόντα ({products.length})</h2>
        {products.length === 0 ? (
          <p style={{color:'#6b7280'}}>Δεν υπάρχουν προϊόντα προς το παρόν.</p>
        ) : (
          <ul style={{
            listStyle:'none',
            padding:0,
            display:'grid',
            gap:16,
            gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',
            marginTop:12
          }}>
            {products.map((prod:any)=>(
              <li key={prod.id} className="card" style={{padding:12}}>
                {prod.imageUrl && <img src={prod.imageUrl} alt={prod.title} style={{width:'100%',height:120,objectFit:'cover',borderRadius:8}}/>}
                <strong>{prod.title}</strong>
                <div style={{color:'#6b7280',fontSize:14}}>
                  {prod.category}
                  {typeof prod.price==='number' ? ` · ${Number(prod.price).toFixed(2)}${prod.unit? ' / '+prod.unit:''}` : ''}
                </div>
                {prod.stock > 0 && <div style={{fontSize:12,color:'#059669',marginTop:4}}>Διαθέσιμο: {prod.stock}</div>}
                <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
                  <input type="number" min={1} defaultValue={1} style={{width:72}} id={'qty-'+prod.id}/>
                  <button className="btn btn-primary" onClick={()=>{
                    const el = document.getElementById('qty-'+prod.id) as HTMLInputElement|null;
                    const qty = Math.max(1, Number(el?.value||1));
                    const cart = JSON.parse(localStorage.getItem('dixis_cart')||'[]');
                    const idx = cart.findIndex((x:any)=>x.productId===prod.id);
                    if(idx>=0) cart[idx].qty += qty; else cart.push({ productId: prod.id, qty });
                    localStorage.setItem('dixis_cart', JSON.stringify(cart));
                    alert('Προστέθηκε στο καλάθι');
                  }}>Στο καλάθι</button>
                  <Link className="btn" href="/cart-simple">Προβολή καλαθιού</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
