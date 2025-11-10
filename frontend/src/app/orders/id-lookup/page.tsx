'use client';
import { useState } from 'react';

export default function OrdersIdLookupPage(){
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|undefined>();
  const [res, setRes] = useState<any>(null);

  const onSubmit = async (e: any) => {
    e.preventDefault(); setErr(undefined); setRes(null); setBusy(true);
    try{
      const r = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, orderId })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Αποτυχία αναζήτησης');
      setRes(j);
    }catch(e:any){ setErr(e.message || 'Σφάλμα'); }
    finally{ setBusy(false); }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Αναζήτηση Παραγγελίας</h1>
      <form onSubmit={onSubmit} className="grid gap-3 mb-6">
        {err ? <p className="text-red-600" data-testid="lookup-error">{err}</p> : null}
        <input className="border rounded p-2" placeholder="Email *" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Κωδικός παραγγελίας *" value={orderId} onChange={e=>setOrderId(e.target.value)} required />
        <button disabled={busy} className="px-4 py-2 border rounded">{busy?'Αναζήτηση…':'Αναζήτηση'}</button>
      </form>

      {res ? (
        <section className="border rounded p-4" data-testid="lookup-result">
          <p className="text-sm">Κωδικός: <strong>{res.id}</strong></p>
          <p className="text-sm">Σύνολο: <strong>{Number(res.total).toFixed(2)} {res.currency}</strong></p>
          <h2 className="mt-4 font-semibold">Είδη</h2>
          <ul className="list-disc ml-5 text-sm">
            {res.items?.map((it:any)=>(
              <li key={it.id}>{it.slug} × {it.qty} — {Number(it.price).toFixed(2)} {it.currency}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
