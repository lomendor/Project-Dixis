'use client';
import * as React from 'react';
import { fmtEUR } from '@/lib/cart/totals';

export type Totals = { subtotal:number; shipping:number; codFee:number; tax:number; grandTotal:number; };

export function TotalsRow({label, value}:{label:string; value:number}){
  return (
    <div style={{display:'flex', justifyContent:'space-between', margin:'4px 0'}}>
      <span>{label}</span>
      <strong>{fmtEUR(value)}</strong>
    </div>
  );
}

export default function TotalsCard({ totals }:{ totals?:Totals }){
  if (!totals) return null;
  return (
    <section data-testid="totals-card" style={{border:'1px solid #e5e7eb', borderRadius:8, padding:12, maxWidth:360}}>
      <h3 style={{marginTop:0, marginBottom:8}}>Σύνολα</h3>
      <TotalsRow label="Υποσύνολο" value={totals.subtotal} />
      <TotalsRow label="Μεταφορικά" value={totals.shipping} />
      {totals.codFee ? <TotalsRow label="Αντικαταβολή" value={totals.codFee} /> : null}
      {totals.tax ? <TotalsRow label="Φόρος" value={totals.tax} /> : null}
      <hr style={{margin:'8px 0'}} />
      <TotalsRow label="Πληρωτέο" value={totals.grandTotal} />
    </section>
  );
}
