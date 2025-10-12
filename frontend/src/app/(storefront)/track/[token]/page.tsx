import React from 'react'

function fmtEUR(n:number){ return new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' }).format(n) }

async function fetchPublic(token:string){
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3001'
  const url = `${base}/api/orders/public/${encodeURIComponent(token)}`
  const res = await fetch(url, { cache:'no-store' })
  if(!res.ok) return null
  return (await res.json())?.item
}

function statusLabel(s:string){
  const m:any = { 
    PAID:'Πληρωμή', 
    PACKING:'Συσκευασία', 
    SHIPPED:'Απεστάλη', 
    DELIVERED:'Παραδόθηκε', 
    CANCELLED:'Ακυρώθηκε',
    PENDING:'Εκκρεμεί'
  }
  return m[String(s).toUpperCase()] || s
}

export default async function Page({ params }:{ params:{ token:string }}){
  const item = await fetchPublic(params.token)
  
  if(!item) {
    return (
      <div style={{padding:'2rem', maxWidth:800, margin:'0 auto'}}>
        <h2>Δεν βρέθηκε παραγγελία</h2>
        <p>Ελέγξτε τον σύνδεσμο παρακολούθησης.</p>
      </div>
    )
  }

  const totals = item.totals || { subtotal:0, shipping:0, codFee:0, tax:0, grandTotal:0 }

  return (
    <div style={{padding:'2rem', maxWidth:800, margin:'0 auto', fontFamily:'system-ui, Arial, sans-serif'}}>
      <h1>Παρακολούθηση Παραγγελίας #{item.code}</h1>
      <p style={{fontSize:'1.2rem'}}>Κατάσταση: <b style={{color:'#0070f3'}}>{statusLabel(item.status)}</b></p>

      <h3 style={{marginTop:'2rem'}}>Προϊόντα</h3>
      <ul style={{listStyle:'none', padding:0}}>
        {(item.items||[]).map((it:any, i:number)=>(
          <li key={i} style={{padding:'0.5rem 0', borderBottom:'1px solid #eee'}}>
            {it.title} × {it.qty}
          </li>
        ))}
      </ul>

      <h3 style={{marginTop:'2rem'}}>Σύνολα</h3>
      <ul style={{listStyle:'none', padding:0}}>
        <li style={{padding:'0.25rem 0'}}>Υποσύνολο: {fmtEUR(totals.subtotal)}</li>
        <li style={{padding:'0.25rem 0'}}>Μεταφορικά: {fmtEUR(totals.shipping)}</li>
        {totals.codFee > 0 && <li style={{padding:'0.25rem 0'}}>Αντικαταβολή: {fmtEUR(totals.codFee)}</li>}
        {totals.tax > 0 && <li style={{padding:'0.25rem 0'}}>Φόρος: {fmtEUR(totals.tax)}</li>}
        <li style={{padding:'0.5rem 0', marginTop:'0.5rem', borderTop:'2px solid #333', fontWeight:'bold', fontSize:'1.2rem'}}>
          Πληρωτέο: {fmtEUR(totals.grandTotal)}
        </li>
      </ul>
    </div>
  )
}
