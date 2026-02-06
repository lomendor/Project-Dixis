import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/requireProducer';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/me/products/[id]
 * Returns a single product for the authenticated producer (owner check)
 *
 * Pass PRODUCER-PRODUCTS-FIX-01: Replaced Laravel proxy with Prisma
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const producer = await requireProducer();
    const { id } = await context.params;

    const product = await prisma.product.findFirst({
      where: { id, producerId: producer.id },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        price: true,
        unit: true,
        stock: true,
        isActive: true,
        imageUrl: true,
        description: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Το προϊόν δεν βρέθηκε' },
        { status: 404 }
      );
    }

    // Map to frontend format (both camelCase and snake_case for compatibility)
    const mapped = {
      id: product.id,
      name: product.title,
      title: product.title,
      slug: product.slug,
      price: product.price,
      currency: 'EUR',
      stock: product.stock,
      unit: product.unit,
      category: product.category,
      is_active: product.isActive,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      image_url: product.imageUrl,
      description: product.description,
      approval_status: product.approvalStatus,
      approvalStatus: product.approvalStatus,
      status: product.isActive ? 'available' : 'unavailable',
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return NextResponse.json({ product: mapped });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[Producer Product GET] Error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ανάκτηση προϊόντος' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/me/products/[id]
 * Update a product for the authenticated producer (owner check)
 *
 * Pass PRODUCER-PRODUCTS-FIX-01: Replaced Laravel proxy with Prisma
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const producer = await requireProducer();
    const { id } = await context.params;
    const body = await request.json();

    // First check ownership
    const existing = await prisma.product.findFirst({
      where: { id, producerId: producer.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Το προϊόν δεν βρέθηκε' },
        { status: 404 }
      );
    }

    // Build update data (only update provided fields)
    const updateData: {
      title?: string;
      category?: string;
      price?: number;
      unit?: string;
      stock?: number;
      description?: string | null;
      imageUrl?: string | null;
      isActive?: boolean;
    } = {};

    if (body.title?.trim()) {
      updateData.title = body.title.trim();
    } else if (body.name?.trim()) {
      updateData.title = body.name.trim();
    }

    if (body.category) {
      updateData.category = body.category;
    }

    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price) || existing.price;
    }

    if (body.unit) {
      updateData.unit = body.unit;
    }

    if (body.stock !== undefined) {
      updateData.stock = parseInt(body.stock, 10);
      if (isNaN(updateData.stock)) {
        updateData.stock = existing.stock;
      }
    }

    if (body.description !== undefined) {
      updateData.description = body.description || null;
    }

    if (body.imageUrl !== undefined || body.image_url !== undefined) {
      updateData.imageUrl = body.imageUrl || body.image_url || null;
    }

    if (body.isActive !== undefined || body.is_active !== undefined) {
      updateData.isActive = body.isActive ?? body.is_active ?? existing.isActive;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.title,
        title: product.title,
        price: product.price,
        currency: 'EUR',
        stock: product.stock,
        unit: product.unit,
        category: product.category,
        is_active: product.isActive,
        isActive: product.isActive,
        imageUrl: product.imageUrl,
        image_url: product.imageUrl,
        description: product.description,
        status: product.isActive ? 'available' : 'unavailable',
        created_at: product.createdAt.toISOString(),
        updated_at: product.updatedAt.toISOString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[Producer Product PUT] Error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ενημέρωση προϊόντος' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/me/products/[id]
 * Delete a product for the authenticated producer (owner check)
 *
 * Pass PRODUCER-PRODUCTS-FIX-01: Replaced Laravel proxy with Prisma
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const producer = await requireProducer();
    const { id } = await context.params;

    // First check ownership
    const existing = await prisma.product.findFirst({
      where: { id, producerId: producer.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Το προϊόν δεν βρέθηκε' },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν διαγράφηκε επιτυχώς',
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[Producer Product DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη διαγραφή προϊόντος' },
      { status: 500 }
    );
  }
}
