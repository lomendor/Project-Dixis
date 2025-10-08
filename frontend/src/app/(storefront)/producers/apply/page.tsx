export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

async function submit(formData: FormData){
  'use server';
  const payload = {
    producerName: String(formData.get('producerName')||'').trim(),
    companyName: String(formData.get('companyName')||'').trim()||null,
    afm: String(formData.get('afm')||'').trim()||null,
    email: String(formData.get('email')||'').trim(),
    phone: String(formData.get('phone')||'').trim()||null,
    categories: String(formData.get('categories')||'').trim()||null,
    note: String(formData.get('note')||'').trim()||null,
  };
  // απλό validation
  if(!payload.producerName || !payload.email){ throw new Error('Συμπληρώστε Ονοματεπώνυμο και Email'); }

  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';
  await fetch(baseURL+'/api/producers/apply', {
    method:'POST',
    body: JSON.stringify(payload),
    headers:{ 'content-type':'application/json' }
  });
  redirect('/producers/apply?ok=1');
}

export default function Page({ searchParams }:{ searchParams?:Record<string,string|undefined> }){
  const ok = String(searchParams?.ok||'')==='1';
  return (
    <main style={{maxWidth:720, margin:'0 auto', padding:16, display:'grid', gap:16}}>
      <h1>Αίτηση Παραγωγού</h1>
      {ok ? (
        <div style={{border:'1px solid #cce5cc', background:'#f4fff4', padding:12, borderRadius:8}}>
          Ευχαριστούμε για το ενδιαφέρον σας. Η ομάδα μας θα επικοινωνήσει σύντομα.
        </div>
      ) : (
      <form action={submit} style={{display:'grid', gap:12}}>
        <label style={{display:'grid', gap:4}}>
          Ονοματεπώνυμο*
          <input name="producerName" required style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <label style={{display:'grid', gap:4}}>
          Επωνυμία
          <input name="companyName" style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <label style={{display:'grid', gap:4}}>
          ΑΦΜ
          <input name="afm" style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <label style={{display:'grid', gap:4}}>
          Email*
          <input type="email" name="email" required style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <label style={{display:'grid', gap:4}}>
          Τηλέφωνο
          <input name="phone" style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <label style={{display:'grid', gap:4}}>
          Κατηγορίες (π.χ. Ελιές, Μέλι)
          <input name="categories" placeholder="comma, separated" style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <label style={{display:'grid', gap:4}}>
          Σημειώσεις
          <textarea name="note" rows={4} style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <button type="submit" style={{padding:'10px 16px', background:'#007bff', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600}}>
          Υποβολή αίτησης
        </button>
      </form>
      )}
    </main>
  );
}
