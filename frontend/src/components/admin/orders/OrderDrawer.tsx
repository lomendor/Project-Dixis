'use client';
import { useEffect, useState } from 'react';

export default function OrderDrawer({ order, onClose }:{ order:any, onClose:()=>void }){
  const [open,setOpen]=useState(!!order);
  useEffect(()=>{ setOpen(!!order); },[order]);
  if(!order || !open) return null;
  const d = new Date(order.createdAt); const date = isNaN(d.getTime())?'':d.toLocaleString('el-GR');
  return (
    <div style={{position:'fixed',top:0,right:0,width:'420px',height:'100%',background:'#fff',boxShadow:'-2px 0 12px rgba(0,0,0,.15)',padding:16,overflow:'auto',zIndex:50}}>
      <button onClick={()=>{ setOpen(false); onClose(); }} style={{float:'right'}}>✕</button>
      <h2>Παραγγελία #{order.id}</h2>
      <div><b>Ημ/νία:</b> {date}</div>
      <div><b>Πελάτης:</b> {order.buyerName||'—'} ({order.buyerPhone||'—'})</div>
      <div><b>Κατάσταση:</b> {String(order.status||'')}</div>
      <hr />
      <h3>Προϊόντα</h3>
      <ul>
        {(order.items||[]).map((it:any,idx:number)=>(
          <li key={idx}>{it.title||it.productTitle||'—'} × {it.qty||1} — €{Number(it.price||0).toFixed(2)}</li>
        ))}
      </ul>
      <hr />
      <div><b>Σύνολο:</b> € {Number(order.total||0).toFixed(2)}</div>
      <div style={{marginTop:12,fontSize:12,color:'#666'}}>Σχόλια/Διεύθυνση: {(order.shippingAddress?.line1)||'—'}</div>
    </div>
  );
}
