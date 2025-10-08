export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth/admin';
import { kpisAdmin } from '@/lib/kpi/admin';

const fmtMoney = (n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

export default async function Page(){
  await requireAdmin?.();
  const { revenue7d, statusMap, lowStock } = await kpisAdmin();

  const statuses = ['PENDING','PAID','PACKING','SHIPPED','DELIVERED','CANCELLED'];

  return (
    <main style={{display:'grid',gap:16,padding:16}}>
      <h1>Πίνακας Ελέγχου</h1>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Έσοδα τελευταίων 7 ημερών</div>
          <div style={{fontSize:28,fontWeight:800}}>{fmtMoney(revenue7d)}</div>
        </div>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Παραγγελίες (ανά status)</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8,marginTop:8}}>
            {statuses.map(s=>(
              <div key={s} style={{border:'1px solid #f0f0f0',borderRadius:6,padding:8,display:'flex',justifyContent:'space-between'}}>
                <span>{s}</span>
                <b>{Number((statusMap as any)[s]||0)}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3>Χαμηλά αποθέματα</h3>
        <table style={{width:'100%',maxWidth:640,borderCollapse:'collapse'}}>
          <thead><tr><th>Προϊόν</th><th style={{textAlign:'right'}}>Stock</th></tr></thead>
          <tbody>
            {lowStock.map(p=>(
              <tr key={p.id} style={{borderTop:'1px solid #eee'}}>
                <td>{p.title}</td>
                <td style={{textAlign:'right'}}>{Number(p.stock||0)}</td>
              </tr>
            ))}
            {!lowStock.length && <tr><td colSpan={2} style={{opacity:.6,padding:12}}>— Κανένα προϊόν κάτω από όριο —</td></tr>}
          </tbody>
        </table>
      </section>
    </main>
  );
}
