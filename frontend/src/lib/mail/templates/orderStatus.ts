export function subject(orderId: string, status: string) {
  const map: any = {
    PAID: 'Πληρωμή',
    PACKING: 'Συσκευασία',
    SHIPPED: 'Απεστάλη',
    DELIVERED: 'Παραδόθηκε',
    CANCELLED: 'Ακυρώθηκε'
  };
  const label = map[String(status).toUpperCase()] || String(status);
  return `Dixis — Ενημέρωση Παραγγελίας #${orderId}: ${label}`;
}

export function html(params: { id: string; status: string }) {
  const label = subject(params.id, params.status).split(': ').pop();
  return `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ενημέρωση παραγγελίας #${params.id}</h2>
    <p>Νέα κατάσταση: <b>${label}</b></p>
    <p>Σας ευχαριστούμε που επιλέξατε τη Dixis.</p>
  </div>`;
}
