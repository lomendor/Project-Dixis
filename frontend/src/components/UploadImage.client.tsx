'use client';
import React, { useRef, useState } from 'react';

type Props = {
  value?: string|null;
  onChange: (url: string|null) => void;
  accept?: string; // "image/*"
  maxMB?: number;  // default 5
  label?: string;
};

export default function UploadImage({ value, onChange, accept='image/*', maxMB=5, label='Εικόνα προϊόντος' }: Props){
  const [busy,setBusy] = useState(false);
  const [err,setErr] = useState<string|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  async function doUpload(file: File){
    setErr(null);
    if (!file) return;
    if (file.size > maxMB*1024*1024){ setErr(`Το αρχείο υπερβαίνει τα ${maxMB}MB`); return; }
    setBusy(true);
    try{
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/me/uploads', { method:'POST', body: fd });
      const j = await r.json();
      if(!r.ok){ setErr(j?.error||'Σφάλμα ανεβάσματος'); return; }
      onChange(j.url);
    } finally { setBusy(false); }
  }
  function onDrop(e: React.DragEvent){
    e.preventDefault();
    const f = e.dataTransfer.files?.[0]; if (f) void doUpload(f);
  }
  function onPick(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if (f) void doUpload(f);
  }
  return (
    <div>
      <label style={{display:'block', marginBottom:6, fontWeight:600}}>{label}</label>
      {value ? (
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <img src={value} alt="Εικόνα προϊόντος" style={{width:96,height:96,objectFit:'cover',borderRadius:8,border:'1px solid #e5e7eb'}}/>
          <div style={{display:'flex',gap:8}}>
            <button type="button" className="btn" onClick={()=>onChange(null)}>Αφαίρεση εικόνας</button>
            <button type="button" className="btn" onClick={()=>inputRef.current?.click()} disabled={busy}>{busy?'Ανέβασμα…':'Ανέβασμα νέας'}</button>
          </div>
        </div>
      ) : (
        <div onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}
             style={{padding:16, border:'2px dashed #d1d5db', borderRadius:8, background:'#fafafa'}}>
          <p style={{margin:0, color:'#6b7280'}}>Σύρε εδώ μια εικόνα ή</p>
          <button type="button" className="btn" onClick={()=>inputRef.current?.click()} disabled={busy}>{busy?'Ανέβασμα…':'Επίλεξε αρχείο'}</button>
          {err && <p style={{color:'#b91c1c'}}>{err}</p>}
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} style={{display:'none'}} onChange={onPick}/>
    </div>
  );
}
