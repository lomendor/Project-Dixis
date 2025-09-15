import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/producer/products/[id]
 * Returns a single product for editing (only if it belongs to the producer)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Mock authentication
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an approved producer
    const producerProfile = await getProducerProfile(userId);

    if (!producerProfile || producerProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Producer not approved or profile not found' },
        { status: 403 }
      );
    }

    // Get product by ID (ensure it belongs to this producer)
    const product = await getProductById(productId, producerProfile.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/producer/products/[id]
 * Updates a product (only if it belongs to the producer)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Mock authentication
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an approved producer
    const producerProfile = await getProducerProfile(userId);

    if (!producerProfile || producerProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Producer not approved or profile not found' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Ο τίτλος είναι υποχρεωτικός' },
        { status: 400 }
      );
    }

    if (!body.priceCents || body.priceCents <= 0) {
      return NextResponse.json(
        { error: 'Η τιμή πρέπει να είναι μεγαλύτερη από 0' },
        { status: 400 }
      );
    }

    if (body.stockQty < 0) {
      return NextResponse.json(
        { error: 'Το απόθεμα δεν μπορεί να είναι αρνητικό' },
        { status: 400 }
      );
    }

    // Update product (mock implementation)
    const updatedProduct = await updateProduct(productId, producerProfile.id, {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      priceCents: body.priceCents,
      stockQty: body.stockQty,
      weightGrams: body.weightGrams || 0,
      lengthCm: body.lengthCm || 0,
      widthCm: body.widthCm || 0,
      heightCm: body.heightCm || 0,
      isActive: body.isActive !== false,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν ενημερώθηκε επιτυχώς',
      product: updatedProduct,
    });

  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση του προϊόντος' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/producer/products/[id]
 * Deletes a product (only if it belongs to the producer)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Mock authentication
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an approved producer
    const producerProfile = await getProducerProfile(userId);

    if (!producerProfile || producerProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Producer not approved or profile not found' },
        { status: 403 }
      );
    }

    // Delete product (mock implementation)
    const deleted = await deleteProduct(productId, producerProfile.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν διαγράφηκε επιτυχώς',
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Παρουσιάστηκε σφάλμα κατά τη διαγραφή του προϊόντος' },
      { status: 500 }
    );
  }
}

// Mock helper functions
function getCurrentUserId(token: string | null): number | null {
  if (!token) return null;
  return 1; // Mock user ID for testing
}

async function getProducerProfile(userId: number) {
  // Mock producer profile lookup (same as in products/route.ts)
  const mockProfiles: Record<number, any> = {
    1: {
      id: 1,
      user_id: userId,
      name: 'Δημήτρης Παπαδόπουλος',
      business_name: 'Παπαδόπουλος Αγρόκτημα',
      status: 'active',
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
  };

  return mockProfiles[userId] || null;
}

async function getProductById(productId: number, producerId: number) {
  // Mock product lookup
  // In real app: SELECT from products WHERE id = ? AND producer_id = ?

  const mockProducts: Record<number, any> = {
    1: {
      id: 1,
      producer_id: 1,
      name: 'biologikes-tomates',
      title: 'Βιολογικές Ντομάτες Κρήτης',
      description: 'Φρέσκες βιολογικές ντομάτες από την Κρήτη',
      price: 3.50,
      price_cents: 350,
      currency: 'EUR',
      stock: 25,
      weight_grams: 1000,
      length_cm: 15,
      width_cm: 10,
      height_cm: 8,
      is_active: true,
      status: 'available',
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
    2: {
      id: 2,
      producer_id: 1,
      name: 'elaiólado-extra-partheno',
      title: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
      description: 'Εξαιρετικό παρθένο ελαιόλαδο από Κρητικές ελιές',
      price: 12.80,
      price_cents: 1280,
      currency: 'EUR',
      stock: 15,
      weight_grams: 500,
      length_cm: 25,
      width_cm: 7,
      height_cm: 7,
      is_active: true,
      status: 'available',
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
  };

  const product = mockProducts[productId];

  // Ensure product belongs to the producer
  if (product && product.producer_id === producerId) {
    return product;
  }

  return null;
}

async function updateProduct(productId: number, producerId: number, data: {
  title: string;
  description: string;
  priceCents: number;
  stockQty: number;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isActive: boolean;
}) {
  // Mock product update
  // In real app: UPDATE products SET ... WHERE id = ? AND producer_id = ?

  const existingProduct = await getProductById(productId, producerId);

  if (!existingProduct) {
    return null;
  }

  const slug = data.title.toLowerCase()
    .replace(/[^\u0370-\u03FF\u1F00-\u1FFFa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const updatedProduct = {
    ...existingProduct,
    title: data.title,
    name: slug,
    slug: slug,
    description: data.description,
    price: data.priceCents / 100,
    price_cents: data.priceCents,
    stock: data.stockQty,
    weight_grams: data.weightGrams,
    length_cm: data.lengthCm,
    width_cm: data.widthCm,
    height_cm: data.heightCm,
    is_active: data.isActive,
    updated_at: new Date().toISOString(),
  };

  console.log('Mock: Updated product:', updatedProduct);
  return updatedProduct;
}

async function deleteProduct(productId: number, producerId: number): Promise<boolean> {
  // Mock product deletion
  // In real app: DELETE FROM products WHERE id = ? AND producer_id = ?

  const existingProduct = await getProductById(productId, producerId);

  if (!existingProduct) {
    return false;
  }

  console.log(`Mock: Deleted product ${productId} for producer ${producerId}`);
  return true;
}