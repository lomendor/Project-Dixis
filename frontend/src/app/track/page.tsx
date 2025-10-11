'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrackIndex(){
  const [token,setToken] = useState('')
  const router = useRouter()
  return (
    <main style={{maxWidth:560, margin:'40px auto', fontFamily:'system-ui, Arial'}}>
      <h1>Παρακολούθηση παραγγελίας</h1>
      <p>Εισάγετε τον κωδικό παρακολούθησης (token) που λάβατε με email.</p>
      <form onSubmit={(e)=>{ e.preventDefault(); if(token.trim()) router.push('/track/' + token.trim()) }}>
        <input value={token} onChange={e=>setToken(e.target.value)} placeholder="π.χ. d3x...token" style={{width:'100%',padding:'10px',fontSize:16}} />
        <button type="submit" style={{marginTop:10,padding:'10px 16px',fontSize:16}}>Προβολή</button>
      </form>
    </main>
  )
}
