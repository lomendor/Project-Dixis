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
    let subtotalFloat = 0
    const orderItems = items.map((cartItem: any) => {
      const product = products.find(p => p.id === String(cartItem.id))
      if (!product) {
        throw new Error(`Product ${cartItem.id} not found`)
      }

      const priceFloat = product.price
      const lineTotal = priceFloat * cartItem.qty
      subtotalFloat += lineTotal

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

    // Calculate breakdown (all in Decimal for precision)
    const subtotal = new Prisma.Decimal(subtotalFloat).toDecimalPlaces(2)

    // Zone-based shipping (default: mainland)
    const zone = 'mainland'
    const shippingRates: Record<string, number> = {
      mainland: 4.50,
      islands: 8.00
    }
    const shipping = new Prisma.Decimal(shippingRates[zone]).toDecimalPlaces(2)

    // VAT 24% on subtotal
    const vatRate = new Prisma.Decimal(0.24)
    const vat = subtotal.mul(vatRate).toDecimalPlaces(2)

    // Grand total
    const totalDecimal = subtotal.add(shipping).add(vat)
    const total = totalDecimal.toNumber()

    // Create draft order with full breakdown
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        zone,
        subtotal,
        shipping,
        vat,
        total,
        items: { create: orderItems }
      },
      include: { items: true }
    })

    return NextResponse.json({
      orderId: order.id,
      subtotal: subtotal.toNumber(),
      shipping: shipping.toNumber(),
      vat: vat.toNumber(),
      total: order.total,
      zone,
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
