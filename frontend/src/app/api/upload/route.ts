import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { extname } from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs'; // χρειάζεται fs

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Δεν βρέθηκε αρχείο' }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const max = 5 * 1024 * 1024; // 5MB

    if (buf.length > max) {
      return NextResponse.json({ error: 'Μέγιστο μέγεθος 5MB' }, { status: 400 });
    }

    const mime = file.type || 'application/octet-stream';
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(mime)) {
      return NextResponse.json({ error: 'Μόνο εικόνες (png, jpg, webp, gif)' }, { status: 400 });
    }

    const ext = (extname(file.name) || '').toLowerCase() ||
      (mime.includes('png') ? '.png' :
       mime.includes('jpeg') ? '.jpg' :
       mime.includes('jpg') ? '.jpg' :
       mime.includes('webp') ? '.webp' : '.bin');

    const id = crypto.randomUUID();
    const rel = `/uploads/${id}${ext}`;

    // Construct absolute path - handle both frontend/ and root contexts
    const publicPath = process.cwd().includes('frontend')
      ? join(process.cwd(), 'public', 'uploads')
      : join(process.cwd(), 'frontend', 'public', 'uploads');

    const absPath = join(publicPath, `${id}${ext}`);

    await mkdir(publicPath, { recursive: true });
    await writeFile(absPath, buf);

    return NextResponse.json({ url: rel });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e?.message || 'Σφάλμα upload' }, { status: 500 });
  }
}
