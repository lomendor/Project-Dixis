import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/session
 * Store Laravel auth token in httpOnly cookie for server-side access
 *
 * Pass AUTH-UNIFY-02: Enable Laravel-based admin auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, user } = body;

    if (!token || !user) {
      return NextResponse.json({ error: 'Missing token or user' }, { status: 400 });
    }

    const cookieStore = await cookies();

    // Store Laravel session info
    cookieStore.set('laravel_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    cookieStore.set('laravel_user', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Auth Session] Error storing session:', error);
    return NextResponse.json({ error: 'Failed to store session' }, { status: 500 });
  }
}

/**
 * GET /api/auth/session
 * Get current Laravel session info
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('laravel_user');
    const tokenCookie = cookieStore.get('laravel_token');

    if (!userCookie?.value || !tokenCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);

    return NextResponse.json({
      authenticated: true,
      user,
      hasToken: true,
    });
  } catch (error) {
    console.error('[Auth Session] Error reading session:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

/**
 * DELETE /api/auth/session
 * Clear Laravel session cookies
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('laravel_token');
    cookieStore.delete('laravel_user');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Auth Session] Error clearing session:', error);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
