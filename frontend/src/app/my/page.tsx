'use client';
import { useEffect, useState } from 'react';
export const dynamic = 'force-dynamic';
export default function My(){
  const [me,setMe]=useState<any>({authenticated:false});
  useEffect(()=>{ (async()=>{ const r = await fetch('/api/auth/me'); const j = await r.json(); setMe(j); })(); },[]);
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/join'; }
  if(!me.authenticated) return <main style={{padding:16}}><p>Δεν είστε συνδεδεμένος.</p><a className="btn" href="/join">Σύνδεση</a></main>;
  return (<main style={{padding:16}}>
    <h1>Ο λογαριασμός μου</h1>
    <p>Συνδεδεμένος ως <strong>{me.phone}</strong></p>
    <div style={{marginTop:16,display:'flex',gap:8,flexWrap:'wrap'}}>
      <a className="btn" href="/my/orders">Οι παραγγελίες μου</a>
      <a className="btn" href="/my/products">Τα προϊόντα μου</a>
      <a className="btn" href="/my/sales">Οι πωλήσεις μου</a>
    </div>
    <button className="btn" onClick={logout} style={{marginTop:16}}>Αποσύνδεση</button>
  </main>);
}
