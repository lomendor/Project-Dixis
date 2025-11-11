import nodemailer from 'nodemailer';

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? '587');
  const secure = String(process.env.SMTP_SECURE ?? 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function sendOrderReceipt(params: {
  to: string;
  orderId: string;
  total: number;
  currency: string;
  items: Array<{
    slug: string;
    qty: number;
    price: number;
    currency: string;
  }>;
}) {
  const transport = getTransport();
  if (!transport) return { ok: false, reason: 'smtp-missing' };

  const { to, orderId, total, currency, items } = params;
  const lines = items
    .map(
      (it) =>
        `• ${it.slug} × ${it.qty} — ${Number(it.price).toFixed(2)} ${it.currency}`
    )
    .join('\n');
  const receiptUrl = `https://dixis.io/orders/receipt/${encodeURIComponent(orderId)}`;

  const text = [
    `Ευχαριστούμε για την παραγγελία σας!`,
    ``,
    `Κωδικός παραγγελίας: ${orderId}`,
    `Σύνολο: ${Number(total).toFixed(2)} ${currency}`,
    ``,
    `Είδη:`,
    lines || '—',
    ``,
    `Δείτε την απόδειξη: ${receiptUrl}`,
  ].join('\n');

  const from = process.env.MAIL_FROM || 'Dixis <no-reply@dixis.io>';
  await transport.sendMail({
    from,
    to,
    subject: `Dixis — Απόδειξη παραγγελίας #${orderId}`,
    text,
  });
  return { ok: true };
}
