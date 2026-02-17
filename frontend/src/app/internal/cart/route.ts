import { NextResponse } from 'next/server';

/**
 * Internal Cart API Stub
 * Path: /internal/cart (moved from /api/cart to avoid nginx /api/* proxy collision)
 * Temporary stub to prevent 404s from client-side cart implementation
 * Returns empty cart - actual cart logic is client-side (localStorage)
 *
 * Note: Nginx proxies all /api/* requests to Laravel backend,
 * so Next.js API routes under /api/* are unreachable.
 * Using /internal/* prefix instead.
 *
 * Cart is managed client-side via Zustand store with localStorage.
 * Checkout validation happens server-side in Laravel.
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
