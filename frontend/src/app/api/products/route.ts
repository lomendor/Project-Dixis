import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';

/**
 * GET /api/products - DB-backed products API με pagination & filtering
 *
 * Query params:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 12, max: 100)
 * - q: Search query (searches in title)
 * - category: Filter by category
 * - producerId: Filter by producer ID
 * - isActive: Filter by active status (default: true)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get('pageSize') || '12', 10), 1),
      100
    );

    // Filters
    const q = (searchParams.get('q') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const producerId = (searchParams.get('producerId') || '').trim();
    const isActive = searchParams.get('isActive') !== 'false'; // Default true

    // Build where clause
    const where: any = { isActive };

    if (q) {
      where.title = { contains: q, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    if (producerId) {
      where.producerId = producerId;
    }

    // Execute query με pagination
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          category: true,
          price: true,
          unit: true,
          stock: true,
          description: true,
          imageUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          producer: {
            select: {
              id: true,
              name: true,
              region: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
    });
  } catch (error) {
    console.error('[API /products] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
