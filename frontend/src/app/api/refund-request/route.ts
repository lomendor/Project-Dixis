import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendMail } from '@/lib/mail';

const Schema = z.object({
  orderId: z.number().int().positive(),
  reason: z.string().min(10, 'Ο λόγος πρέπει να είναι τουλάχιστον 10 χαρακτήρες').max(2000),
  email: z.string().email('Μη έγκυρο email'),
  name: z.string().max(80).optional(),
  hp: z.string().optional(), // honeypot
});

// Rate limiting — 5 requests / 10 minutes per IP
const BUCKET = new Map<string, { c: number; t: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = 5;

function allow(ip: string) {
  const now = Date.now();
  const k = ip || 'unknown';
  const v = BUCKET.get(k) ?? { c: 0, t: now };
  if (now - v.t > WINDOW_MS) { v.c = 0; v.t = now; }
  v.c++;
  BUCKET.set(k, v);
  return v.c <= MAX_REQ;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allow(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 422 });
  }

  // Honeypot check
  if (parsed.data.hp && parsed.data.hp.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const { orderId, reason, email, name } = parsed.data;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const adminTo = process.env.ADMIN_EMAIL ?? 'info@dixis.gr';

  // Email to admin
  const adminHtml = `
<h2>Αίτημα Επιστροφής</h2>
<p><b>Παραγγελία:</b> #${orderId}</p>
<p><b>Πελάτης:</b> ${name ? esc(name) + ' — ' : ''}${esc(email)}</p>
<p><b>Λόγος:</b><br/>${esc(reason).replace(/\n/g, '<br/>')}</p>
<p><b>Ημερομηνία:</b> ${new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}</p>
<hr/>
<p><small>Διαχείριση: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dixis.gr'}/admin/orders/${orderId}">Admin Panel</a></small></p>`;

  await sendMail(adminTo, `Αίτημα Επιστροφής — Παραγγελία #${orderId}`, adminHtml, email);

  // Autoreply to customer
  try {
    await sendMail(
      email,
      'Λάβαμε το αίτημα επιστροφής σας — Dixis',
      `<p>Αγαπητέ/ή πελάτη,</p>
<p>Λάβαμε το αίτημα επιστροφής για την παραγγελία <b>#${orderId}</b>.</p>
<p>Θα το εξετάσουμε και θα επικοινωνήσουμε μαζί σας εντός <b>2 εργάσιμων ημερών</b>.</p>
<p>Ευχαριστούμε,<br/>Η ομάδα Dixis</p>`
    );
  } catch { /* autoreply failure should not block */ }

  return NextResponse.json({ ok: true });
}
