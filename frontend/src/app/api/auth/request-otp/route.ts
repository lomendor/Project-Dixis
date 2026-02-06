import { NextRequest, NextResponse } from 'next/server';
import { storeOtp, hasPendingOtp, getRemainingTime } from '@/lib/auth/otp-store';
import { isAuthBypassAllowed, isDevEchoAllowed } from '@/lib/env';
import { sendOtpEmail } from '@/lib/email';

/**
 * POST /api/auth/request-otp
 * Generates and stores OTP for phone verification
 *
 * Features:
 * - Rate limiting (429 if OTP pending)
 * - In-memory OTP storage with 5 min expiry
 * - Production guards (bypass only in non-production)
 * - Dev echo mode (OTP_DEV_ECHO=1)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Το τηλέφωνο είναι υποχρεωτικό' },
        { status: 400 }
      );
    }

    // Rate limiting - don't generate new OTP if one exists
    if (hasPendingOtp(phone)) {
      const remaining = getRemainingTime(phone);
      return NextResponse.json(
        { error: `Έχει ήδη σταλεί κωδικός. Περιμένετε ${remaining} δευτερόλεπτα.` },
        { status: 429 }
      );
    }

    // Check if admin bypass is enabled (non-production only)
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);
    const isAdmin = adminPhones.includes(phone);
    const bypassCode = process.env.OTP_BYPASS;

    if (isAdmin && bypassCode && isAuthBypassAllowed()) {
      // Admin bypass - only in dev/staging
      console.log(`[Auth] Admin OTP request for ${phone} - bypass enabled (non-production)`);
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς',
        // Echo bypass code in dev mode
        ...(isDevEchoAllowed() && { devCode: bypassCode })
      });
    }

    // Generate and store OTP
    const code = storeOtp(phone);

    // Dev echo - only in non-production with OTP_DEV_ECHO=1
    if (isDevEchoAllowed()) {
      console.log(`[Auth] DEV MODE - OTP for ${phone}: ${code}`);
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς',
        devCode: code // Only in dev mode!
      });
    }

    // Check if admin with email → send OTP via email
    // Use internal Laravel API instead of Prisma (more reliable connection)
    try {
      const internalApiUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8001';
      const adminLookupUrl = `${internalApiUrl}/api/admin-user-lookup?phone=${encodeURIComponent(phone)}`;

      const adminRes = await fetch(adminLookupUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // Short timeout to avoid blocking
        signal: AbortSignal.timeout(3000)
      });

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData?.email && adminData?.isActive) {
          console.log(`[Auth] Admin ${phone} - sending OTP via email`);
          const emailResult = await sendOtpEmail({
            toEmail: adminData.email,
            code,
            phone
          });

          if (emailResult.ok) {
            return NextResponse.json({
              success: true,
              message: 'Κωδικός OTP εστάλη στο email σας',
              method: 'email'
            });
          }
          console.warn('[Auth] Email OTP failed, falling back to SMS placeholder');
        }
      }
    } catch (lookupError) {
      console.warn('[Auth] Admin lookup failed:', lookupError instanceof Error ? lookupError.message : lookupError);
    }

    // Fallback: SMS provider (not implemented)
    console.log(`[Auth] OTP generated for ${phone} - SMS sending not implemented`);

    return NextResponse.json({
      success: true,
      message: 'Κωδικός OTP εστάλη επιτυχώς'
    });

  } catch (error) {
    console.error('[Auth] Request OTP error:', error);
    return NextResponse.json(
      { error: 'Αποτυχία αποστολής κωδικού' },
      { status: 500 }
    );
  }
}
