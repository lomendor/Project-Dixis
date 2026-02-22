/**
 * DEPRECATED: Legacy address storage endpoint with mock data.
 * Shipping addresses are now sent with the order via Laravel API.
 * Returns 410 Gone to prevent accidental usage.
 */
import { NextResponse } from 'next/server'

const GONE_RESPONSE = NextResponse.json(
  {
    error: 'This endpoint has been deprecated.',
    message: 'Address management now uses Laravel API exclusively.',
    redirect: 'Addresses are submitted with createOrder() payload',
  },
  { status: 410 }
)

export async function POST() { return GONE_RESPONSE }
export async function GET() { return GONE_RESPONSE }
export async function PUT() { return GONE_RESPONSE }
