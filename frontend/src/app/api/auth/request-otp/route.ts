import { NextRequest, NextResponse } from 'next/server';
import { isAuthBypassAllowed, isDevEchoAllowed } from '@/lib/env';

/**
 * POST /api/auth/request-otp
 * Sends OTP code to user's phone
 *
 * Production guards:
 * - Admin bypass only works in non-production
 * - OTP echo only works in non-production with OTP_DEV_ECHO=1
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

    // Check if admin bypass is enabled (non-production only)
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);
    const isAdmin = adminPhones.includes(phone);

    if (isAdmin && isAuthBypassAllowed()) {
      // Admin bypass - only in dev/staging
      console.log(`[Auth] Admin OTP request for ${phone} - bypass enabled (non-production)`);
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς',
        // Echo bypass code in dev mode
        ...(isDevEchoAllowed() && { devCode: process.env.OTP_BYPASS })
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Store OTP and send via SMS provider (Twilio/Vonage)
    console.log(`[Auth] OTP request for ${phone}`);

    // Dev echo - only in non-production
    if (isDevEchoAllowed()) {
      console.log(`[Auth] DEV MODE - OTP for ${phone}: ${otp}`);
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς',
        devCode: otp // Only in dev mode with OTP_DEV_ECHO=1
      });
    }

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
