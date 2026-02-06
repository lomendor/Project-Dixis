import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  const backendUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8001';

  // Forward auth cookie for admin authentication (Next.js 15 async cookies)
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_session')?.value;

  try {
    const response = await fetch(`${backendUrl}/api/shipping/labels/${orderId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(authCookie && { 'Cookie': `admin_session=${authCookie}` }),
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
