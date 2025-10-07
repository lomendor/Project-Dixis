import { OrderLike } from '@/lib/mail/mailer';
const fmt = (n:number)=> new Intl.NumberFormat('el-GR',{ style:'currency', currency:'EUR'}).format(n);
export function render(o: OrderLike){
  const subject = `Ενημέρωση Παραγγελίας #${o.id}: ${String(o.status||'PENDING')}`;
  const total = typeof o.total==='number' ? o.total : 0;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
      <h2>Η παραγγελία σας ενημερώθηκε</h2>
      <p>Αρ. παραγγελίας: <b>#${o.id}</b> — Νέα κατάσταση: <b>${String(o.status||'PENDING')}</b></p>
      <p>Σύνολο: ${fmt(total||0)}</p>
    </div>`;
  const text = `Παραγγελία #${o.id} → Κατάσταση: ${String(o.status||'PENDING')}`;
  return { subject, html, text };
}
