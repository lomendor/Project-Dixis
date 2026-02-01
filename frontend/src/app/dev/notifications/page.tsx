import { prisma } from '@/lib/db/client';
import { renderSMS } from '@/lib/notify/templates';

export const dynamic = 'force-dynamic';

/**
 * Pass FIX-ADMIN-DASHBOARD-418-02: Deterministic date formatter for Server Components.
 * Using toISOString() slice avoids hydration mismatch from locale-dependent formatting.
 */
function formatDateStable(date: Date | string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

function maskPhone(v:string){
  if(!v) return '';
  const digits = v.replace(/\D/g,'');
  if(digits.length <= 3) return '***';
  const tail = digits.slice(-3);
  return v.replace(digits, '*'.repeat(Math.max(0,digits.length-3)) + tail);
}

export default async function Page(){
  // SECURITY: Block in production unless DIXIS_DEV override
  const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (isProd && process.env.DIXIS_DEV !== '1') {
    // προφυλάσσουμε την outbox σελίδα στην παραγωγή
    return (<main><h1>404</h1><p>Not found.</p></main>);
  }
  const rows = await prisma.notification.findMany({ orderBy:{ createdAt:'desc' }, take: 100 });
  return (
    <main style={{padding:'2rem'}}>
      <h1>DEV · Notifications Outbox</h1>
      <table style={{width:'100%', borderCollapse:'collapse', marginTop:'1rem'}}>
        <thead>
          <tr style={{borderBottom:'2px solid #333'}}>
            <th style={{textAlign:'left', padding:'0.5rem'}}>Πότε</th>
            <th style={{textAlign:'left', padding:'0.5rem'}}>Κανάλι</th>
            <th style={{textAlign:'left', padding:'0.5rem'}}>Προς</th>
            <th style={{textAlign:'left', padding:'0.5rem'}}>Template</th>
            <th style={{textAlign:'left', padding:'0.5rem'}}>Προεπισκόπηση</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n: any)=>(
            <tr key={n.id} style={{borderTop:'1px solid #eee'}}>
              <td style={{padding:'0.5rem'}}>{formatDateStable(n.createdAt)}</td>
              <td style={{padding:'0.5rem'}}>{n.channel}</td>
              <td style={{padding:'0.5rem'}}>{maskPhone(n.to as any)}</td>
              <td style={{padding:'0.5rem'}}>{n.template}</td>
              <td style={{padding:'0.5rem'}}>
                {n.channel==='SMS' ? renderSMS(n.template, (n.payload as any)) : JSON.stringify(n.payload)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p style={{marginTop:'2rem', color:'#666'}}>Δεν υπάρχουν ειδοποιήσεις ακόμα.</p>
      )}
    </main>
  );
}
