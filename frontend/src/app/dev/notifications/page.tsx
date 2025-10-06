import { prisma } from '@/lib/db/client';
import { renderSMS } from '@/lib/notify/templates';

export const dynamic = 'force-dynamic';

export default async function Page(){
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
          {rows.map(n=>(
            <tr key={n.id} style={{borderTop:'1px solid #eee'}}>
              <td style={{padding:'0.5rem'}}>{new Date(n.createdAt as any).toLocaleString()}</td>
              <td style={{padding:'0.5rem'}}>{n.channel}</td>
              <td style={{padding:'0.5rem'}}>{n.to}</td>
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
