import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { setSessionCookie } from '@/lib/auth/cookies';
import { verifyOtp } from '@/lib/auth/otp-store';
import { isAuthBypassAllowed } from '@/lib/env';
import { prisma } from '@/lib/db/client';
import { authRateLimit, withRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/auth/verify-otp
 * Verifies OTP code and sets secure session cookie
 *
 * PR-SEC-01: Rate limiting (5 req / 15 min per IP)
 * PR-SEC-02: Admin sessions 24h, user sessions 7d
 *
 * Features:
 * - Rate limiting to prevent brute-force OTP attacks
 * - In-memory OTP validation (5 min expiry, 3 max attempts)
 * - Production guards (admin bypass only in non-production)
 * - Admin-specific shorter session expiry
 */
export async function POST(req: NextRequest) {
  // PR-SEC-01: Rate limit — 5 requests per 15 minutes per IP
  const blocked = await withRateLimit(authRateLimit)(req);
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Τηλέφωνο και κωδικός απαιτούνται' },
        { status: 400 }
      );
    }

    // Pass FIX-ADMIN-WHITELIST-SYNC-01: Normalize phone for consistent matching
    const phoneNorm = phone.trim();

    // Check admin bypass (non-production only)
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);
    const isAdmin = adminPhones.includes(phoneNorm);
    const bypassCode = process.env.OTP_BYPASS;

    // SECURITY: Never allow bypass in production
    const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';

    let isValid = false;
    let errorMessage: string | undefined;

    if (isAdmin && bypassCode && code === bypassCode && isAuthBypassAllowed() && !isProd) {
      // Admin bypass - only in dev/staging, NEVER in production
      // Admin bypass accepted (non-production) — no PII in logs
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
    // PR-SEC-02: Admin sessions expire in 24h (security), user sessions in 7d
    const sessionExpiry = isAdmin ? '24h' : '7d';
    const sessionToken = jwt.sign(
      { phone: phoneNorm, type: sessionType, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: sessionExpiry, algorithm: 'HS256', issuer: 'dixis-auth', subject: phoneNorm }
    );

    // Successful login — session type tracked via JWT, no PII in logs

    // Pass FIX-ADMIN-WHITELIST-SYNC-01: Sync admin to database whitelist
    // This ensures requireAdmin() database check passes for admins in ADMIN_PHONES
    if (isAdmin) {
      try {
        await prisma.adminUser.upsert({
          where: { phone: phoneNorm },
          update: { isActive: true },
          create: { phone: phoneNorm, role: 'admin', isActive: true }
        });
        // AdminUser synced to DB whitelist — no PII in logs
      } catch (dbError) {
        // Pass PROD-BUGFIX-ADMIN-DB-01: Log clearly so ops can see migration is needed.
        // Login still succeeds (JWT has type:'admin'), but requireAdmin() will fail
        // on the DB check until the AdminUser table exists and this upsert succeeds.
        console.error('[Auth] Failed to sync AdminUser (run prisma migrate deploy):', dbError);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Επιτυχής σύνδεση',
      phone: phoneNorm
    });

    // Set secure session cookie (PR-SEC-02: admin 24h, user 7d)
    const cookieMaxAge = isAdmin ? 60 * 60 * 24 : 60 * 60 * 24 * 7;
    setSessionCookie(response, sessionToken, cookieMaxAge);

    return response;

  } catch (error) {
    console.error('[Auth] Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Αποτυχία επαλήθευσης' },
      { status: 500 }
    );
  }
}
