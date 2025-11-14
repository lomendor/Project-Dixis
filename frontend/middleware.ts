import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/api/ci/:path*', '/api/dev/:path*', '/api/ops/test-error', '/api/ops/status'],
};

export default function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    // Προαιρετικό bypass με token
    const token = req.headers.get('x-ops-token');
    if (process.env.OPS_TOKEN && token === process.env.OPS_TOKEN) {
      return NextResponse.next();
    }
    // Απόκρυψη endpoints στην παραγωγή
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  return NextResponse.next();
}
