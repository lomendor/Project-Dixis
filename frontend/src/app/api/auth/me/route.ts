import { NextResponse } from 'next/server';
import { getSessionPhone, getSessionType } from '@/lib/auth/session';

/**
 * GET /api/auth/me
 * Returns session info from JWT cookie
 *
 * Pass ADMIN-AUTHGUARD-01: Sync client auth state with server JWT
 */
export async function GET() {
  try {
    const phone = await getSessionPhone();
    const type = await getSessionType();

    if (!phone) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      phone,
      type, // 'admin' | 'user'
      role: type === 'admin' ? 'admin' : 'consumer',
    });
  } catch (error) {
    console.error('[Auth Me] Error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
