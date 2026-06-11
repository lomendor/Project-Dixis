import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { getAdminToken } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

/**
 * GET /api/admin/shipping/labels/[orderId]/download
 * Proxies to Laravel to download the shipping label PDF.
 */
export async function GET(
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
    const response = await fetch(`${backendUrl}/shipping/labels/${laravelId}/download`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Download failed' },
        { status: response.status }
      );
    }

    // Stream the PDF back to the client
    const pdfBuffer = await response.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="label-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Shipping label download failed:', error);
    return NextResponse.json(
      { success: false, message: 'Backend service unavailable' },
      { status: 503 }
    );
  }
}
