'use client'
export default function StatusBadge({ status }: { status?: string }){
  const s = String(status||'').toUpperCase()
  const map:any = {
    PAID:'#2563eb', PACKING:'#a16207', SHIPPED:'#1d4ed8', DELIVERED:'#16a34a', CANCELLED:'#dc2626'
  }
  const bg = map[s] || '#6b7280'
  const label:any = {
    PAID:'Πληρωμή', PACKING:'Συσκευασία', SHIPPED:'Απεστάλη', DELIVERED:'Παραδόθηκε', CANCELLED:'Ακυρώθηκε'
  }[s] || s
  return <span style={{background:bg,color:'#fff',padding:'4px 8px',borderRadius:999,fontSize:12}}>{label}</span>
}
