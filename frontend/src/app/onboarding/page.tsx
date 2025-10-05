'use client';
import { useEffect, useState } from 'react';

type Form = { name:string; region:string; category:string; description?:string; imageUrl?:string; phone?:string; email?:string };

export const dynamic = 'force-dynamic';

export default function Onboarding(){
  const [me,setMe]=useState<{authenticated:boolean,phone?:string}>({authenticated:false});
  const [step,setStep]=useState<1|2|3>(1);
  const [f,setF]=useState<Form>({ name:'', region:'', category:'' });
  const [msg,setMsg]=useState<string|null>(null);
  const [err,setErr]=useState<string|null>(null);
  const [exists, setExists] = useState<boolean>(false);

  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/auth/me'); const j = await r.json(); setMe(j);
    if(!j.authenticated){ window.location.href='/join'; return; }
    const mine = await fetch('/api/me/producers'); const m = await mine.json();
    if(m.item){ setExists(true); setF((p)=>({ ...p, name:m.item.name, region:m.item.region, category:m.item.category, description:m.item.description || '', imageUrl:m.item.imageUrl || '', phone:m.item.phone || '', email:m.item.email || '' })); }
  })(); },[]);

  async function upload(file: File){
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/me/uploads',{ method:'POST', body: fd, credentials:'include' });
    if(!r.ok){ throw new Error('Αποτυχία upload'); }
    const j = await r.json(); return j.url as string;
  }

  async function next(){
    setErr(null); setMsg(null);
    if(step===1){
      if(!f.name || !f.region || !f.category){ setErr('Συμπληρώστε Όνομα/Περιοχή/Κατηγορία'); return; }
      setStep(2); return;
    }
    if(step===2){
      setStep(3); return;
    }
    if(step===3){
      const method = exists ? 'PATCH' : 'POST';
      const r = await fetch('/api/me/producers',{ method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(f) });
      const j = await r.json();
      if(!r.ok){ setErr(j?.error || 'Σφάλμα αποθήκευσης'); return; }
      setMsg('Αποθηκεύτηκε!'); window.location.href = '/producers';
    }
  }

  return (
    <main style={{padding:16, maxWidth:720, margin:'0 auto'}}>
      <h1>{exists? 'Επεξεργασία παραγωγού' : 'Νέος παραγωγός'}</h1>

      {step===1 && (
        <section style={{display:'grid', gap:12}}>
          <label>Όνομα<input value={f.name} onChange={e=>setF({...f, name:e.target.value})} required/></label>
          <label>Περιοχή<input value={f.region} onChange={e=>setF({...f, region:e.target.value})} required/></label>
          <label>Κατηγορία<input value={f.category} onChange={e=>setF({...f, category:e.target.value})} required/></label>
          <label>Τηλέφωνο (δημόσιο)<input value={f.phone||''} onChange={e=>setF({...f, phone:e.target.value})}/></label>
          <label>Email (δημόσιο)<input type="email" value={f.email||''} onChange={e=>setF({...f, email:e.target.value})}/></label>
        </section>
      )}

      {step===2 && (
        <section style={{display:'grid', gap:12}}>
          <label>Περιγραφή<textarea value={f.description||''} onChange={e=>setF({...f, description:e.target.value})}/></label>
          <label>Φωτογραφία<input type="file" accept="image/*" onChange={async e=>{ const file=e.target.files?.[0]; if(!file) return; try{ const url=await upload(file); setF({...f, imageUrl:url}); }catch{ setErr('Αποτυχία ανεβάσματος'); } }} /></label>
          {f.imageUrl && <img src={f.imageUrl} alt="Προεπισκόπηση" style={{width:'100%',height:180,objectFit:'cover',borderRadius:12}}/>}
        </section>
      )}

      {step===3 && (
        <section>
          <h2>Επιβεβαίωση</h2>
          <ul>
            <li><strong>Όνομα:</strong> {f.name}</li>
            <li><strong>Περιοχή:</strong> {f.region}</li>
            <li><strong>Κατηγορία:</strong> {f.category}</li>
            {f.phone && <li><strong>Τηλέφωνο:</strong> {f.phone}</li>}
            {f.email && <li><strong>Email:</strong> {f.email}</li>}
          </ul>
        </section>
      )}

      <div style={{display:'flex', gap:8, marginTop:16}}>
        {step>1 && <button className="btn" onClick={()=>setStep((s)=> (s===2?1:2))}>Πίσω</button>}
        <button className="btn btn-primary" onClick={next}>{step<3? 'Συνέχεια' : (exists? 'Αποθήκευση' : 'Δημιουργία')}</button>
        <a className="btn" href="/my">Ο λογαριασμός μου</a>
      </div>
      {msg && <p style={{color:'#047857', marginTop:8}}>{msg}</p>}
      {err && <p style={{color:'#b91c1c', marginTop:8}}>{err}</p>}
    </main>
  );
}
