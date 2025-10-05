import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

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
