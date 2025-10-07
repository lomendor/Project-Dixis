import { OrderLike } from '@/lib/mail/mailer';

const fmt = (n:number)=> new Intl.NumberFormat('el-GR',{ style:'currency', currency:'EUR'}).format(n);

export function render(o: OrderLike){
  const rows = (o.items||[]).map(i=>`<tr><td>${i.titleSnap||'-'}</td><td>${i.qty||0}</td><td>${fmt(Number(i.price||0)*Number(i.qty||0))}</td></tr>`).join('');
  const sum = (o.items||[]).reduce((s,i)=> s + Number(i.price||0)*Number(i.qty||0), 0);
  const total = typeof o.total==='number' ? o.total : sum;
  const subject = `Επιβεβαίωση Παραγγελίας #${o.id}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
      <h2>Ευχαριστούμε για την παραγγελία σας, ${o.buyerName||'πελάτη'}!</h2>
      <p>Αρ. παραγγελίας: <b>#${o.id}</b> — Ημ/νία: ${new Date(o.createdAt||Date.now()).toLocaleString('el-GR')}</p>
      <h3>Προϊόντα</h3>
      <table style="width:100%;border-collapse:collapse"><thead><tr><th>Προϊόν</th><th>Ποσότητα</th><th>Σύνολο</th></tr></thead><tbody>${rows}</tbody></table>
      <h3>Σύνολο: ${fmt(total||0)}</h3>
      <p>Αποστολή: ${o.shippingLine1||'-'} ${o.shippingCity||''} ${o.shippingPostal||''}</p>
      <p>Θα ενημερωθείτε με email όταν αλλάξει η κατάσταση της παραγγελίας σας.</p>
    </div>`;
  const text = `Επιβεβαίωση Παραγγελίας #${o.id}\nΣύνολο: ${fmt(total||0)}\nΕυχαριστούμε!`;
  return { subject, html, text };
}
