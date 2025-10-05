import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/api/producers/:path*', '/api/uploads'],
};

export function middleware(req: NextRequest) {
  const BA = process.env.BASIC_AUTH || '';
  if (!BA) return NextResponse.next();

  const hdr = req.headers.get('authorization') || '';
  const expected = 'Basic ' + Buffer.from(BA).toString('base64');

  if (hdr !== expected) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Dixis Admin"',
      },
    });
  }

  return NextResponse.next();
}
