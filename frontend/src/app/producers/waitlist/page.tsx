'use client';
import * as React from 'react';

export default function WaitlistPage(){
  const [ok,setOk]=React.useState(false);
  const [err,setErr]=React.useState<string|undefined>();
  const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault(); setErr(undefined); setOk(false);
    const fd=new FormData(e.currentTarget);
    const payload={
      name:String(fd.get('name')||'').trim(),
      phone:String(fd.get('phone')||'').trim(),
      email:String(fd.get('email')||'').trim(),
      region:String(fd.get('region')||'').trim(),
      products:String(fd.get('products')||'').trim(),
      notes:String(fd.get('notes')||'').trim(),
      website:String(fd.get('website')||'').trim(),
      ts:Date.now()
    };
    if(!payload.name||!payload.phone){ setErr('Συμπλήρωσε τουλάχιστον ονοματεπώνυμο & τηλέφωνο.'); return; }
    const res=await fetch('/api/ops/waitlist',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    if(!res.ok){ setErr('Απέτυχε η αποστολή. Δοκίμασε ξανά.'); return; }
    setOk(true); (e.target as HTMLFormElement).reset();
  };
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Εκδήλωση ενδιαφέροντος</h1>
      <p className="text-neutral-600 text-sm mt-1">Άφησέ μας στοιχεία και θα σε καλέσουμε.</p>
      {err ? <p className="text-sm text-red-600 mt-3">{err}</p> : null}
      {ok ? <p className="text-sm text-green-700 mt-3">Ελήφθη! Θα σε καλέσουμε σύντομα.</p> : null}
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 max-w-2xl">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <div className="grid sm:grid-cols-2 gap-3">
          <input name="name" placeholder="Ονοματεπώνυμο/Επωνυμία *" className="h-10 px-3 border rounded-md" required />
          <input name="phone" placeholder="Τηλέφωνο *" className="h-10 px-3 border rounded-md" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="email" name="email" placeholder="Email" className="h-10 px-3 border rounded-md" />
          <input name="region" placeholder="Περιοχή (π.χ. Λήμνος)" className="h-10 px-3 border rounded-md" />
        </div>
        <input name="products" placeholder="Τι προϊόντα έχεις (π.χ. μέλι, λάδι…)" className="h-10 px-3 border rounded-md" />
        <textarea name="notes" placeholder="Σημειώσεις" className="min-h-24 p-3 border rounded-md"></textarea>
        <button className="h-10 px-4 rounded-md bg-brand text-white text-sm w-fit">Αποστολή</button>
      </form>
    </main>
  );
}
