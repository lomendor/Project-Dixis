import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendMail } from '@/lib/mail';

const Schema = z.object({
  email: z.string().email('Μη έγκυρο email'),
});

// Rate limiting — 10 requests / 10 minutes per IP
const BUCKET = new Map<string, { c: number; t: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = 10;

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

  const { email } = parsed.data;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const adminTo = process.env.ADMIN_EMAIL ?? 'info@dixis.gr';

  await sendMail(
    adminTo,
    `Αίτημα Διαγραφής — ${esc(email)}`,
    `<p>Ο χρήστης <b>${esc(email)}</b> ζήτησε διαγραφή από τη λίστα ενημερώσεων.</p>
<p><b>Ημερομηνία:</b> ${new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}</p>`,
    email
  );

  return NextResponse.json({ ok: true });
}
