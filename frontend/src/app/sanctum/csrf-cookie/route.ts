/**
 * Proxy route: /sanctum/csrf-cookie → Laravel internal
 *
 * Nginx routes /sanctum/* to Next.js (catch-all location /), but Laravel
 * Sanctum's CSRF cookie endpoint lives on the Laravel backend.
 * This route proxies the request server-side to Laravel (port 8001)
 * and forwards the Set-Cookie headers back to the browser.
 *
 * Without this, customer login fails with 419 CSRF token mismatch.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Resolve Laravel base URL (strip /api/v1 suffix)
  const internalBase = (
    process.env.INTERNAL_API_URL ||
    process.env.LARAVEL_INTERNAL_URL ||
    'http://127.0.0.1:8001/api/v1'
  ).replace(/\/api\/v1\/?$/, '');

  const csrfUrl = `${internalBase}/sanctum/csrf-cookie`;

  const upstream = await fetch(csrfUrl, {
    headers: {
      'Accept': 'application/json',
      'Host': request.headers.get('host') || 'dixis.gr',
    },
    credentials: 'include',
  });

  // Build response, forwarding status + Set-Cookie headers
  const res = new NextResponse(null, { status: upstream.status });

  // Forward all Set-Cookie headers (XSRF-TOKEN + laravel_session)
  const cookies = upstream.headers.getSetCookie();
  for (const cookie of cookies) {
    res.headers.append('Set-Cookie', cookie);
  }

  return res;
}
