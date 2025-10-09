'use client';
import { useState } from 'react';
import StatusBadge from './StatusBadge';
import OrderDrawer from './OrderDrawer';
import StatusActions from './StatusActions';

export default function OrdersTable({ rows, total, page, perPage }:{ rows:any[], total:number, page:number, perPage:number }){
  const [selected,setSelected]=useState<any|null>(null);
  const pages = Math.max(1, Math.ceil((total||0)/perPage));
  function onChanged(s:string){
    if(!selected) return;
    setSelected({...selected, status:s});
  }
  return (
    <div>
      <table style={{width:'100%', borderCollapse:'collapse', marginTop:16}}>
        <thead><tr style={{borderBottom:'2px solid #ddd'}}>
          <th style={{textAlign:'left',padding:8}}>ID</th>
          <th style={{textAlign:'left',padding:8}}>Ημ/νία</th>
          <th style={{textAlign:'left',padding:8}}>Πελάτης</th>
          <th style={{textAlign:'right',padding:8}}>Ποσό</th>
          <th style={{textAlign:'left',padding:8}}>Κατάσταση</th>
          <th style={{textAlign:'left',padding:8}}>Ενέργειες</th>
        </tr></thead>
        <tbody>
          {(rows||[]).length ? rows.map((r:any)=> {
            const d = new Date(r.createdAt); const date = isNaN(d.getTime())?'':d.toLocaleString('el-GR');
            const name = r.buyerName || '—'; const phone=r.buyerPhone||'—'; const total=(Number(r.total||0)).toFixed(2);
            return (<tr key={r.id} onClick={()=>setSelected(r)} style={{cursor:'pointer',borderBottom:'1px solid #eee'}}>
              <td style={{padding:8}}>{r.id}</td>
              <td style={{padding:8}}>{date}</td>
              <td style={{padding:8}}>{name} ({phone})</td>
              <td style={{textAlign:'right',padding:8}}>€ {total}</td>
              <td style={{padding:8}}><StatusBadge status={String(r.status||'')} /></td>
              <td style={{padding:8}}><StatusActions orderId={String(r.id)} current={String(r.status||'PAID') as any} onChanged={onChanged} /></td>
            </tr>);
          }) : <tr><td colSpan={6} style={{padding:16,textAlign:'center',opacity:0.7}}>Δεν βρέθηκαν παραγγελίες.</td></tr>}
        </tbody>
      </table>
      <div style={{marginTop:12,opacity:0.7}}>
        Σελίδα {page} / {pages}
        <div style={{marginTop:8, display:'flex', gap:8}}>
          <a href={`?page=${Math.max(1,page-1)}`}>Προηγούμενη</a>
          <a href={`?page=${Math.min(pages,page+1)}`}>Επόμενη</a>
        </div>
      </div>
      <OrderDrawer order={selected} onClose={()=>setSelected(null)} />
    </div>
  );
}
