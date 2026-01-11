import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get('postal_code');

    if (!postalCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Απαιτείται ταχυδρομικός κώδικας'
        },
        { status: 400 }
      );
    }

    // Forward the request to the Laravel backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'}/lockers/search?postal_code=${encodeURIComponent(postalCode)}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Locker search API error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Σφάλμα κατά την αναζήτηση lockers'
      },
      { status: 500 }
    );
  }
}