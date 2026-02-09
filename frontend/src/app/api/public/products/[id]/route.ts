import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Public Product by ID API
 * Mirrors /api/public/products (listing) but returns a single product.
 * Used by (storefront)/products/[id]/page.tsx via INTERNAL_API_URL.
 *
 * Returns Laravel-compatible format so the detail page mapping works.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        producer: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    // Map to Laravel API format expected by getProductById() in detail page
    const data = {
      id: product.id,
      name: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      unit: product.unit || 'kg',
      stock: product.stock ?? 0,
      is_active: product.isActive,
      category: product.category,
      image_url: product.imageUrl,
      producer_id: product.producerId,
      producer: product.producer
        ? {
            id: product.producer.id,
            name: product.producer.name,
            slug: product.producer.slug,
          }
        : null,
    };

    return NextResponse.json(
      { data },
      { headers: { 'cache-control': 'no-store' } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error('[API] public/products/[id] error:', message);
    return NextResponse.json(
      { error: 'Database error', message },
      { status: 500 }
    );
  }
}
