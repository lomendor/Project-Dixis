'use client';
import { useCart } from '@/lib/cart/context';
import { calc, fmt } from '@/lib/checkout/totals';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Page(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const err = searchParams?.get('err');
  const { items, clear } = useCart();
  const [loading, setLoading] = useState(false);

  const lines = items.map(i=>({ price:Number(i.price||0), qty:Number(i.qty||0) }));
  const totals = calc(lines);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name  = String(formData.get('name')||'').trim();
    const phone = String(formData.get('phone')||'').trim();
    const email = String(formData.get('email')||'').trim();
    const line1 = String(formData.get('line1')||'').trim();
    const city  = String(formData.get('city')||'').trim();
    const postal= String(formData.get('postal')||'').trim();

    if(!items.length){ router.push('/cart'); return; }
    if(!name || !phone || !line1 || !city || !postal){
      router.push('/checkout?err=missing');
      return;
    }

    setLoading(true);
    try{
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';
      const res = await fetch(`${base}/api/checkout`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          items: items.map(i=>({ productId: i.productId, qty: i.qty })),
          shipping: { name, phone, email, line1, city, postal },
          payment: { method:'COD' }
        })
      });

      if(!res.ok){
        router.push('/checkout?err=submit');
        return;
      }

      const body = await res.json();
      const orderId = body.orderId || body.id || '';
      clear();
      router.push(`/thank-you?orderId=${encodeURIComponent(orderId)}`);
    }catch(e){
      router.push('/checkout?err=submit');
    }finally{
      setLoading(false);
    }
  }

  return (
    <main style={{display:'grid',gap:16,padding:16,maxWidth:1200,margin:'0 auto'}}>
      <h1>Ολοκλήρωση Παραγγελίας</h1>
      {!items.length ? (
        <div style={{opacity:.7}}>Το καλάθι είναι άδειο. <a href="/products">Δες προϊόντα</a></div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:16,alignItems:'start'}}>
          <form onSubmit={handleSubmit} style={{display:'grid',gap:12}}>
            <h2>Στοιχεία Αποστολής</h2>
            <input name="name" placeholder="Ονοματεπώνυμο" required style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:4}} />
            <input name="phone" placeholder="+30…" required style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:4}} />
            <input name="email" type="email" placeholder="email (προαιρετικό)" style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:4}} />
            <input name="line1" placeholder="Διεύθυνση" required style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:4}} />
            <div style={{display:'grid',gridTemplateColumns:'1fr 160px',gap:8}}>
              <input name="city" placeholder="Πόλη" required style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:4}} />
              <input name="postal" placeholder="Τ.Κ." required style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:4}} />
            </div>
            <button type="submit" disabled={loading} style={{padding:'12px 24px',backgroundColor:loading?'#ccc':'#0070f3',color:'white',border:'none',borderRadius:6,fontSize:16,fontWeight:'bold',cursor:loading?'not-allowed':'pointer'}}>
              {loading ? 'Υποβολή...' : 'Ολοκλήρωση Παραγγελίας'}
            </button>
            {err && <p style={{color:'crimson',margin:0}}>Σφάλμα: {err === 'missing' ? 'Συμπληρώστε όλα τα πεδία' : 'Αποτυχία υποβολής'}</p>}
          </form>

          <aside style={{border:'1px solid #eee',borderRadius:8,padding:16,backgroundColor:'#f8f9fa'}}>
            <h3 style={{margin:'0 0 12px 0'}}>Σύνοψη Παραγγελίας</h3>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 16px 0'}}>
              {items.map(it=>(
                <li key={it.productId} style={{display:'flex',justifyContent:'space-between',gap:8,padding:'6px 0'}}>
                  <span>{it.title} × {it.qty}</span>
                  <span>{fmt(Number(it.price)*Number(it.qty))}</span>
                </li>
              ))}
            </ul>
            <hr style={{border:'none',borderTop:'1px solid #ddd',margin:'12px 0'}}/>
            <div style={{display:'grid',gap:8}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>Υποσύνολο</span><b>{fmt(totals.subtotal)}</b></div>
              <div style={{display:'flex',justifyContent:'space-between',opacity:.8,fontSize:14}}><span>ΦΠΑ ({(totals.rate*100).toFixed(0)}%)</span><span>{fmt(totals.vat)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',opacity:.8,fontSize:14}}><span>Μεταφορικά</span><span>{totals.shipping === 0 ? 'Δωρεάν' : fmt(totals.shipping)}</span></div>
              <hr style={{border:'none',borderTop:'1px solid #ddd',margin:'8px 0'}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:20,fontWeight:'bold'}}><span>Σύνολο</span><span>{fmt(totals.total)}</span></div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
