import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/cookies';
import { verifyOtp } from '@/lib/auth/otp-store';

/**
 * POST /api/auth/verify-otp
 * Verifies OTP code and sets secure session cookie
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Τηλέφωνο και κωδικός απαιτούνται' },
        { status: 400 }
      );
    }

    // Check admin bypass first
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);
    const isAdmin = adminPhones.includes(phone);
    const bypassCode = process.env.OTP_BYPASS;

    let isValid = false;
    let errorMessage: string | undefined;

    if (isAdmin && bypassCode && code === bypassCode) {
      // Admin bypass - skip OTP verification
      console.log(`[Auth] Admin login bypass for ${phone}`);
      isValid = true;
    } else {
      // Normal OTP verification
      const result = verifyOtp(phone, code);
      isValid = result.valid;
      errorMessage = result.error;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: errorMessage || 'Λανθασμένος κωδικός OTP' },
        { status: 401 }
      );
    }

    // Success - create session
    const sessionType = isAdmin ? 'admin' : 'user';
    const sessionToken = `${sessionType}_${phone}_${Date.now()}`;

    console.log(`[Auth] Successful ${sessionType} login for ${phone}`);

    const response = NextResponse.json({
      success: true,
      message: 'Επιτυχής σύνδεση',
      phone
    });

    // Set secure session cookie
    setSessionCookie(response, sessionToken);

    return response;

  } catch (error) {
    console.error('[Auth] Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Αποτυχία επαλήθευσης' },
      { status: 500 }
    );
  }
}
