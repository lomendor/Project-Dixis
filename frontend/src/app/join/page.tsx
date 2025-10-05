'use client';
import { useState } from 'react';
export const dynamic = 'force-dynamic';
export default function Join(){
  const [phone,setPhone]=useState(''); const [msg,setMsg]=useState<string|null>(null); const [err,setErr]=useState<string|null>(null);
  async function submit(e:any){ e.preventDefault(); setErr(null); setMsg(null);
    const r = await fetch('/api/auth/request-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone })});
    const j = await r.json();
    if(r.ok){ setMsg('Στάλθηκε κωδικός OTP στο τηλέφωνο.'); const p = encodeURIComponent(j.phone||phone); window.location.href = `/join/verify?phone=${p}${j.devCode?`&dev=${j.devCode}`:''}`; }
    else setErr(j?.error || 'Σφάλμα');
  }
  return (<main style={{padding:16, maxWidth:480, margin:'0 auto'}}>
    <h1>Είσοδος με Τηλέφωνο</h1>
    <form onSubmit={submit} style={{display:'grid',gap:12}}>
      <label>Τηλέφωνο<input inputMode="tel" placeholder="+30 69..." value={phone} onChange={e=>setPhone(e.target.value)} required/></label>
      <button className="btn btn-primary" type="submit">Συνέχεια</button>
      {msg && <p style={{color:'#047857'}}>{msg}</p>}
      {err && <p style={{color:'#b91c1c'}}>{err}</p>}
    </form>
  </main>);
}
