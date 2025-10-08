export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/db/client';
import Link from 'next/link';

function parseDate(s?:string){ if(!s) return undefined; const d=new Date(s); return isNaN(+d)?undefined:d; }

export default async function Page({ searchParams }:{ searchParams?:Record<string,string|undefined> }){
  await requireAdmin?.();
  const status = String(searchParams?.status||'').toUpperCase();
  const from = parseDate(String(searchParams?.from||''));
  const to = parseDate(String(searchParams?.to||''));

  const where:any = {};
  if(status) where.status = status;
  if(from || to) where.createdAt = { gte: from||undefined, lte: to||undefined };

  const rows = await prisma.producerApplication.findMany({
    where,
    orderBy:{ createdAt:'desc' },
    select:{ id:true, producerName:true, companyName:true, email:true, status:true, createdAt:true }
  });

  return (
    <main style={{display:'grid',gap:16,padding:16}}>
      <h1>Αιτήσεις Παραγωγών</h1>

      <form method="get" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <select name="status" defaultValue={status} style={{padding:8, border:'1px solid #ddd', borderRadius:4}}>
          <option value="">— Όλα —</option>
          {['PENDING','REVIEW','APPROVED','REJECTED'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" name="from" defaultValue={searchParams?.from as string||''} style={{padding:8, border:'1px solid #ddd', borderRadius:4}}/>
        <input type="date" name="to" defaultValue={searchParams?.to as string||''} style={{padding:8, border:'1px solid #ddd', borderRadius:4}}/>
        <button type="submit" style={{padding:'8px 16px', background:'#007bff', color:'white', border:'none', borderRadius:4, cursor:'pointer'}}>Φίλτρο</button>
      </form>

      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:'2px solid #ddd'}}>
            <th style={{textAlign:'left',padding:8}}>ID</th>
            <th style={{textAlign:'left',padding:8}}>Όνομα</th>
            <th style={{textAlign:'left',padding:8}}>Επωνυμία</th>
            <th style={{textAlign:'left',padding:8}}>Email</th>
            <th style={{textAlign:'left',padding:8}}>Status</th>
            <th style={{textAlign:'left',padding:8}}>Ημερ.</th>
            <th style={{textAlign:'left',padding:8}}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(a=>(
            <tr key={a.id} style={{borderTop:'1px solid #eee'}}>
              <td style={{padding:8}}>#{a.id.slice(0,8)}</td>
              <td style={{padding:8}}>{a.producerName}</td>
              <td style={{padding:8}}>{a.companyName||'—'}</td>
              <td style={{padding:8}}>{a.email}</td>
              <td style={{padding:8}}><span style={{padding:'4px 8px', background: a.status==='APPROVED'?'#cce5cc':a.status==='REJECTED'?'#f8d7da':'#fff3cd', borderRadius:4, fontSize:12}}>{a.status}</span></td>
              <td style={{padding:8}}>{new Date(a.createdAt as any).toLocaleDateString('el-GR')}</td>
              <td style={{padding:8}}><Link href={`/admin/producers/applications/${a.id}`} style={{color:'#007bff',textDecoration:'none'}}>Άνοιγμα</Link></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7} style={{textAlign:'center',opacity:.7,padding:24}}>Καμία αίτηση</td></tr>}
        </tbody>
      </table>
    </main>
  );
}
