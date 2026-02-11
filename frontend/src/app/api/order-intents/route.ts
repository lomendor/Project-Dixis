import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getLaravelInternalUrl } from '@/env'

/**
 * Phase 5.5c: Product data fetched from Laravel (SSOT).
 * Order creation stays in Prisma (orders are Prisma-only).
 */

interface LaravelProduct {
  id: string | number
  name: string
  price: number | string
  producer_id: number | string
}

async function fetchProductsFromLaravel(ids: string[]): Promise<Map<string, LaravelProduct>> {
  const laravelBase = getLaravelInternalUrl()
  const productMap = new Map<string, LaravelProduct>()

  await Promise.all(ids.map(async (id) => {
    try {
      const url = new URL(`${laravelBase}/public/products/${id}`)
      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const json = await res.json()
        const p = json?.data ?? json
        productMap.set(String(p.id), {
          id: String(p.id),
          name: p.name || p.title || '',
          price: Number(p.price ?? 0),
          producer_id: String(p.producer_id ?? p.producerId ?? ''),
        })
      }
    } catch {
      // Skip failed product fetches
    }
  }))

  return productMap
}

export async function POST(req: Request) {
  try {
    const { items } = await req.json() // [{id, qty}]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    // Fetch products from Laravel (SSOT)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productIds = items.map((i: any) => String(i.id))
    const productMap = await fetchProductsFromLaravel(productIds)

    // Calculate totals (cart uses priceCents, DB uses price Float)
    let subtotalFloat = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = items.map((cartItem: any) => {
      const product = productMap.get(String(cartItem.id))
      if (!product) {
        throw new Error(`Product ${cartItem.id} not found`)
      }

      const priceFloat = Number(product.price)
      const lineTotal = priceFloat * cartItem.qty
      subtotalFloat += lineTotal

      return {
        productId: String(product.id),
        producerId: String(product.producer_id),
        qty: cartItem.qty,
        price: priceFloat,
        titleSnap: product.name,
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

    // Create draft order with full breakdown (orders stay in Prisma)
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
