import { NextResponse } from 'next/server';
import { putObject } from '@/lib/media/storage';
import { getSessionPhone } from '@/lib/auth/session';

export const runtime = 'nodejs';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 5 * 1024 * 1024; // 5MB limit

export async function POST(req: Request) {
  const phone = await getSessionPhone();
  if (!phone) return new NextResponse('Auth required', { status: 401 });

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
