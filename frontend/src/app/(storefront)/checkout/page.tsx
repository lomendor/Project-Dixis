'use client';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    __mkOrderPayload?: (data: any) => any;
  }
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('dixis_cart_v1') || '{"items":[]}');
      setCart(Array.isArray(s.items) ? s.items : []);
    } catch {
      setCart([]);
    }
  }, []);

  const total = cart.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
  const fmt = (n: number) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <main style={{ display: 'grid', gap: 12, padding: 16, maxWidth: 600 }}>
      <h1>Ολοκλήρωση Παραγγελίας</h1>

      {cart.length === 0 && <p>Το καλάθι είναι άδειο.</p>}

      {cart.length > 0 && (
        <>
          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <h3>Περίληψη Παραγγελίας</h3>
            {cart.map((i: any) => (
              <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{i.title} × {i.qty}</span>
                <span>{fmt(Number(i.price || 0) * Number(i.qty || 0))}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8, fontWeight: 700 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Σύνολο:</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          <form data-checkout-form>
            <div style={{ display: 'grid', gap: 8 }}>
              <h3>Στοιχεία Αποστολής</h3>
              <input name="name" placeholder="Ονοματεπώνυμο *" required style={{ padding: 8 }} />
              <input name="line1" placeholder="Διεύθυνση *" required style={{ padding: 8 }} />
              <input name="city" placeholder="Πόλη *" required style={{ padding: 8 }} />
              <input name="postal" placeholder="Τ.Κ. *" required style={{ padding: 8 }} />
              <input name="phone" type="tel" placeholder="Τηλέφωνο *" required style={{ padding: 8 }} />
              <input name="email" type="email" placeholder="Email (προαιρετικό)" style={{ padding: 8 }} />
              <button type="submit" style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: 6, backgroundColor: '#4caf50', color: '#fff', fontWeight: 700 }}>
                Ολοκλήρωση Παραγγελίας
              </button>
              <div id="checkout-error" data-error style={{ color: '#b00', minHeight: 20 }}></div>
            </div>
          </form>
        </>
      )}
      <script suppressHydrationWarning dangerouslySetInnerHTML={{__html:`
(function(){
  function readCart(){
    try{ var s=JSON.parse(localStorage.getItem('dixis_cart_v1')||'{"items":[]}'); return Array.isArray(s.items)?s.items:[]; }catch{ return []; }
  }
  function itemsForApi(items){
    return items.map(function(i){ return { productId: String(i.productId||''), qty: Math.max(1, Number(i.qty||1)) }; })
                .filter(function(x){ return x.productId; });
  }
  window.__mkOrderPayload = function(form){
    var items = itemsForApi(readCart());
    return {
      items: items,
      shipping: {
        name: String(form.name||''),
        line1: String(form.line1||''),
        city: String(form.city||''),
        postal: String(form.postal||''),
        phone: String(form.phone||''),
        email: String(form.email||'')
      },
      payment: { method: 'COD' }
    };
  };
  document.addEventListener('submit', async function(e){
    var f=e.target; if(!(f && f.matches && f.matches('form[data-checkout-form]'))) return;
    e.preventDefault();
    var out=document.querySelector('[data-error]'); if(out) out.textContent='';
    try{
      var data=Object.fromEntries(new FormData(f).entries());
      var payload=window.__mkOrderPayload(data);
      if(!(payload.items&&payload.items.length)){ if(out) out.textContent='Το καλάθι είναι άδειο.'; return; }
      var res=await fetch('/api/checkout',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
      var json=await res.json();
      if(!res.ok){ if(out) out.textContent = json?.error || 'Αποτυχία παραγγελίας'; return; }
      try{ localStorage.setItem('dixis_cart_v1', JSON.stringify({items:[]})); }catch{}
      location.href = '/order/'+(json.orderId||'');
    }catch(err){ if(out) out.textContent = 'Σφάλμα δικτύου'; }
  }, { passive:false });
})();`}}/>
    </main>
  );
}

