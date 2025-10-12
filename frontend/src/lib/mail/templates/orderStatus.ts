export function subject(orderId: string, status: string) {
  return `Dixis — Ενημέρωση Παραγγελίας #${orderId}`;
}

export function html(params: {
  id: string;
  status: string;
  publicToken?: string;
}) {
  const statusLabels: Record<string, string> = {
    PENDING: 'Εκκρεμής',
    PAID: 'Πληρωμένη',
    PACKING: 'Συσκευασία',
    SHIPPED: 'Σε αποστολή',
    DELIVERED: 'Παραδόθηκε',
    CANCELLED: 'Ακυρώθηκε'
  };

  const statusLabel = statusLabels[params.status.toUpperCase()] || params.status;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');
  const trackLink = params.publicToken ? `${base}/track/${params.publicToken}` : '';

  return `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ενημέρωση Παραγγελίας</h2>
    <p>Αρ. Παραγγελίας: <b>#${params.id}</b></p>
    <p>Η κατάσταση της παραγγελίας σας άλλαξε σε:</p>
    <p style="font-size:20px;font-weight:bold;color:#16a34a">${statusLabel}</p>
    ${trackLink ? `<p><a href="${trackLink}" target="_blank" rel="noopener" style="display:inline-block;padding:10px 20px;background-color:#16a34a;color:#fff;text-decoration:none;border-radius:6px;margin-top:10px">Παρακολούθηση παραγγελίας</a></p>` : ''}
  </div>`;
}

export function text(params: {
  id: string;
  status: string;
  publicToken?: string;
}) {
  const statusLabels: Record<string, string> = {
    PENDING: 'Εκκρεμής',
    PAID: 'Πληρωμένη',
    PACKING: 'Συσκευασία',
    SHIPPED: 'Σε αποστολή',
    DELIVERED: 'Παραδόθηκε',
    CANCELLED: 'Ακυρώθηκε'
  };

  const statusLabel = statusLabels[params.status.toUpperCase()] || params.status;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');
  const trackLink = params.publicToken ? `${base}/track/${params.publicToken}` : '';

  const lines = [
    `Ενημέρωση Παραγγελίας #${params.id}`,
    `Νέα κατάσταση: ${statusLabel}`
  ];

  if (trackLink) {
    lines.push(`Παρακολούθηση: ${trackLink}`);
  }

  return lines.join('\n');
}
