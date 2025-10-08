export function subject(orderId: string) {
  return `Dixis — Επιβεβαίωση Παραγγελίας #${orderId}`;
}

export function html(params: {
  id: string;
  total: number;
  items: { title: string; qty: number; price: number }[];
  shipping: { name: string; line1: string; city: string; postal: string; phone: string };
  trackingCode?: string;
  totals?: any;
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);
  const rows = params.items
    .map(
      (i) => `<tr><td>${i.title}</td><td>${i.qty}</td><td>${fmt(i.price * i.qty)}</td></tr>`
    )
    .join('');
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const trackUrl = params.trackingCode
    ? `${base}/orders/t/${params.trackingCode}`
    : `${base}/orders/track/${params.id}?phone=${encodeURIComponent(params.shipping.phone || '')}`;

  return `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ευχαριστούμε για την παραγγελία σας!</h2>
    <p>Αρ. Παραγγελίας: <b>#${params.id}</b></p>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee">
      <thead><tr><th align="left">Προϊόν</th><th>Ποσότητα</th><th>Σύνολο</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h3>Σύνολα παραγγελίας</h3>
    <table style="font-size:14px">
      <tr><td>Μερικό:</td><td><b>${fmt(Number((params as any).totals?.subtotal ?? (params as any).total ?? 0))}</b></td></tr>
      <tr><td>Μεταφορικά:</td><td><b>${fmt(Number((params as any).totals?.shipping ?? 0))}</b></td></tr>
      <tr><td>ΦΠΑ:</td><td><b>${fmt(Number((params as any).totals?.vat ?? 0))}</b></td></tr>
      <tr><td>Σύνολο:</td><td><b>${fmt(Number((params as any).totals?.total ?? (params as any).total ?? 0))}</b></td></tr>
    </table>
    <p><a href="${trackUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:8px 12px;border:1px solid #ddd;border-radius:6px;text-decoration:none">Παρακολούθηση παραγγελίας</a></p>
  </div>`;
}
