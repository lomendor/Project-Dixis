'use client';
import { useState } from 'react';

export default function Page(){
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState<string|undefined>();

  async function onSubmit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy(true); setErr(undefined);
    const fd = new FormData(e.currentTarget);
    const shipping = {
      name: fd.get('name'), line1: fd.get('line1'),
      city: fd.get('city'), postal: fd.get('postal'), phone: fd.get('phone')
    };
    try{
      const r = await fetch('/api/checkout', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ shipping })
      });
      if(r.status===409){ setErr('Ανεπαρκές απόθεμα. Παρακαλώ αλλάξτε ποσότητες.'); setBusy(false); return; }
      if(!r.ok){ setErr('Κάτι πήγε στραβά. Δοκιμάστε ξανά.'); setBusy(false); return; }
      const j = await r.json();
      window.location.href = `/order/success/${j.id}`;
    }catch{
      setErr('Κάτι πήγε στραβά. Δοκιμάστε ξανά.'); setBusy(false);
    }
  }

  return (
    <main>
      <h1>Στοιχεία αποστολής</h1>
      {err && <p style={{color:'#b91c1c'}}>{err}</p>}
      <form onSubmit={onSubmit} style={{display:'grid', gap:8, maxWidth:480}}>
        <label>Ονοματεπώνυμο<input name="name" required/></label>
        <label>Διεύθυνση<input name="line1" required/></label>
        <label>Πόλη<input name="city" required/></label>
        <label>Τ.Κ.<input name="postal" required/></label>
        <label>Τηλέφωνο<input name="phone" required/></label>
        <button disabled={busy} type="submit">{busy?'Επεξεργασία…':'Ολοκλήρωση παραγγελίας'}</button>
      </form>
    </main>
  );
}
