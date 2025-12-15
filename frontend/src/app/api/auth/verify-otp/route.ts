import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { setSessionCookie } from '@/lib/auth/cookies';
import { verifyOtp } from '@/lib/auth/otp-store';
import { isAuthBypassAllowed } from '@/lib/env';

/**
 * POST /api/auth/verify-otp
 * Verifies OTP code and sets secure session cookie
 *
 * Features:
 * - In-memory OTP validation (5 min expiry, 3 max attempts)
 * - Production guards (admin bypass only in non-production)
 * - Secure session with 7-day expiry
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

    // Check admin bypass (non-production only)
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);
    const isAdmin = adminPhones.includes(phone);
    const bypassCode = process.env.OTP_BYPASS;

    // SECURITY: Never allow bypass in production
    const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';

    let isValid = false;
    let errorMessage: string | undefined;

    if (isAdmin && bypassCode && code === bypassCode && isAuthBypassAllowed() && !isProd) {
      // Admin bypass - only in dev/staging, NEVER in production
      console.log(`[Auth] Admin login bypass for ${phone} (non-production)`);
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

    // Success - create session with JWT
    const JWT_SECRET = process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET must be set in environment');
    })();

    const sessionType = isAdmin ? 'admin' : 'user';
    const sessionToken = jwt.sign(
      { phone, type: sessionType, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256', issuer: 'dixis-auth', subject: phone }
    );

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
