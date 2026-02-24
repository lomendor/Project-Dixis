import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  svg: 'image/svg+xml',
};

/**
 * Serve uploaded files from the public/uploads/ directory.
 *
 * Next.js standalone mode does NOT serve dynamically-created files from public/.
 * This route handler fills that gap until an nginx location block is configured.
 *
 * Path: GET /uploads/202602/abc123.png -> reads from CWD/public/uploads/202602/abc123.png
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Security: reject directory traversal
  const joined = segments.join('/');
  if (joined.includes('..') || joined.includes('\\')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // Smart path detection — same logic as storage.ts putObjectFs()
  const cwd = process.cwd();
  let filePath: string;
  if (existsSync(join(cwd, 'public', 'uploads'))) {
    filePath = join(cwd, 'public', 'uploads', ...segments);
  } else if (existsSync(join(cwd, 'frontend', 'public', 'uploads'))) {
    filePath = join(cwd, 'frontend', 'public', 'uploads', ...segments);
  } else {
    filePath = join(cwd, 'public', 'uploads', ...segments);
  }

  // Verify file exists and is a regular file
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ext = segments[segments.length - 1]?.split('.').pop()?.toLowerCase() || '';
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const buf = await readFile(filePath);
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const data = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(data.length),
        'Cache-Control': 'public, max-age=2592000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Read error' }, { status: 500 });
  }
}
