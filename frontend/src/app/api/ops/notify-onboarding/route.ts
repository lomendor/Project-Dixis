import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';
import { getSessionPhone } from '@/lib/auth/session';

/**
 * Onboarding V2: Notify admin when a producer submits onboarding.
 * Called fire-and-forget from the onboarding form — failure is non-blocking.
 * Auth: OTP session cookie (dixis_session) OR Laravel session cookies.
 */

async function validateLaravelSession(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return false;

  // Use internal Laravel URL — NOT NEXT_PUBLIC_API_BASE_URL which points to Next.js itself
  const laravelOrigin = process.env.LARAVEL_INTERNAL_URL || 'http://127.0.0.1:8001';
  try {
    const resp = await fetch(`${laravelOrigin}/api/user`, {
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json',
        'Referer': 'https://dixis.gr/',
        'Origin': 'https://dixis.gr',
      },
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Auth check — support both OTP session and Laravel session
  const phone = await getSessionPhone();
  const hasLaravelAuth = !phone ? await validateLaravelSession(req) : false;

  if (!phone && !hasLaravelAuth) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const businessName = String(body.business_name || '').slice(0, 200);
    const phoneField = String(body.phone || '').slice(0, 50);
    const email = String(body.email || '').slice(0, 200);
    const city = String(body.city || '').slice(0, 100);
    const categories = Array.isArray(body.product_categories)
      ? body.product_categories.join(', ')
      : '-';

    const to = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFY_EMAIL || '';
    if (!to) {
      console.warn('[notify-onboarding] No ADMIN_EMAIL configured');
      return NextResponse.json({ ok: false, reason: 'no-admin-email' }, { status: 200 });
    }

    const text = [
      `Νέα αίτηση παραγωγού στο Dixis!`,
      ``,
      `Επωνυμία: ${businessName}`,
      `Τηλέφωνο: ${phoneField}`,
      `Email: ${email || '-'}`,
      `Πόλη: ${city || '-'}`,
      `Κατηγορίες: ${categories}`,
      ``,
      `→ Δες την αίτηση: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.gr'}/admin/producers?status=pending`,
      ``,
      `Χρόνος: ${new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}`,
    ].join('\n');

    await sendMail({
      to,
      subject: `Dixis — Νέα αίτηση παραγωγού: ${businessName}`,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('[notify-onboarding] Failed:', e);
    // Non-blocking — return success even on mail failure
    return NextResponse.json({ ok: false, reason: 'mail-failed' }, { status: 200 });
  }
}
