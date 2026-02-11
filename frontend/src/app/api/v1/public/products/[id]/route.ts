import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

/**
 * Product by ID API for CI/E2E Testing
 * Pass CI-SMOKE-STABILIZE-001: Returns product data from Prisma DB in CI mode
 * Allows product detail pages to load without Laravel backend
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // In CI/test mode, fetch from Prisma DB (SQLite/PostgreSQL)
  if (process.env.CI === 'true' || process.env.NODE_ENV === 'test' || process.env.DIXIS_ENV === 'test') {
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { id: id },
            { slug: id }
          ],
          isActive: true
        },
        include: {
          producer: {
            select: { id: true, name: true, slug: true }
          }
        }
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found', message: `No product with id/slug: ${id}` },
          { status: 404 }
        );
      }

      // Map to Laravel API format for frontend compatibility
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
        producer: product.producer ? {
          id: product.producer.id,
          name: product.producer.name,
          slug: product.producer.slug
        } : null
      };

      return NextResponse.json({ data });
    } catch (error) {
      console.error('CI Product API error:', error);
      return NextResponse.json(
        { error: 'Database error', message: String(error) },
        { status: 500 }
      );
    }
  }

  // In production, this route should NOT be used
  return NextResponse.json(
    { error: 'This API route is only available in test/CI mode' },
    { status: 503 }
  );
}
