import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { getAdminToken } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  // Auth: verify JWT + admin whitelist server-side, like every other admin
  // route — cookie existence alone is not verification.
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminError) {
      const status = error.code === 'NOT_AUTHENTICATED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status });
    }
    throw error;
  }

  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Strip "A-" prefix for Laravel (route model binding expects integer ID)
  const laravelId = orderId.startsWith('A-') ? orderId.slice(2) : orderId;
  const backendUrl = getLaravelInternalUrl();

  try {
    const response = await fetch(`${backendUrl}/shipping/labels/${laravelId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Shipping label creation failed:', error);
    return NextResponse.json(
      { success: false, message: 'Backend service unavailable' },
      { status: 503 }
    );
  }
}
