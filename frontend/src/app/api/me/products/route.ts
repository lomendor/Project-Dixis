import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/requireProducer';

/**
 * GET /api/me/products
 * Returns products for the authenticated producer (scoped to producer's phone/session)
 */
export async function GET() {
  try {
    const producer = await requireProducer();

    // Fetch products scoped to this producer only
    const products = await prisma.product.findMany({
      where: {
        producerId: producer.id
      },
      orderBy: { createdAt: 'desc' },
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
        updatedAt: true
      }
    });

    return NextResponse.json({
      products,
      total: products.length,
      producer: {
        id: producer.id,
        name: producer.name
      }
    });

  } catch (error: any) {
    // requireProducer throws Response objects for 401/403
    if (error instanceof Response) {
      return error;
    }

    console.error('Producer products error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ανάκτηση προϊόντων' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/me/products
 * Create a new product for the authenticated producer
 */
export async function POST(request: NextRequest) {
  try {
    const producer = await requireProducer();
    const body = await request.json();

    const { title, category, price, unit, stock, description, imageUrl, isActive } = body;

    // Validate required fields
    if (!title || !category || price === undefined || !unit || stock === undefined) {
      return NextResponse.json(
        { error: 'Υποχρεωτικά πεδία λείπουν' },
        { status: 400 }
      );
    }

    // Create product scoped to this producer (ignore any producerId in body)
    const product = await prisma.product.create({
      data: {
        producerId: producer.id, // Force producer scoping
        title: String(title).trim(),
        category: String(category).trim(),
        price: parseFloat(price),
        unit: String(unit).trim(),
        stock: parseInt(stock, 10),
        description: description ? String(description).trim() : null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (error: any) {
    if (error instanceof Response) {
      return error;
    }

    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη δημιουργία προϊόντος' },
      { status: 500 }
    );
  }
}
