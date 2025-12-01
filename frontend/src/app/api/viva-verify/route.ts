import { NextResponse } from 'next/server'
import { getVivaWalletClient } from '@/lib/viva-wallet/client'
import { isVivaWalletConfigured } from '@/lib/viva-wallet/config'
import { prisma } from '@/server/db/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderCode = searchParams.get('orderCode')

  if (!orderCode) {
    return NextResponse.json(
      { error: 'Missing orderCode' },
      { status: 400 }
    )
  }

  if (!isVivaWalletConfigured()) {
    return NextResponse.json(
      { error: 'Viva Wallet not configured' },
      { status: 503 }
    )
  }

  try {
    const vivaClient = getVivaWalletClient()
    const isPaid = await vivaClient.isOrderPaid(Number(orderCode))

    if (!isPaid) {
      return NextResponse.json({
        success: false,
        error: 'ó ¿ª∑¡…ºÆ ¥µΩ øªø∫ª∑¡Œ∏∑∫µ'
      })
    }

    // Get order details to find our internal order ID
    const orderDetails = await vivaClient.getOrderDetails(Number(orderCode))
    const merchantRef = orderDetails.merchantTrns // Format: DIXIS-{orderId}
    const orderId = merchantRef?.replace('DIXIS-', '') || null

    if (orderId) {
      // Update order status to 'paid'
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'paid' }
      })
    }

    return NextResponse.json({
      success: true,
      orderId,
      vivaOrderCode: orderCode
    })
  } catch (error) {
    console.error('Viva verify error:', error)
    return NextResponse.json(
      { error: 'Verification failed', success: false },
      { status: 500 }
    )
  }
}
