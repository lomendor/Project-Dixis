import { NextResponse } from 'next/server';

export const config = { matcher: ['/admin/:path*'] };

export function middleware(req: Request) {
  const BA = process.env.BASIC_AUTH || '';
  if (!BA) return NextResponse.next();

  const hdr = (req as any).headers.get('authorization') || '';
  const expected = 'Basic ' + Buffer.from(BA).toString('base64');

  if (hdr !== expected) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Dixis Admin"' }
    });
  }

  return NextResponse.next();
}
