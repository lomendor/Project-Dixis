// Idempotent create/override – minimal, EL-first.
export function subject(orderId: string, status: string) {
  const map: Record<string,string> = {
    PAID:'Πληρωμή', PACKING:'Συσκευασία', SHIPPED:'Απεστάλη',
    DELIVERED:'Παραδόθηκε', CANCELLED:'Ακυρώθηκε', PENDING:'Εκκρεμεί'
  };
  const label = map[String(status).toUpperCase()] || String(status);
  return `Dixis — Ενημέρωση Παραγγελίας #${orderId}: ${label}`;
}

export function html(params: { id: string; status: string; trackingCode?: string }) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const trackUrl = params.trackingCode
    ? `${base}/orders/t/${params.trackingCode}`
    : `${base}/orders/track/${params.id}`;
  const label = subject(params.id, params.status).split(': ').pop();
  return `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ενημέρωση παραγγελίας #${params.id}</h2>
    <p>Νέα κατάσταση: <b>${label}</b></p>
    <p><a href="${trackUrl}" target="_blank" rel="noopener"
          style="display:inline-block;padding:8px 12px;border:1px solid #ddd;border-radius:6px;text-decoration:none">
          Παρακολούθηση παραγγελίας</a></p>
  </div>`;
}
