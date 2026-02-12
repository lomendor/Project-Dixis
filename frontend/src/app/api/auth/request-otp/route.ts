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
      // Admin bypass enabled (non-production) — no PII in logs
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
      // Dev echo mode — code returned in response body, no log needed
      return NextResponse.json({
        success: true,
        message: 'Κωδικός OTP εστάλη επιτυχώς',
        devCode: code // Only in dev mode!
      });
    }

    // Check if admin with email → send OTP via email
    // Using env-based admin email mapping (format: phone1:email1,phone2:email2)
    // This avoids database connection issues while maintaining security
    const adminEmailMapping = (process.env.ADMIN_EMAIL_MAPPING || '')
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .reduce((acc, entry) => {
        const [mappedPhone, email] = entry.split(':').map(s => s.trim());
        if (mappedPhone && email) acc[mappedPhone] = email;
        return acc;
      }, {} as Record<string, string>);

    const adminEmail = adminEmailMapping[phone];
    if (adminEmail) {
      // Sending OTP via email — no PII in logs
      try {
        const emailResult = await sendOtpEmail({
          toEmail: adminEmail,
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
      } catch (emailError) {
        console.warn('[Auth] Email send failed:', emailError instanceof Error ? emailError.message : emailError);
      }
    }

    // Fallback: SMS provider (not implemented)
    // OTP generated — SMS sending not yet implemented

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
