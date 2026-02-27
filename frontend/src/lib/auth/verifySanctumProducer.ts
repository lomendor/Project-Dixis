import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getLaravelInternalUrl } from '@/env';

/**
 * FIX-PRODUCER-AUTH-01: Verify producer identity via Laravel Sanctum cookie forwarding.
 *
 * Why this exists:
 * Producers authenticate via Laravel Sanctum (sets `dixis_session` + `XSRF-TOKEN` cookies).
 * The old `requireProducer()` reads `dixis_jwt` cookie — which is ONLY set by admin OTP flow.
 * Producers NEVER have `dixis_jwt`, so requireProducer() always returns 401.
 *
 * This helper forwards the browser's Sanctum cookies to Laravel's `/api/v1/user` endpoint
 * to verify the producer's identity, then returns the cookie header for subsequent
 * requests to Laravel.
 *
 * Returns:
 * - On success: { ok: true, user, cookieHeader } — cookieHeader can be forwarded to Laravel
 * - On failure: { ok: false, response } — pre-built NextResponse to return immediately
 */
type SanctumSuccess = { ok: true; user: { id: number; role: string; name: string; email: string }; cookieHeader: string };
type SanctumFailure = { ok: false; response: NextResponse };
export type SanctumResult = SanctumSuccess | SanctumFailure;

export async function verifySanctumProducer(): Promise<SanctumResult> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

  if (!cookieHeader) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      ),
    };
  }

  try {
    const laravelBase = getLaravelInternalUrl();
    const authRes = await fetch(`${laravelBase}/user`, {
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieHeader,
        'Referer': 'https://dixis.gr',
        'Origin': 'https://dixis.gr',
      },
      cache: 'no-store',
    });

    if (!authRes.ok) {
      console.error('[FIX-PRODUCER-AUTH-01] Laravel auth check failed:', authRes.status);
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Unauthenticated' },
          { status: 401 }
        ),
      };
    }

    const user = await authRes.json();
    if (user?.role !== 'producer') {
      console.warn('[FIX-PRODUCER-AUTH-01] User is not a producer:', user?.role);
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Forbidden — producer role required' },
          { status: 403 }
        ),
      };
    }

    return { ok: true, user, cookieHeader };
  } catch (error) {
    console.error('[FIX-PRODUCER-AUTH-01] Auth verification error:', error);
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Auth verification failed' },
        { status: 401 }
      ),
    };
  }
}
