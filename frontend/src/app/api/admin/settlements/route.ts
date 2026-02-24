import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

/** Pass PAYOUT-03: Proxy GET /api/admin/settlements -> Laravel */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const res = await fetch(`${getLaravelInternalUrl()}/admin/settlements?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
