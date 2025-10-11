export function subject(orderId: string) {
  return `Dixis — Επιβεβαίωση Παραγγελίας #${orderId}`;
}

export function html(params: {
  id: string;
  publicToken: string;
  total: number;
  items: { title: string; qty: number; price: number }[];
  shipping: { name: string; line1: string; city: string; postal: string; phone: string };
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);
  const rows = params.items
    .map(
      (i) => `<tr><td>${i.title}</td><td>${i.qty}</td><td>${fmt(i.price * i.qty)}</td></tr>`
    )
    .join('');
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');
  const track = `${base}/orders/track/${params.publicToken}`;

  return `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ευχαριστούμε για την παραγγελία σας!</h2>
    <p>Αρ. Παραγγελίας: <b>#${params.id}</b></p>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee">
      <thead><tr><th align="left">Προϊόν</th><th>Ποσότητα</th><th>Σύνολο</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><b>Σύνολο:</b> ${fmt(params.total || 0)}</p>
    <p><a href="${track}" target="_blank" rel="noopener" style="display:inline-block;padding:10px 20px;background-color:#16a34a;color:#fff;text-decoration:none;border-radius:6px;margin-top:10px">Παρακολούθηση παραγγελίας</a></p>
  </div>`;
}
