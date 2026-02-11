import { NextResponse } from 'next/server'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { getLaravelInternalUrl } from '@/env'
import { toStorefrontSlug } from '@/lib/category-map'
import { z } from 'zod'
import { cookies } from 'next/headers'

/**
 * Phase 5.1: Admin product routes now proxy to Laravel (SSOT).
 * Admin authentication still uses Prisma AdminUser table.
 * Product CRUD goes to Laravel so products appear on the storefront.
 */

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

/**
 * Helper: get session token for Laravel proxy calls
 */
async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('dixis_session')?.value ?? null
}

/**
 * GET /api/admin/products
 * Lists ALL products from Laravel (admin view with search/filter)
 */
export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const approval = searchParams.get('approval') || ''

    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/public/products`)
    if (q) url.searchParams.set('search', q)
    url.searchParams.set('per_page', '100')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[Admin] Laravel products fetch failed:', res.status)
      return NextResponse.json({ error: 'Σφάλμα ανάκτησης προϊόντων' }, { status: res.status })
    }

    const json = await res.json()
    const products = json?.data ?? []

    // Map Laravel format to admin panel format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = products
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => {
        if (!approval) return true
        const status = p.approval_status || 'approved'
        return status === approval
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => {
        const categories = p.categories || []
        return {
          id: String(p.id),
          title: p.name || p.title,
          description: p.description,
          category: toStorefrontSlug(categories[0]?.slug || p.category),
          price: parseFloat(p.price),
          unit: p.unit || 'kg',
          stock: typeof p.stock === 'number' ? p.stock : 0,
          isActive: p.is_active !== false,
          approvalStatus: p.approval_status || 'approved',
          rejectionReason: p.rejection_reason || null,
          producer: p.producer
            ? { id: String(p.producer.id), name: p.producer.name }
            : null,
        }
      })

    return NextResponse.json({ items })

  } catch (error: unknown) {
    console.error('Admin products list error:', error)

    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}

/**
 * POST /api/admin/products
 * Creates a product in Laravel (so it appears on the storefront)
 */
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

    const sessionToken = await getSessionToken()

    // Proxy to Laravel POST /v1/products
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/products`)

    const laravelPayload = {
      name: title,
      category,
      price,
      unit,
      stock: stock ?? 0,
      description: description || null,
      image_url: imageUrl || null,
      producer_id: parseInt(producerId, 10),
      is_active: true,
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`
    }

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(laravelPayload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('[Admin] Laravel product create failed:', res.status, errorData)
      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα δημιουργίας προϊόντος' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const product = data.data || data

    const item = {
      id: String(product.id),
      title: product.name || product.title,
      slug: product.slug,
      category: product.category,
      price: parseFloat(product.price),
      producer: product.producer
        ? { id: String(product.producer.id), name: product.producer.name }
        : null,
    }

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
