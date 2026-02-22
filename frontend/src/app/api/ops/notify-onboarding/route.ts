import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';

/**
 * Onboarding V2: Notify admin when a producer submits onboarding.
 * Called fire-and-forget from the onboarding form — failure is non-blocking.
 * Auth: requires Laravel Sanctum Bearer token (producer role).
 */

async function validateLaravelToken(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const laravelBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.LARAVEL_API_URL ||
    'http://127.0.0.1:8001/api/v1';
  try {
    const resp = await fetch(`${laravelBase}/user`, {
      headers: { Authorization: authHeader, Accept: 'application/json' },
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Auth check — must be authenticated
  const isAuth = await validateLaravelToken(req);
  if (!isAuth) {
    return new NextResponse('Auth required', { status: 401 });
  }

  try {
    const body = await req.json();
    const businessName = String(body.business_name || '').slice(0, 200);
    const phone = String(body.phone || '').slice(0, 50);
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
      `Τηλέφωνο: ${phone}`,
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
