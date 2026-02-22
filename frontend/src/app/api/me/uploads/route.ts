import { NextResponse } from 'next/server';
import { putObject } from '@/lib/media/storage';
import { getSessionPhone } from '@/lib/auth/session';

export const runtime = 'nodejs';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX = 10 * 1024 * 1024; // 10MB limit (PDFs can be larger)

/**
 * Validate Laravel Sanctum Bearer token by calling Laravel /api/v1/user.
 * Returns true if the token is valid (any authenticated role).
 */
async function validateLaravelToken(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const laravelBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.LARAVEL_API_URL || 'http://127.0.0.1:8001/api/v1';
  try {
    const resp = await fetch(`${laravelBase}/user`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Auth: Support both admin phone-session AND Laravel Sanctum Bearer token
  const phone = await getSessionPhone();
  const hasLaravelAuth = !phone ? await validateLaravelToken(req) : false;

  if (!phone && !hasLaravelAuth) {
    return new NextResponse('Auth required', { status: 401 });
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
