import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';

// Rate limiting: 5 req/min per IP
const bucket = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || now > entry.reset) {
    bucket.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

// Field clipping
function clip(v: any, max: number): string {
  const s = String(v || '').trim();
  return s.length > max ? s.substring(0, max) : s;
}

export async function POST(req: Request){
  try{
    // Size guard: 4KB limit
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 4096) {
      return NextResponse.json({ ok: false, error: 'payload-too-large' }, { status: 413 });
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
    if (rateLimit(ip)) {
      return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
    }

    const b = await req.json();

    // Honeypot check (silent accept if website filled)
    if (clip(b?.website, 256)) {
      return new NextResponse(null, { status: 204 });
    }

    // Field validation & clipping
    const name = clip(b?.name, 256);
    const phone = clip(b?.phone, 256);
    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }

    const email = clip(b?.email, 256);
    const region = clip(b?.region, 256);
    const products = clip(b?.products, 256);
    const notes = clip(b?.notes, 512);

    const lines = [
      `Όνομα/Επωνυμία: ${name}`,
      `Τηλέφωνο: ${phone}`,
      `Email: ${email || '-'}`,
      `Περιοχή: ${region || '-'}`,
      `Προϊόντα: ${products || '-'}`,
      `Σημειώσεις: ${notes || '-'}`,
      `Χρόνος: ${new Date(b?.ts || Date.now()).toISOString()}`
    ].join('\n');

    const to = process.env.ADMIN_EMAIL || '';
    if (!to) {
      return NextResponse.json({ ok: false, error: 'no-admin' }, { status: 500 });
    }

    await sendMail({ to, subject: 'Dixis — Νέος παραγωγός (waitlist)', text: lines });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'waitlist-failed' }, { status: 500 });
  }
}
