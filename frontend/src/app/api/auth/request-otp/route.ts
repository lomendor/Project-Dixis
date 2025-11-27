import { NextRequest, NextResponse } from 'next/server';
import { storeOtp, hasPendingOtp, getRemainingTime } from '@/lib/auth/otp-store';

/**
 * POST /api/auth/request-otp
 * Generates and stores OTP for phone verification
 *
 * In development: OTP is echoed back in response (OTP_DEV_ECHO=1)
 * In production: OTP should be sent via SMS provider
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

    // Check if admin bypass is enabled
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);
    const isAdmin = adminPhones.includes(phone);
    const bypassCode = process.env.OTP_BYPASS;

    if (isAdmin && bypassCode) {
      // Admin bypass - don't generate real OTP, use bypass code
      console.log(`[Auth] Admin OTP request for ${phone} - bypass enabled`);
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς',
        // In dev mode with bypass, hint the code
        ...(process.env.OTP_DEV_ECHO === '1' && { devCode: bypassCode })
      });
    }

    // Generate and store OTP
    const code = storeOtp(phone);

    // In development, echo OTP for testing (DO NOT use in production!)
    if (process.env.OTP_DEV_ECHO === '1') {
      console.log(`[Auth] DEV MODE - OTP for ${phone}: ${code}`);
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς',
        devCode: code // Only in dev mode!
      });
    }

    // Production: Send OTP via SMS provider
    // TODO: Integrate with Twilio/Vonage/Greek SMS provider
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
