import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage/driver';

export const runtime = 'nodejs';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  // Auth is handled by middleware - this route is already protected
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'file missing' }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'type not allowed' }, { status: 415 });
    }

    if (file.size > MAX) {
      return NextResponse.json({ error: 'too large' }, { status: 413 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();
    const result = await storage.putObject({ contentType: file.type, body: buf });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'upload failed' },
      { status: 500 }
    );
  }
}
