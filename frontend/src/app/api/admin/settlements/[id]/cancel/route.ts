import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

/** Pass PAYOUT-03: Proxy POST /api/admin/settlements/:id/cancel -> Laravel */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${API_BASE}/admin/settlements/${id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
