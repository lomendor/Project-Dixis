import { NextResponse } from 'next/server';

/**
 * Temporary stub to stop 404s and fix PM2 logs.
 * Contract-first: returns an empty array with pagination metadata.
 * TODO: Replace with real DB-backed handler når database integration is complete.
 */
export async function GET() {
  return NextResponse.json({
    items: [],
    page: 1,
    pageSize: 0,
    total: 0,
  });
}
