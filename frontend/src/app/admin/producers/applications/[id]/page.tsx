export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/db/client';
import { notFound, redirect } from 'next/navigation';

export default async function Page({ params }:{ params:{ id:string } }){
  await requireAdmin?.();
  const a = await prisma.producerApplication.findUnique({ where:{ id: String(params.id||'') } });
  if(!a) return notFound();

  async function setStatus(formData: FormData){
    'use server';
    await requireAdmin?.();
    const status = String(formData.get('status')||'PENDING').toUpperCase() as any;
    const note = String(formData.get('note')||'');
    await prisma.producerApplication.update({
      where:{ id: a.id },
      data:{ status, note }
    });
    redirect(`/admin/producers/applications/${a.id}`);
  }

  return (
    <main style={{display:'grid',gap:16,padding:16, maxWidth:820, margin:'0 auto'}}>
      <h1>Αίτηση #{a.id.slice(0,8)}</h1>

      <section style={{display:'grid',gap:8,background:'#f9f9f9',padding:16,borderRadius:8}}>
        <div><b>Όνομα:</b> {a.producerName}</div>
        <div><b>Επωνυμία:</b> {a.companyName||'—'}</div>
        <div><b>ΑΦΜ:</b> {a.afm||'—'}</div>
        <div><b>Email:</b> <a href={`mailto:${a.email}`} style={{color:'#007bff'}}>{a.email}</a></div>
        <div><b>Τηλέφωνο:</b> {a.phone||'—'}</div>
        <div><b>Κατηγορίες:</b> {a.categories||'—'}</div>
        <div><b>Σημειώσεις:</b> {a.note||'—'}</div>
        <div><b>Status:</b> <span style={{padding:'4px 8px', background: a.status==='APPROVED'?'#cce5cc':a.status==='REJECTED'?'#f8d7da':'#fff3cd', borderRadius:4}}>{a.status}</span></div>
        <div><b>Ημερομηνία:</b> {new Date(a.createdAt as any).toLocaleDateString('el-GR')}</div>
      </section>

      <form action={setStatus} style={{display:'grid', gap:12, border:'1px solid #ddd', padding:16, borderRadius:8}}>
        <h3 style={{margin:0}}>Ενέργειες</h3>
        <label style={{display:'grid', gap:4}}>
          Αλλαγή status:
          <select name="status" defaultValue={a.status} style={{padding:8, border:'1px solid #ddd', borderRadius:4}}>
            {['PENDING','REVIEW','APPROVED','REJECTED'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{display:'grid', gap:4}}>
          Σημειώσεις
          <input name="note" defaultValue={a.note||''} style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        </label>
        <button type="submit" style={{padding:'10px 16px', background:'#28a745', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600}}>
          Αποθήκευση
        </button>
      </form>
    </main>
  );
}
