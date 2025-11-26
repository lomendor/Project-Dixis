import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Zod schema with Greek validation messages
const CheckoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες'),
    phone: z.string().regex(/^(\+30)?\s?[0-9\s-]{10,}$/, 'Μη έγκυρος αριθμός τηλεφώνου'),
    email: z.string().email('Μη έγκυρο email').optional(),
    address: z.string().min(5, 'Η διεύθυνση πρέπει να έχει τουλάχιστον 5 χαρακτήρες'),
    city: z.string().min(2, 'Η πόλη πρέπει να έχει τουλάχιστον 2 χαρακτήρες'),
    postcode: z.string().regex(/^[0-9]{5}$/, 'Ο ΤΚ πρέπει να είναι 5ψήφιος')
  }),
  items: z.array(z.object({
    id: z.string().cuid(),
    qty: z.number().int().positive()
  })).min(1, 'Το καλάθι είναι κενό')
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate with Zod
    const parsed = CheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { customer, items } = parsed.data

    // Fetch products (reuse order-intents logic)
    const productIds = items.map(i => i.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { producer: true }
    })

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'Κάποια προϊόντα δεν βρέθηκαν ή δεν είναι διαθέσιμα' },
        { status: 404 }
      )
    }

    // Calculate totals (EXACT logic from order-intents - AG123.1)
    let subtotalFloat = 0
    const orderItems = items.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id)!
      const lineTotal = product.price * cartItem.qty
      subtotalFloat += lineTotal

      return {
        productId: product.id,
        producerId: product.producerId,
        qty: cartItem.qty,
        price: product.price,
        titleSnap: product.title,
        priceSnap: product.price,
        slug: product.slug,
        status: 'pending'
      }
    })

    // Financial calculations (AG123.1 pattern)
    const subtotal = new Prisma.Decimal(subtotalFloat).toDecimalPlaces(2)
    const zone = 'mainland' // Default (could be enhanced with postal code mapping later)
    const shippingRates: Record<string, number> = {
      mainland: 4.50,
      islands: 8.00
    }
    const shipping = new Prisma.Decimal(shippingRates[zone]).toDecimalPlaces(2)
    const vatRate = new Prisma.Decimal(0.24)
    const vat = subtotal.mul(vatRate).toDecimalPlaces(2)
    const totalDecimal = subtotal.add(shipping).add(vat)
    const total = totalDecimal.toNumber()

    // Create Order in Neon DB
    const order = await prisma.order.create({
      data: {
        // Customer fields (AG130)
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        zip: customer.postcode,

        // Financial fields (AG123)
        zone,
        subtotal,
        shipping,
        vat,
        total,
        currency: 'EUR',

        // Status = 'submitted' (not 'pending' like order-intents)
        status: 'submitted',

        // Items (nested create)
        items: { create: orderItems }
      },
      include: { items: true }
    })

    return NextResponse.json({
      orderId: order.id,
      totals: {
        subtotal: subtotal.toNumber(),
        shipping: shipping.toNumber(),
        vat: vat.toNumber(),
        total: order.total
      }
    })

  } catch (error) {
    console.error('POST /api/checkout error:', error)

    // Check for Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Σφάλμα βάσης δεδομένων', code: error.code },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Αποτυχία δημιουργίας παραγγελίας' },
      { status: 500 }
    )
  }
}
