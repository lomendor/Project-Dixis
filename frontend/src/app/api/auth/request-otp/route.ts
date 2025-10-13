import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/request-otp
 * Αποστέλλει OTP κωδικό στο τηλέφωνο χρήστη
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

    // Έλεγχος αν το τηλέφωνο είναι admin (για bypass)
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim());
    const isAdmin = adminPhones.includes(phone);

    if (isAdmin) {
      // Για admin phones, bypass OTP send (dev mode)
      console.log(`[Auth] Admin OTP request for ${phone} - bypass enabled`);
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς'
      });
    }

    // TODO: Πραγματική αποστολή OTP μέσω SMS provider (Twilio/Vonage)
    console.log(`[Auth] OTP request for ${phone}`);

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
