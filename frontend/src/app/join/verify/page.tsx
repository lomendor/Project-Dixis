'use client';
import { useEffect, useState } from 'react';
export const dynamic = 'force-dynamic';
export default function Verify(){
  const [code,setCode]=useState(''); const [err,setErr]=useState<string|null>(null);
  const params = new URLSearchParams(typeof window!=='undefined'?window.location.search:'');
  const phone = params.get('phone') || '';
  useEffect(()=>{ if(!phone) window.location.href='/join'; },[phone]);
  async function submit(e:any){ e.preventDefault(); setErr(null);
    const r = await fetch('/api/auth/verify-otp',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone, code })});
    const j = await r.json(); if(r.ok){ window.location.href='/my'; } else setErr(j?.error || 'Σφάλμα');
  }
  return (<main style={{padding:16, maxWidth:480, margin:'0 auto'}}>
    <h1>Επιβεβαίωση Κωδικού</h1>
    <p>Στείλαμε κωδικό στο {phone}. Πληκτρολογήστε τον παρακάτω.</p>
    <form onSubmit={submit} style={{display:'grid',gap:12}}>
      <label>Κωδικός OTP<input inputMode="numeric" pattern="\\d{6}" placeholder="6-ψήφιος" value={code} onChange={e=>setCode(e.target.value)} required/></label>
      <button className="btn btn-primary" type="submit">Είσοδος</button>
      {err && <p style={{color:'#b91c1c'}}>{err}</p>}
    </form>
  </main>);
}
