'use client';
import { toast } from './toast';
import { useState } from 'react';
type Status = 'PAID'|'PACKING'|'SHIPPED'|'DELIVERED'|'CANCELLED';
const nexts:Status[] = ['PACKING','SHIPPED','DELIVERED','CANCELLED'];

export default function StatusActions({ orderId, current, onChanged }:{ orderId:string, current:Status, onChanged:(s:Status)=>void }){
  const [loading,setLoading]=useState<string|false>(false);
  async function setStatus(s:Status){
    try{
      setLoading(s);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ status:s }) });
      if(res.ok){ onChanged(s); toast(`Κατάσταση ενημερώθηκε: ${s}`); } else { toast('Αποτυχία αλλαγής κατάστασης'); }
    }finally{ setLoading(false); }
  }
  return (
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
      {nexts.map(s=>(
        <button key={s} disabled={!!loading} onClick={()=>setStatus(s)} style={{padding:'2px 8px', fontSize:12}}>
          {loading===s ? '…' : s}
        </button>
      ))}
    </div>
  );
}
