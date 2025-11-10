'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage(){
  const [form,setForm]=useState({email:'',name:'',phone:'',address:'',city:'',zip:'',zone:'mainland'});
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState<string|undefined>();
  const router = useRouter();

  const place = async (e: any) => {
    e.preventDefault();
    setErr(undefined); setBusy(true);
    try {
      const cart = await fetch('/api/cart', { cache:'no-store' }).then(r=>r.json());
      const items = (cart.items ?? []).map((i:any)=>({ slug:i.slug, qty:i.qty || 1 }));
      if (!items.length) { setErr('Το καλάθι είναι άδειο'); return; }
      const r = await fetch('/api/checkout',{ method:'POST', headers:{'Content-Type':'application/json','x-idempotency-key':crypto.randomUUID()}, body: JSON.stringify({ customer:form, items, zone: form.zone })});
      if (!r.ok){ const j=await r.json().catch(()=>({})); throw new Error(j?.error || 'Αποτυχία παραγγελίας');}
      const { orderId } = await r.json();
      router.push(`/checkout/success?order=${orderId}`);
    } catch(e:any){ setErr(e.message || 'Σφάλμα'); }
    finally{ setBusy(false); }
  };

  const on = (k: string) => (e:any)=> setForm(s=>({...s,[k]:e.target.value}));

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Ολοκλήρωση Παραγγελίας</h1>
      <form onSubmit={place} className="grid gap-3">
        {err ? <p className="text-red-600" data-testid="checkout-error">{err}</p> : null}
        <input className="border rounded p-2" placeholder="Email *" value={form.email} onChange={on('email')} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Ονοματεπώνυμο" value={form.name} onChange={on('name')} />
          <input className="border rounded p-2" placeholder="Τηλέφωνο" value={form.phone} onChange={on('phone')} />
        </div>
        <input className="border rounded p-2" placeholder="Διεύθυνση" value={form.address} onChange={on('address')} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Πόλη" value={form.city} onChange={on('city')} />
          <input className="border rounded p-2" placeholder="ΤΚ" value={form.zip} onChange={on('zip')} />
          <select className="border rounded p-2" value={form.zone} onChange={on('zone')} aria-label="Ζώνη">
            <option value="mainland">Ηπειρωτική Ελλάδα</option>
            <option value="islands">Νησιά</option>
          </select>
        </div>
        <button type="submit" disabled={busy} className="mt-2 px-4 py-2 border rounded">{busy?'Καταχώριση…':'Καταχώριση παραγγελίας'}</button>
      </form>
    </main>
  );
}
