import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

/**
 * Products List API for CI/E2E Testing
 * Pass CI-SMOKE-STABILIZE-001: Returns products from Prisma DB in CI mode
 * Allows product listing and checkout tests without Laravel backend
 */

export async function GET(request: Request) {
  // In CI/test mode, fetch from Prisma DB (SQLite/PostgreSQL)
  if (process.env.CI === 'true' || process.env.NODE_ENV === 'test' || process.env.DIXIS_ENV === 'test') {
    try {
      const { searchParams } = new URL(request.url);
      const perPage = Math.min(parseInt(searchParams.get('per_page') || '50'), 100);

      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          producer: {
            select: { id: true, name: true, slug: true }
          }
        },
        take: perPage,
        orderBy: { createdAt: 'desc' }
      });

      // Map to Laravel API format for frontend/test compatibility
      const data = products.map(p => ({
        id: p.id,
        name: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        unit: p.unit || 'kg',
        stock: p.stock ?? 0,
        is_active: p.isActive,
        category: p.category,
        image_url: p.imageUrl,
        producer_id: p.producerId,
        producerId: p.producerId, // Alias for checkout-golden-path.spec.ts
        producer: p.producer ? {
          id: p.producer.id,
          name: p.producer.name,
          slug: p.producer.slug
        } : null
      }));

      return NextResponse.json({
        data,
        items: data, // Alias for fetchProducts() in tests
        total: data.length,
        page: 1,
        per_page: perPage
      });
    } catch (error) {
      console.error('CI Products API error:', error);
      return NextResponse.json(
        { error: 'Database error', message: String(error), data: [], items: [] },
        { status: 500 }
      );
    }
  }

  // In production/development, this route should NOT be used
  // (frontend should call Laravel backend directly via NEXT_PUBLIC_API_BASE_URL)
  return NextResponse.json(
    { error: 'This API route is only available in test/CI mode' },
    { status: 503 }
  );
}
