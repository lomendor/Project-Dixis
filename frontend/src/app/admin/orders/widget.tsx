'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

const statuses = ['ALL','PAID','PACKING','SHIPPED','DELIVERED','CANCELLED']

export default function OrdersClient(){
  const sp = useSearchParams()
  const router = useRouter()
  const [q,setQ] = useState(sp.get('q')||'')
  const [status,setStatus] = useState((sp.get('status')||'ALL').toUpperCase())

  useEffect(()=>{ setQ(sp.get('q')||''); setStatus((sp.get('status')||'ALL').toUpperCase()) },[sp])

  function apply(partial:Record<string,string>){
    const n = new URLSearchParams(Array.from(sp.entries()))
    Object.entries(partial).forEach(([k,v])=> { v? n.set(k,v): n.delete(k) })
    n.delete('page') // reset pagination
    router.push(`/admin/orders?${n.toString()}`)
  }

  return (
    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
      <input
        placeholder="Αναζήτηση (ID, email, τηλ, όνομα)"
        value={q}
        onChange={e=>setQ(e.target.value)}
        onKeyDown={e=> e.key==='Enter' && apply({ q })}
        style={{border:'1px solid #e5e7eb',padding:'8px',borderRadius:8,minWidth:280}}
        data-testid="orders-q"
      />
      <select value={status} onChange={e=>apply({ status:e.target.value })} data-testid="orders-status"
        style={{border:'1px solid #e5e7eb',padding:'8px',borderRadius:8}}>
        {statuses.map(s=> <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={()=>apply({ q, status })} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8}}>Εφαρμογή</button>
    </div>
  )
}
