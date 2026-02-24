import { NextResponse } from 'next/server';
import { putObject } from '@/lib/media/storage';
import { getSessionPhone } from '@/lib/auth/session';

export const runtime = 'nodejs';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX = 10 * 1024 * 1024; // 10MB limit (PDFs can be larger)

/**
 * Validate Laravel Sanctum session by forwarding cookies to Laravel /api/user.
 * Works for regular users who login via email/password (not OTP).
 * The browser sends laravel_session + XSRF-TOKEN cookies via credentials: 'include'.
 *
 * IMPORTANT: Laravel's auth route is /api/user (NOT /api/v1/user).
 * We call the Laravel backend directly (127.0.0.1:8001), not through the
 * public URL which would loop back through Next.js.
 */
async function validateLaravelSession(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return false;

  // Use internal Laravel URL — NOT NEXT_PUBLIC_API_BASE_URL which points to Next.js itself
  const laravelOrigin = process.env.LARAVEL_INTERNAL_URL || 'http://127.0.0.1:8001';
  try {
    const resp = await fetch(`${laravelOrigin}/api/user`, {
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json',
      },
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Auth: Support both admin OTP session AND regular user Laravel session
  const phone = await getSessionPhone();
  const hasLaravelAuth = !phone ? await validateLaravelSession(req) : false;

  if (!phone && !hasLaravelAuth) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const form = await (req as any).formData().catch((): null => null);
  if (!form) return NextResponse.json({ error: 'No formdata' }, { status: 400 });

  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: 'type not allowed' }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: 'too large' }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const result = await putObject(buf, file.type).catch((e: any): { error: string } => ({
    error: e?.message || 'upload failed'
  }));
  if ((result as any).error) return NextResponse.json(result, { status: 500 });
  return NextResponse.json(result);
}
