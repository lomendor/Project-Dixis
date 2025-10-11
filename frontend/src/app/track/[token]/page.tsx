// @ts-nocheck
import { statusLabel, shippingLabel } from '@/lib/tracking/labels'

export const metadata = {
  title: 'Παρακολούθηση παραγγελίας — Dixis',
  robots: { index:false, follow:false }
}

async function getData(token:string){
  const res = await fetch((process.env.NEXT_PUBLIC_SITE_URL||'') + '/api/public/track/' + token, { cache:'no-store' })
  if(!res.ok) return null
  return res.json()
}

export default async function TrackPage({ params }:{ params:{ token:string } }){
  const data = await getData(params.token)
  if(!data?.ok){
    return (
      <main style={{maxWidth:680, margin:'40px auto', fontFamily:'system-ui, Arial'}}>
        <h1>Παρακολούθηση παραγγελίας</h1>
        <p>Δεν βρέθηκε παραγγελία για το συγκεκριμένο token.</p>
      </main>
    )
  }
  const o = data.order
  return (
    <main style={{maxWidth:680, margin:'40px auto', fontFamily:'system-ui, Arial'}}>
      <h1>Παρακολούθηση παραγγελίας</h1>
      <section style={{padding:'12px 0'}}>
        <div><b>Κωδικός:</b> {params.token}</div>
        <div><b>Κατάσταση:</b> {statusLabel(o.status)}</div>
        <div><b>Τρόπος αποστολής:</b> {shippingLabel(o.shippingMethod)}</div>
        {typeof o.computedShipping === 'number' ? <div><b>Μεταφορικά:</b> {new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(o.computedShipping)}</div> : null}
        {typeof o.total === 'number' ? <div><b>Σύνολο:</b> {new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(o.total)}</div> : null}
        <div style={{marginTop:10, fontSize:13, color:'#666'}}>Τελευταία ενημέρωση: {new Date(o.updatedAt||o.createdAt).toLocaleString('el-GR')}</div>
      </section>
    </main>
  )
}
