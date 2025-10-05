import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  // Basic Auth protection
  const BA = process.env.BASIC_AUTH || '';
  const hdr = req.headers.get('authorization') || '';
  const expected = BA ? 'Basic ' + Buffer.from(BA).toString('base64') : '';
  if (!BA || hdr !== expected) {
    return new NextResponse('Auth required', { status: 401 });
  }

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
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const name = randomUUID() + '.' + ext;
    const root = process.cwd();
    const dir = path.join(root, 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buf);
    const url = '/uploads/' + name;

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
