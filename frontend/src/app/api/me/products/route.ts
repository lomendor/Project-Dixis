import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/requireProducer';

/**
 * GET /api/me/products
 * Returns products for the authenticated producer (scoped to producer_id)
 * Query params: ?q=searchterm&category=xyz&status=active|inactive|all
 *
 * Pass PRODUCER-PRODUCTS-FIX-01: Replaced Laravel proxy with Prisma
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated producer (throws 401/403)
    const producer = await requireProducer();

    // Parse query params for search/filter
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all';

    // Build Prisma where clause - always scoped to producer
    const where: {
      producerId: string;
      title?: { contains: string };
      category?: string;
      isActive?: boolean;
    } = { producerId: producer.id };

    if (q) {
      where.title = { contains: q };
    }
    if (category) {
      where.category = category;
    }
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        unit: true,
        stock: true,
        isActive: true,
        imageUrl: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Map to frontend format (both camelCase and snake_case for compatibility)
    const mapped = products.map((p) => ({
      id: p.id,
      name: p.title,
      title: p.title,
      price: p.price,
      currency: 'EUR',
      stock: p.stock,
      unit: p.unit,
      category: p.category,
      is_active: p.isActive,
      isActive: p.isActive,
      imageUrl: p.imageUrl,
      image_url: p.imageUrl,
      description: p.description,
      status: p.isActive ? 'available' : 'unavailable',
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ products: mapped, total: mapped.length });
  } catch (error: unknown) {
    // requireProducer throws Response objects for 401/403
    if (error instanceof Response) {
      return error;
    }

    console.error('[Producer Products GET] Error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ανάκτηση προϊόντων' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/me/products
 * Create a new product for the authenticated producer
 *
 * Pass PRODUCER-PRODUCTS-FIX-01: Replaced Laravel proxy with Prisma
 */
export async function POST(request: NextRequest) {
  try {
    const producer = await requireProducer();
    const body = await request.json();

    // Validate required fields
    const title = body.title?.trim() || body.name?.trim();
    if (!title) {
      return NextResponse.json(
        { error: 'Το όνομα προϊόντος είναι υποχρεωτικό' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .slice(0, 40);

    const slug = body.slug || `${baseSlug}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        producerId: producer.id,
        category: body.category || 'other',
        price: parseFloat(body.price) || 0,
        unit: body.unit || 'kg',
        stock: parseInt(body.stock, 10) || 0,
        description: body.description || null,
        imageUrl: body.imageUrl || body.image_url || null,
        isActive: body.isActive !== false,
        approvalStatus: 'pending', // New products require admin approval
      },
    });

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          name: product.title,
          is_active: product.isActive,
          image_url: product.imageUrl,
          created_at: product.createdAt.toISOString(),
          updated_at: product.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[Producer Products POST] Error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη δημιουργία προϊόντος' },
      { status: 500 }
    );
  }
}
