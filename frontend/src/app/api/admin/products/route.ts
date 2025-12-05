import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'

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
