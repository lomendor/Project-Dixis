import { NextResponse } from 'next/server';

/**
 * Cart API Stub
 * Temporary stub to prevent 404s from client-side cart implementation
 * Returns empty cart - actual cart logic is client-side (localStorage)
 *
 * TODO: Implement proper server-side cart if needed for:
 * - Cart persistence across devices
 * - Cart sync with backend
 * - Pre-checkout validation
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    items: [],
    count: 0,
    total: 0,
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Cart is client-side only (localStorage)',
  });
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: 'Cart cleared (client-side)',
  });
}
