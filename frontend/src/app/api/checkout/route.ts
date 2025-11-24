import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Basic validation
    if (!body.name || !body.email || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // M0 Stub: Generate mock order ID
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

    // Return success without real backend processing
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
