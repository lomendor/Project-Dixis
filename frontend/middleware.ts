import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildCsp } from './src/lib/csp'

function makeNonce() {
  // 16 bytes random base64
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Buffer.from(bytes).toString('base64');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  const nonce = makeNonce();
  const reportOnly = process.env.NEXT_ENABLE_CSP_REPORT_ONLY === 'true';
  const { header, value } = buildCsp(nonce, reportOnly);
  res.headers.set(header, value);
  // pass nonce to the client via header; _document will read it
  res.headers.set('x-nonce', nonce);
  return res;
}

export const config = {
  matcher: '/:path*',
};