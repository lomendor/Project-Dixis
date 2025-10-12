import { fmtEUR } from '@/lib/cart/totals'

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

  const items = (params as any).items as any[] || []
  const totals = (params as any).totals || undefined

  return `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ενημέρωση Παραγγελίας</h2>
    <p>Αρ. Παραγγελίας: <b>#${params.id}</b></p>
    <p>Η κατάσταση της παραγγελίας σας άλλαξε σε:</p>
    <p style="font-size:20px;font-weight:bold;color:#16a34a">${statusLabel}</p>
    ${trackLink ? `<p><a href="${trackLink}" target="_blank" rel="noopener" style="display:inline-block;padding:10px 20px;background-color:#16a34a;color:#fff;text-decoration:none;border-radius:6px;margin-top:10px">Παρακολούθηση παραγγελίας</a></p>` : ''}
    ${renderSummary(items, totals)}
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

  const items = (params as any).items as any[] || []
  const totals = (params as any).totals || undefined
  const summaryText = renderSummaryText(items, totals)

  if (summaryText) {
    lines.push('', summaryText)
  }

  return lines.join('\n');
}

// Order Summary helpers
type LineItem = { title?: string; qty?: number; price?: number }
type Totals = { subtotal: number; shipping: number; codFee: number; tax: number; grandTotal: number }

function renderSummary(items: LineItem[] = [], totals?: Totals){
  if (!items.length && !totals) return ''

  const rows = items.slice(0,20).map(li => {
    const title = li.title || '—'
    const qty = Number(li.qty || 0)
    const price = Number(li.price || 0)
    const line = (qty * price) || 0
    return `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee">${title}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${qty}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmtEUR(price)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmtEUR(line)}</td>
    </tr>`
  }).join('')

  const t = totals || { subtotal:0, shipping:0, codFee:0, tax:0, grandTotal:0 }

  return `
  <h3 style="margin:16px 0 8px 0">Σύνοψη παραγγελίας</h3>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#fafafa">
        <th align="left" style="padding:8px">Προϊόν</th>
        <th align="center" style="padding:8px">Ποσ.</th>
        <th align="right" style="padding:8px">Τιμή</th>
        <th align="right" style="padding:8px">Μερικό</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:10px;text-align:right;font-size:14px">
    <div>Υποσύνολο: <b>${fmtEUR(t.subtotal)}</b></div>
    <div>Μεταφορικά: <b>${fmtEUR(t.shipping)}</b></div>
    ${t.codFee ? `<div>Αντικαταβολή: <b>${fmtEUR(t.codFee)}</b></div>` : ''}
    ${t.tax ? `<div>Φόρος: <b>${fmtEUR(t.tax)}</b></div>` : ''}
    <div style="margin-top:4px;font-size:15px">Σύνολο: <b>${fmtEUR(t.grandTotal)}</b></div>
  </div>`
}

function renderSummaryText(items: LineItem[] = [], totals?: Totals){
  if (!items.length && !totals) return ''

  const lines = [
    '— Σύνοψη παραγγελίας —',
    ...items.slice(0,20).map(li => {
      const title = li.title || '—'
      const qty = Number(li.qty || 0)
      const price = Number(li.price || 0)
      const line = (qty * price) || 0
      return `${title} × ${qty} — ${fmtEUR(line)}`
    })
  ]

  if (totals){
    lines.push(
      `Υποσύνολο: ${fmtEUR(totals.subtotal)}`,
      `Μεταφορικά: ${fmtEUR(totals.shipping)}`,
      totals.codFee ? `Αντικαταβολή: ${fmtEUR(totals.codFee)}` : '',
      totals.tax ? `Φόρος: ${fmtEUR(totals.tax)}` : '',
      `Σύνολο: ${fmtEUR(totals.grandTotal)}`
    )
  }

  return lines.filter(Boolean).join('\n')
}
