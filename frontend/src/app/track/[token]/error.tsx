'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }:{ error:Error & { digest?:string }, reset: ()=>void }){
  useEffect(()=>{ /* error already shown in UI */ }, [error])
  return (
    <main style={{maxWidth:680, margin:'40px auto', fontFamily:'system-ui, Arial'}}>
      <h1>Κάτι πήγε στραβά</h1>
      <p>Δεν ήταν δυνατή η φόρτωση της παραγγελίας. Παρακαλούμε προσπαθήστε ξανά.</p>
      <button onClick={()=>reset()} style={{padding:'8px 12px'}}>Δοκιμή ξανά</button>
    </main>
  )
}
