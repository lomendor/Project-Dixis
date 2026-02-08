import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

/**
 * PUBLIC-PRODUCER-PAGES-01: Public API to list approved producers
 * No authentication required - this is for public discovery
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    // Filters
    const region = searchParams.get('region') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('q') || undefined;

    // Build where clause - only approved & active producers
    const where: Record<string, unknown> = {
      approvalStatus: 'approved',
      isActive: true,
    };

    if (region) {
      where.region = region;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { region: { contains: search } },
        { category: { contains: search } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.producer.count({ where });

    // Fetch producers with dynamic product count (approved products only)
    const producers = await prisma.producer.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        region: true,
        category: true,
        description: true,
        imageUrl: true,
        rating: true,
        createdAt: true,
        _count: {
          select: {
            Product: {
              where: {
                isActive: true,
                approvalStatus: 'approved',
              },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get unique regions and categories for filters
    const [regions, categories] = await Promise.all([
      prisma.producer.findMany({
        where: { approvalStatus: 'approved', isActive: true },
        select: { region: true },
        distinct: ['region'],
      }),
      prisma.producer.findMany({
        where: { approvalStatus: 'approved', isActive: true },
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    return NextResponse.json({
      producers: producers.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        region: p.region,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        rating: p.rating || 0,
        productCount: p._count?.Product || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        regions: regions.map(r => r.region).filter(Boolean).sort(),
        categories: categories.map(c => c.category).filter(Boolean).sort(),
      },
    });
  } catch (error) {
    console.error('[api/public/producers] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch producers' },
      { status: 500 }
    );
  }
}
