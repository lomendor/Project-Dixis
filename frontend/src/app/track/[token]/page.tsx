import StatusBadge from '@/components/admin/StatusBadge'

async function fetchData(token:string){
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const res = await fetch(`${base}/api/track/${token}`, { cache:'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function TrackPage({ params }:{ params:{ token:string } }){
  const data = await fetchData(params.token)
  if (!data) return <div style={{padding:16}}>Δεν βρέθηκε παραγγελία για το συγκεκριμένο σύνδεσμο.</div>
  const fmt = (n:number)=> new Intl.NumberFormat('el-GR',{ style:'currency', currency:'EUR' }).format(n)
  return (
    <div style={{padding:'20px 16px', maxWidth:720, margin:'0 auto'}}>
      <h1 style={{fontSize:22, marginBottom:12}}>Παρακολούθηση Παραγγελίας</h1>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <span style={{opacity:0.7}}>Κωδικός:</span><b>#{data.id}</b>
        <span style={{opacity:0.7}}>Κατάσταση:</span><StatusBadge status={data.status}/>
      </div>
      <div style={{opacity:0.8, marginTop:6}}>
        <div>Ημ/νία: {data.createdAt ? new Date(data.createdAt).toLocaleString('el-GR') : '—'}</div>
        <div>Πελάτης: {data.buyerName || '—'}</div>
        <div>Σύνολο: {typeof data.total === 'number' ? fmt(data.total) : '—'}</div>
      </div>
      <p style={{marginTop:16, fontSize:14, opacity:0.7}}>
        Ο σύνδεσμος είναι μόνο για ενημέρωση κατάστασης.
      </p>
    </div>
  )
}
export const dynamic = 'force-dynamic'
export const revalidate = 0
