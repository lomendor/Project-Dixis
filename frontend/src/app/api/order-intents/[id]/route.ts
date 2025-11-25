import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      email: order.email,
      name: order.name,
      address: order.address,
      phone: order.phone,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        qty: item.qty,
        price: item.price,
        titleSnap: item.titleSnap,
        priceSnap: item.priceSnap,
        product: item.product
      }))
    })
  } catch (error) {
    console.error('GET /api/order-intents/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { email, name, address, phone } = body

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Update order with contact info and mark as submitted
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        email,
        name,
        address: address || null,
        phone: phone || null,
        status: 'submitted'
      },
      include: { items: true }
    })

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      email: order.email,
      name: order.name
    })
  } catch (error) {
    console.error('PATCH /api/order-intents/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
