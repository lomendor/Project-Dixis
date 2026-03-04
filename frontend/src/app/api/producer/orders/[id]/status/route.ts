import { NextRequest, NextResponse } from 'next/server';
import { verifySanctumProducer } from '@/lib/auth/verifySanctumProducer';
import { getLaravelInternalUrl } from '@/env';

/**
 * Proxy POST /api/producer/orders/:id/status -> Laravel
 *
 * P0-SEC-01: This route MUST exist in Next.js so that unauthenticated
 * requests return 401 JSON (not 404 HTML). The deploy security smoke
 * test verifies this endpoint returns 401, confirming nginx routes
 * /api/producer/* to Next.js (not Laravel directly).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  const { id } = await params;

  try {
    const body = await req.text();
    const res = await fetch(
      `${getLaravelInternalUrl()}/producer/orders/${id}/status`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': auth.cookieHeader,
          'Referer': 'https://dixis.gr',
          'Origin': 'https://dixis.gr',
        },
        body,
        cache: 'no-store',
      },
    );

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { message: 'Backend unreachable' },
      { status: 502 },
    );
  }
}
