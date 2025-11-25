import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { items } = await req.json() // [{id, qty}]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    // Fetch products from DB
    const productIds = items.map((i: any) => String(i.id))
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { producer: true }
    })

    // Calculate totals (cart uses priceCents, DB uses price Float)
    let totalFloat = 0
    const orderItems = items.map((cartItem: any) => {
      const product = products.find(p => p.id === String(cartItem.id))
      if (!product) {
        throw new Error(`Product ${cartItem.id} not found`)
      }

      const priceFloat = product.price
      const lineTotal = priceFloat * cartItem.qty
      totalFloat += lineTotal

      return {
        productId: product.id,
        producerId: product.producerId,
        qty: cartItem.qty,
        price: priceFloat,
        titleSnap: product.title,
        priceSnap: priceFloat,
        status: 'pending'
      }
    })

    // Create draft order
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        total: totalFloat,
        subtotal: new Prisma.Decimal(totalFloat),
        items: { create: orderItems }
      },
      include: { items: true }
    })

    return NextResponse.json({
      orderId: order.id,
      total: order.total,
      items: order.items
    })
  } catch (error) {
    console.error('POST /api/order-intents error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
