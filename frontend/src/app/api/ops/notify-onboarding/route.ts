import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';
import { getSessionPhone } from '@/lib/auth/session';

/**
 * Onboarding V2: Notify admin when a producer submits onboarding.
 * Called fire-and-forget from the onboarding form — failure is non-blocking.
 * Auth: OTP session cookie (dixis_session) or Laravel Sanctum Bearer token.
 */

export async function POST(req: Request) {
  // Auth check — support both OTP session and Bearer token
  const phone = await getSessionPhone();
  if (!phone) {
    return new NextResponse('Auth required', { status: 401 });
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
