import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to the Laravel backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1'}/shipping/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Shipping quote API error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Σφάλμα κατά τον υπολογισμό μεταφορικών'
      },
      { status: 500 }
    );
  }
}