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

// In-memory storage for created products
let mockProductsDb: any[] = [
  {
    id: 1,
    producer_id: 1,
    name: 'biologikes-tomates',
    title: 'Βιολογικές Ντομάτες Κρήτης',
    price: 3.50,
    currency: 'EUR',
    stock: 25,
    image_url: null,
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
    producer_id: 1,
    name: 'elaiólado-extra-partheno',
    title: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
    price: 12.80,
    currency: 'EUR',
    stock: 15,
    image_url: null,
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

async function getProducerProducts(producerId: number) {
  // Mock products for the producer
  // In real app: SELECT from products WHERE producer_id = ?
  return mockProductsDb.filter(p => p.producer_id === producerId);
}

/**
 * POST /api/producer/products
 * Create a new product for the authenticated producer
 */
export async function POST(request: NextRequest) {
  try {
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const producerProfile = await getProducerProfile(userId);

    if (!producerProfile || producerProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Producer not approved or profile not found' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, name, price, stock, image_url, is_active, currency } = body;

    if (!title || !name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newProduct = {
      id: mockProductsDb.length + 1,
      producer_id: producerProfile.id,
      name,
      title,
      price: parseFloat(price),
      currency: currency || 'EUR',
      stock: parseInt(stock),
      image_url: image_url || null,
      is_active: is_active ?? true,
      status: 'available' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockProductsDb.push(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}