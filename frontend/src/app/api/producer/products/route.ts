import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/producer/products
 * Returns products for the authenticated producer (only if approved)
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get products for this producer
    const products = await getProducerProducts(producerProfile.id);

    return NextResponse.json({
      products,
      total: products.length,
      producer: producerProfile,
    });

  } catch (error) {
    console.error('Producer products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
  // Mock producer profile lookup
  const mockProfiles: Record<number, any> = {
    1: {
      id: 1,
      user_id: userId,
      name: 'Δημήτρης Παπαδόπουλος',
      business_name: 'Παπαδόπουλος Αγρόκτημα',
      status: 'active', // Only active producers can access products
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
    2: {
      id: 2,
      user_id: userId,
      name: 'Μαρία Γιαννοπούλου',
      status: 'pending', // Pending producer - no access to products
      created_at: '2025-09-14T15:30:00.000Z',
      updated_at: '2025-09-15T10:15:00.000Z',
    },
  };

  return mockProfiles[userId] || null;
}

async function getProducerProducts(producerId: number) {
  // Mock products for the producer
  // In real app: SELECT from products WHERE producer_id = ?

  const mockProducts = [
    {
      id: 1,
      producer_id: producerId,
      name: 'biologikes-tomates',
      title: 'Βιολογικές Ντομάτες Κρήτης',
      price: 3.50,
      currency: 'EUR',
      stock: 25,
      weight_grams: 1000,
      length_cm: 15,
      width_cm: 10,
      height_cm: 8,
      is_active: true,
      status: 'available' as const,
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
    {
      id: 2,
      producer_id: producerId,
      name: 'elaiólado-extra-partheno',
      title: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
      price: 12.80,
      currency: 'EUR',
      stock: 15,
      weight_grams: 500,
      length_cm: 25,
      width_cm: 7,
      height_cm: 7,
      is_active: true,
      status: 'available' as const,
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
  ];

  // Filter by producer (in mock, all products belong to producer 1)
  return producerId === 1 ? mockProducts : [];
}

/**
 * POST /api/producer/products
 * Creates a new product for the authenticated producer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Create new product (mock implementation)
    const newProduct = await createProduct(producerProfile.id, {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      priceCents: body.priceCents,
      stockQty: body.stockQty,
      weightGrams: body.weightGrams || 0,
      lengthCm: body.lengthCm || 0,
      widthCm: body.widthCm || 0,
      heightCm: body.heightCm || 0,
      isActive: body.isActive !== false, // Default to true
    });

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν δημιουργήθηκε επιτυχώς',
      product: newProduct,
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Παρουσιάστηκε σφάλμα κατά τη δημιουργία του προϊόντος' },
      { status: 500 }
    );
  }
}

async function createProduct(producerId: number, data: {
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
  // Mock product creation
  // In real app: INSERT into products table

  const now = new Date().toISOString();
  const slug = data.title.toLowerCase()
    .replace(/[^\u0370-\u03FF\u1F00-\u1FFFa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const product = {
    id: Math.floor(Math.random() * 10000), // Mock ID
    producer_id: producerId,
    name: slug,
    title: data.title,
    slug: slug,
    description: data.description,
    price: data.priceCents / 100, // Convert cents to euros
    price_cents: data.priceCents,
    currency: 'EUR',
    unit: 'piece',
    stock: data.stockQty,
    weight_grams: data.weightGrams,
    length_cm: data.lengthCm,
    width_cm: data.widthCm,
    height_cm: data.heightCm,
    is_active: data.isActive,
    is_organic: false,
    status: 'available' as const,
    created_at: now,
    updated_at: now,
  };

  // Mock: store to in-memory cache
  // In real app: INSERT into products table
  console.log('Mock: Created product:', product);

  return product;
}