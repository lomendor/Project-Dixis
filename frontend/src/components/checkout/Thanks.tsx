'use client';
import * as React from 'react';
export default function Thanks(){
  const [order, setOrder] = React.useState<any>(null);
  React.useEffect(()=>{
    try { const raw = sessionStorage.getItem('dixis:last-order'); if(raw) setOrder(JSON.parse(raw)); } catch {}
  },[]);
  return (
    <main>
      <h1 className="text-2xl font-bold mb-2">Ευχαριστούμε για την παραγγελία!</h1>
      {!order ? <p className="text-neutral-600">Η σύνοψη δεν είναι διαθέσιμη.</p> : (
        <div className="mt-3 border rounded-md p-3 bg-white">
          <p className="text-sm text-neutral-700">Θα επικοινωνήσουμε στο <b>{order.customer?.phone}</b>{order.customer?.email?` / ${order.customer.email}`:''}.</p>
          <ul className="text-sm mt-3 list-disc ml-5">
            {order.items.map((it:any)=> <li key={it.id}>{it.title} × {it.qty}</li>)}
          </ul>
          <p className="text-sm font-semibold mt-3">Σύνολο: {order.totals?.grand?.toFixed?.(2) ?? order.totals?.grand} EUR</p>
        </div>
      )}
    </main>
  );
}
