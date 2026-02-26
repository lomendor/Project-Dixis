import { NextResponse } from 'next/server';
import { putObject } from '@/lib/media/storage';
import { getSessionPhone } from '@/lib/auth/session';

export const runtime = 'nodejs';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX = 10 * 1024 * 1024; // 10MB limit (PDFs can be larger)

/**
 * Validate Laravel Sanctum session by forwarding cookies to Laravel /api/user.
 * Works for regular users who login via email/password (not OTP).
 * The browser sends dixis_session + XSRF-TOKEN cookies via credentials: 'include'.
 *
 * IMPORTANT: We call Laravel directly at 127.0.0.1:8001 (not through nginx/Next.js).
 * Referer/Origin headers are required so Sanctum treats this as a stateful SPA request
 * and authenticates via the web session guard (not Bearer token).
 *
 * FIX-UPLOAD-AUTH-01: LARAVEL_INTERNAL_URL includes /api/v1 suffix, so we strip it
 * and use the base origin for the /api/user endpoint (no /v1/ prefix).
 */
async function validateLaravelSession(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return false;

  // Extract base origin from LARAVEL_INTERNAL_URL (strip /api/v1 suffix if present)
  const rawUrl = process.env.LARAVEL_INTERNAL_URL || 'http://127.0.0.1:8001';
  const laravelOrigin = rawUrl.replace(/\/api\/v\d+\/?$/, '');
  try {
    const resp = await fetch(`${laravelOrigin}/api/user`, {
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json',
        'Referer': 'https://dixis.gr/',
        'Origin': 'https://dixis.gr',
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
  if ('error' in result) return NextResponse.json(result, { status: 500 });

  // FIX-UPLOAD-URL-01: Ensure url is absolute so Laravel 'url' validation passes.
  // putObjectFs returns relative paths like /uploads/202602/abc.jpg — prepend base URL.
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.gr';
  if (result.url.startsWith('/')) {
    result.url = `${base.replace(/\/+$/, '')}${result.url}`;
  }

  return NextResponse.json(result);
}
