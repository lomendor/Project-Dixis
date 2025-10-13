import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/cookies';

/**
 * POST /api/auth/verify-otp
 * Επαληθεύει OTP κωδικό και ορίζει session cookie με ασφαλή attributes
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

    // Έλεγχος αν το τηλέφωνο είναι admin (για bypass)
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim());
    const isAdmin = adminPhones.includes(phone);
    const bypassCode = process.env.OTP_BYPASS;

    if (isAdmin && bypassCode && code === bypassCode) {
      // Bypass για admin phones με τον bypass code
      console.log(`[Auth] Admin login bypass for ${phone}`);

      // Δημιουργία session token
      const sessionToken = `admin_${phone}_${Date.now()}`;

      const response = NextResponse.json({
        success: true,
        message: 'Επιτυχής σύνδεση',
        phone
      });

      // Ορισμός secure session cookie
      setSessionCookie(response, sessionToken);

      return response;
    }

    // TODO: Πραγματική επαλήθευση OTP (με database ή cache)
    // Προς το παρόν, απλή επαλήθευση μόνο για admin
    console.log(`[Auth] OTP verification for ${phone}`);

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
