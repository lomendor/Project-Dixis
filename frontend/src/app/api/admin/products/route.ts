import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { z } from 'zod'

const CreateProductSchema = z.object({
  title: z.string().min(3, 'Τίτλος τουλάχιστον 3 χαρακτήρες'),
  category: z.string().min(1, 'Απαιτείται κατηγορία'),
  price: z.number().min(0, 'Η τιμή πρέπει να είναι ≥ 0'),
  unit: z.string().min(1, 'Απαιτείται μονάδα μέτρησης'),
  stock: z.number().int().min(0).optional().default(0),
  description: z.string().optional(),
  producerId: z.string().min(1, 'Απαιτείται παραγωγός'),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export async function GET(req: Request) {
  try {
    // Require admin authentication
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const approval = searchParams.get('approval') || ''

    const items = await prisma.product.findMany({
      where: {
        AND: [
          q ? { title: { contains: q } } : {},
          approval ? { approvalStatus: approval } : {}
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        price: true,
        unit: true,
        stock: true,
        isActive: true,
        approvalStatus: true,
        rejectionReason: true,
        producer: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ items })

  } catch (error: unknown) {
    console.error('Admin products list error:', error)

    // Handle AdminError (authentication/authorization)
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json().catch(() => ({}))
    const parsed = CreateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Λάθος δεδομένα', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    const { title, category, price, unit, stock, description, producerId, imageUrl } = parsed.data

    // Verify producer exists
    const producer = await prisma.producer.findUnique({ where: { id: producerId } })
    if (!producer) {
      return NextResponse.json({ error: 'Ο παραγωγός δεν βρέθηκε' }, { status: 400 })
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[αά]/g, 'a').replace(/[εέ]/g, 'e').replace(/[ηή]/g, 'i')
      .replace(/[ιί]/g, 'i').replace(/[οό]/g, 'o').replace(/[υύ]/g, 'y')
      .replace(/[ωώ]/g, 'o').replace(/[σς]/g, 's')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const item = await prisma.product.create({
      data: {
        title,
        slug,
        category,
        price,
        unit,
        stock: stock ?? 0,
        description: description || null,
        producerId,
        imageUrl: imageUrl || null,
        isActive: true,
        approvalStatus: 'approved', // Admin-created products auto-approved
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        price: true,
        producer: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ item }, { status: 201 })

  } catch (error: unknown) {
    console.error('Admin product create error:', error)

    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Σφάλμα δημιουργίας προϊόντος' }, { status: 500 })
  }
}
