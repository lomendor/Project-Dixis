export function subject(orderId: string) {
  return `Dixis — Επιβεβαίωση Παραγγελίας #${orderId}`;
}

export function html(params: {
  id: string;
  total: number;
  items: { title: string; qty: number; price: number }[];
  shipping: {
    name: string;
    line1: string;
    city: string;
    postal: string;
    phone: string;
  };
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);

  const rows = params.items
    .map(
      (i) =>
        `<tr><td>${i.title}</td><td>${i.qty}</td><td>${fmt(i.price * i.qty)}</td></tr>`
    )
    .join('');

  return `
  <div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ευχαριστούμε για την παραγγελία σας!</h2>
    <p>Αριθμός παραγγελίας: <b>#${params.id}</b></p>
    <h3>Προϊόντα</h3>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee">
      <thead><tr><th style="text-align:left">Προϊόν</th><th>Ποσότητα</th><th>Σύνολο</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><b>Σύνολο:</b> ${fmt(params.total || 0)}</p>
    <h3>Στοιχεία αποστολής</h3>
    <p>${params.shipping.name}<br/>${params.shipping.line1}, ${params.shipping.city} ${params.shipping.postal}<br/>Τηλ: ${params.shipping.phone}</p>
    <p>Τρόπος πληρωμής: Αντικαταβολή (COD)</p>
    <p>Θα ειδοποιηθείτε με νεότερη ενημέρωση για την πορεία της παραγγελίας.</p>
  </div>`;
}
