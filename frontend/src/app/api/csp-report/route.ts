import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/csp-report
 * CSP violation report endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log CSP violations for debugging (truncate to avoid log spam)
    console.log('[CSP-REPORT]', JSON.stringify(body).slice(0, 2000));
  } catch (error) {
    // Ignore JSON parsing errors - CSP reports can have malformed data
  }

  // Return 204 No Content as per CSP reporting spec
  return new NextResponse(null, { status: 204 });
}