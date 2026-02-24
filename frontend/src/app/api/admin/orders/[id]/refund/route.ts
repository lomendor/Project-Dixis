import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';

export const dynamic = 'force-dynamic';

/**
 * T0-03: Admin refund proxy -- POST creates refund, GET returns refund info.
 * Proxies to Laravel RefundController endpoints.
 */

function getLaravelId(rawId: string): string {
  return rawId.startsWith('A-') ? rawId.slice(2) : rawId;
}

export async function GET(_req: Request, ctx: { params: { id: string } }): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const laravelId = getLaravelId(ctx.params.id);
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  const apiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  const res = await fetch(`${apiBase}/refunds/orders/${laravelId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch refund info' }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(req: Request, ctx: { params: { id: string } }): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const laravelId = getLaravelId(ctx.params.id);
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  const body = await req.json();
  const apiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  const res = await fetch(`${apiBase}/refunds/orders/${laravelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
