import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/requireProducer';

/**
 * GET /api/me/products/[id]
 * Get a single product by ID (scoped to producer)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producer = await requireProducer();
    const productId = params.id;

    // Fetch product scoped to this producer
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        producerId: producer.id // Scoping: only producer's products
      },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        price: true,
        unit: true,
        stock: true,
        description: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Δεν βρέθηκε' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });

  } catch (error: any) {
    if (error instanceof Response) {
      return error;
    }

    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ανάκτηση προϊόντος' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/me/products/[id]
 * Update a product by ID (scoped to producer)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producer = await requireProducer();
    const productId = params.id;
    const body = await request.json();

    const { title, slug, category, price, unit, stock, description, imageUrl, isActive } = body;

    // Update product scoped to this producer (prevents updating other producers' products)
    const product = await prisma.product.updateMany({
      where: {
        id: productId,
        producerId: producer.id // Critical: scoping check
      },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(slug !== undefined && slug.trim().length > 0 && { slug: String(slug).trim().toLowerCase() }),
        ...(category !== undefined && { category: String(category).trim() }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(unit !== undefined && { unit: String(unit).trim() }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(description !== undefined && { description: description ? String(description).trim() : null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        updatedAt: new Date()
      }
    });

    if (product.count === 0) {
      return NextResponse.json(
        { error: 'Δεν βρέθηκε' },
        { status: 404 }
      );
    }

    // Fetch updated product
    const updated = await prisma.product.findUnique({
      where: { id: productId }
    });

    return NextResponse.json({ success: true, product: updated });

  } catch (error: any) {
    if (error instanceof Response) {
      return error;
    }

    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ενημέρωση προϊόντος' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/me/products/[id]
 * Delete a product by ID (scoped to producer)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producer = await requireProducer();
    const productId = params.id;

    // Delete product scoped to this producer
    const result = await prisma.product.deleteMany({
      where: {
        id: productId,
        producerId: producer.id // Critical: prevents deleting others' products
      }
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Δεν βρέθηκε' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: productId });

  } catch (error: any) {
    if (error instanceof Response) {
      return error;
    }

    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη διαγραφή προϊόντος' },
      { status: 500 }
    );
  }
}
