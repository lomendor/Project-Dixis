import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/cookies';
import { isAuthBypassAllowed, isProduction } from '@/lib/env';

/**
 * POST /api/auth/verify-otp
 * Verifies OTP code and sets secure session cookie
 *
 * Production guards:
 * - Admin bypass only works in non-production
 * - Session type reflects admin vs user
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

    // Admin bypass - only allowed in non-production
    if (isAdmin && bypassCode && code === bypassCode && isAuthBypassAllowed()) {
      console.log(`[Auth] Admin login bypass for ${phone} (non-production)`);

      const sessionToken = `admin_${phone}_${Date.now()}`;

      const response = NextResponse.json({
        success: true,
        message: 'Επιτυχής σύνδεση',
        phone
      });

      setSessionCookie(response, sessionToken);
      return response;
    }

    // Production mode - reject if admin bypass attempted
    if (isAdmin && bypassCode && code === bypassCode && isProduction()) {
      console.warn(`[Auth] Admin bypass attempted in PRODUCTION for ${phone} - REJECTED`);
      return NextResponse.json(
        { error: 'Λανθασμένος κωδικός OTP' },
        { status: 401 }
      );
    }

    // TODO: Implement real OTP verification (database/cache)
    // For now, only admin bypass works in non-production
    console.log(`[Auth] OTP verification for ${phone} - awaiting real implementation`);

    return NextResponse.json(
      { error: 'Λανθασμένος κωδικός OTP' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[Auth] Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Αποτυχία επαλήθευσης' },
      { status: 500 }
    );
  }
}
