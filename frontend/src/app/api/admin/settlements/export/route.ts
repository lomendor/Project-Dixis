import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

/**
 * Pass PAYOUT-05: Proxy CSV export -- streams binary CSV from Laravel to browser.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'PENDING';

  const res = await fetch(`${getLaravelInternalUrl()}/admin/settlements/export?status=${status}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Export failed' }, { status: res.status });
  }

  // Stream the CSV response through
  const csvBody = await res.arrayBuffer();
  const contentDisposition = res.headers.get('content-disposition') || 'attachment; filename="settlements.csv"';

  return new NextResponse(csvBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=UTF-8',
      'Content-Disposition': contentDisposition,
      'Cache-Control': 'no-cache, no-store',
    },
  });
}
