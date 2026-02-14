'use client'
import { useState } from 'react'
import StatusBadge from './StatusBadge'
export default function OrderActions({ id, status:initial }:{ id:string, status?:string }){
  const [status,setStatus] = useState((initial||'').toUpperCase())
  async function setS(next:string){
    if (status==='DELIVERED' || status==='CANCELLED') return; // locked terminal states
    const res = await fetch(`/api/admin/orders/${id}/status`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ status: next }) })
    if (res.ok){ setStatus(next) }
  }
  const Btn = ({id,children,disabled,onClick}:{id:string,children:any,disabled?:boolean,onClick:()=>void}) =>
    <button data-testid={id} onClick={onClick} disabled={disabled}
      style={{padding:'6px 10px',border:'1px solid #e5e7eb',borderRadius:8,opacity:disabled?0.5:1, cursor:disabled?'not-allowed':'pointer'}}>
      {children}
    </button>
  return (
    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
      <StatusBadge status={status}/>
      <Btn id="qa-packing" onClick={()=>setS('PACKING')} disabled={['PACKING','SHIPPED','DELIVERED','CANCELLED'].includes(status)}>Συσκευασία</Btn>
      <Btn id="qa-shipped" onClick={()=>setS('SHIPPED')} disabled={['SHIPPED','DELIVERED','CANCELLED'].includes(status)}>Απεστάλη</Btn>
      <Btn id="qa-delivered" onClick={()=>setS('DELIVERED')} disabled={['DELIVERED','CANCELLED'].includes(status)}>Παραδόθηκε</Btn>
      <Btn id="qa-cancelled" onClick={()=>setS('CANCELLED')} disabled={['DELIVERED','CANCELLED'].includes(status)}>Ακύρωση</Btn>
    </div>
  )
}
