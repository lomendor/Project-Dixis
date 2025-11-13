import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';

// Rate limiting: 10 req/min per IP
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const _bucket = new Map<string, { c: number; ts: number }>();

function ipOf(req: Request): string {
  const get = (n: string) => (req.headers.get(n) || '') + '';
  const xff = (get('x-forwarded-for') || get('cf-connecting-ip') || get('x-real-ip')).split(',')[0].trim();
  return xff || 'unknown';
}

function allow(ip: string): boolean {
  const now = Date.now();
  const v = _bucket.get(ip);
  if (!v || now - v.ts > RATE_LIMIT_WINDOW_MS) {
    _bucket.set(ip, { c: 1, ts: now });
    return true;
  }
  v.c++;
  v.ts = now;
  _bucket.set(ip, v);
  return v.c <= RATE_LIMIT_MAX;
}

// Field clipping
function clip(v: any, n = 256): string {
  return (v ?? '').toString().trim().slice(0, n);
}

export async function POST(req: Request) {
  try {
    // Size guard: 8KB limit
    const len = Number(req.headers.get('content-length') || '0');
    if (len > 8192) {
      return NextResponse.json({ ok: false, error: 'payload-too-large' }, { status: 413 });
    }

    // Rate limiting
    const ip = ipOf(req);
    if (!allow(ip)) {
      return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 });
    }

    const body = await req.json();

    // Optional header check (x-flow: checkout)
    const reqhdr = (req.headers.get('x-flow') || '').toString();
    if (reqhdr && reqhdr !== 'checkout') {
      return NextResponse.json({ ok: false, error: 'bad-origin' }, { status: 400 });
    }

    // Field clipping and validation
    const customer = {
      name: clip(body?.customer?.name || body?.customer?.fullName || body?.name),
      phone: clip(body?.customer?.phone || body?.phone, 32),
      email: clip(body?.customer?.email || body?.email, 128),
      address: clip(body?.customer?.address || body?.address, 256),
      city: clip(body?.customer?.city || body?.city, 128),
      postcode: clip(body?.customer?.postcode || body?.postcode, 16),
      notes: clip(body?.customer?.notes || body?.notes, 512),
    };

    if (!customer.name || !customer.phone) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }

    const to = process.env.ADMIN_EMAIL;
    if (!to) {
      return NextResponse.json({ ok: false, error: 'no-admin-email' }, { status: 500 });
    }

    const items = Array.isArray(body?.items) ? body.items : [];
    const lines = items.map((it: any) =>
      `• ${clip(it.title, 80)} × ${Number(it.qty || 1)} — ${(Number(it.price || 0) * Number(it.qty || 1)).toFixed(2)} ${it.currency || 'EUR'}`
    ).join('\n');

    const text = [
      'ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ (demo)',
      '',
      `Πελάτης: ${customer.name}`,
      `Τηλέφωνο: ${customer.phone}`,
      `Email: ${customer.email || '-'}`,
      `Διεύθυνση: ${customer.address}, ${customer.city} ${customer.postcode}`,
      `Σημειώσεις: ${customer.notes || '-'}`,
      '',
      'Είδη:',
      lines || '-',
      '',
      `Σύνολο: ${Number((body?.totals?.grand ?? body?.totals?.items) || 0).toFixed(2)} EUR`,
    ].join('\n');

    await sendMail({ to, subject: 'Dixis — Νέα παραγγελία (demo)', text });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'email-failed' }, { status: 500 });
  }
}
