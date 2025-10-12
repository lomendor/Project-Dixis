export function subject(orderId:string, status:string){
  const map:any = { PAID:'Πληρωμή', PACKING:'Συσκευασία', SHIPPED:'Απεστάλη', DELIVERED:'Παραδόθηκε', CANCELLED:'Ακυρώθηκε' };
  const label = map[String(status).toUpperCase()] || String(status);
  return `Dixis — Ενημέρωση Παραγγελίας #${orderId}: ${label}`;
}
function trackUrl(token?:string){
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  if (!token) return null;
  return `${base}/track/${token}`;
}
export function html(params:{ id:string, status:string, publicToken?:string }){
  const label = subject(params.id, params.status).split(': ').pop();
  const url = trackUrl(params.publicToken);
  const link = url ? `<p>Παρακολούθηση: <a href="${url}">${url}</a></p>` : '';
  return `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ενημέρωση παραγγελίας #${params.id}</h2>
    <p>Νέα κατάσταση: <b>${label}</b></p>
    ${link}
    <p>Σας ευχαριστούμε που επιλέξατε τη Dixis.</p>
  </div>`;
}
export function text(params:{ id:string, status:string, publicToken?:string }){
  const label = subject(params.id, params.status).split(': ').pop();
  const url = trackUrl(params.publicToken);
  const link = url ? `\n\nΠαρακολούθηση: ${url}` : '';
  return `Ενημέρωση παραγγελίας #${params.id}\n\nΝέα κατάσταση: ${label}${link}\n\nΣας ευχαριστούμε που επιλέξατε τη Dixis.`;
}
