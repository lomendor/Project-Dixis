import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'
import { Suspense } from 'react'
import OrdersClient from './widget'

async function fetchOrders(params: URLSearchParams){
  // Προσπάθησε να καλέσεις υπάρχον admin API
  const q = params.toString()
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/orders${q ? `?${q}`:''}`, { cache:'no-store' })
  if (!res.ok) throw new Error('Failed to load orders')
  const data = await res.json()
  return data
}

export default async function OrdersPage({ searchParams }:{ searchParams: Record<string,string|undefined> }){
  const sp = new URLSearchParams()
  for (const k of ['q','status','page']) if (searchParams[k]) sp.set(k, String(searchParams[k]))
  const data = await fetchOrders(sp)
  const items = Array.isArray(data.items)? data.items : (Array.isArray(data)? data : [])
  const page = Number(searchParams.page||1)||1
  const total = Number(data.total||items.length)
  const perPage = Number(data.perPage||20)
  const pages = Math.max(1, Math.ceil(total/perPage))
  return (
    <div style={{padding:'16px 20px'}}>
      <h1 style={{fontSize:20, marginBottom:12}}>Παραγγελίες</h1>
      <OrdersClient />
      <div style={{overflowX:'auto', marginTop:12}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left',borderBottom:'1px solid #eee'}}>
              <th style={{padding:'8px'}}>ID</th>
              <th style={{padding:'8px'}}>Ημ/νία</th>
              <th style={{padding:'8px'}}>Πελάτης</th>
              <th style={{padding:'8px'}}>Τηλέφωνο</th>
              <th style={{padding:'8px'}}>Email</th>
              <th style={{padding:'8px'}}>Status</th>
              <th style={{padding:'8px'}}>Σύνολο</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o:any)=>(
              <tr key={o.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                <td style={{padding:'8px'}}>
                  <Link href={`/admin/orders/${o.id}`} style={{textDecoration:'underline'}}>{o.id}</Link>
                </td>
                <td style={{padding:'8px'}}>{o.createdAt? new Date(o.createdAt).toLocaleString('el-GR') : '—'}</td>
                <td style={{padding:'8px'}}>{o.buyerName||'—'}</td>
                <td style={{padding:'8px'}}>{o.buyerPhone||'—'}</td>
                <td style={{padding:'8px'}}>{o.buyerEmail||'—'}</td>
                <td style={{padding:'8px'}}><StatusBadge status={o.status}/></td>
                <td style={{padding:'8px'}}>{typeof o.total==='number' ? new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(o.total) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:12,display:'flex',gap:8,alignItems:'center'}}>
        <span>Σελίδα {page}/{pages}</span>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          {page>1 && <Link href={`/admin/orders?${new URLSearchParams({...Object.fromEntries(sp), page:String(page-1)})}`}>« Προηγούμενη</Link>}
          {page<pages && <Link href={`/admin/orders?${new URLSearchParams({...Object.fromEntries(sp), page:String(page+1)})}`}>Επόμενη »</Link>}
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

