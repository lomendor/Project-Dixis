import { NextRequest, NextResponse } from 'next/server';

// Import shared mock storage from parent route
// In a real app, this would be a database query
const getMockProductsDb = () => {
  // This is a workaround to share state - in real app use DB
  return (global as any).__mockProductsDb || [
    {
      id: 1,
      producer_id: 1,
      name: 'biologikes-tomates',
      title: 'Βιολογικές Ντομάτες Κρήτης',
      price: 3.50,
      currency: 'EUR',
      stock: 25,
      image_url: null,
      is_active: true,
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
      is_active: true,
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
  ];
};

/**
 * GET /api/producer/products/[id]
 * Get a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    const products = getMockProductsDb();
    const product = products.find((p: any) => p.id === productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product belongs to this producer's producer_id
    if (product.producer_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(product);
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
 * Update a product by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    const products = getMockProductsDb();
    const productIndex = products.findIndex((p: any) => p.id === productId);

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product belongs to this producer
    if (products[productIndex].producer_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, name, price, stock, image_url, is_active, currency } = body;

    // Update product
    const updatedProduct = {
      ...products[productIndex],
      title: title ?? products[productIndex].title,
      name: name ?? products[productIndex].name,
      price: price !== undefined ? parseFloat(price) : products[productIndex].price,
      stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
      image_url: image_url !== undefined ? image_url : products[productIndex].image_url,
      is_active: is_active ?? products[productIndex].is_active,
      currency: currency ?? products[productIndex].currency,
      updated_at: new Date().toISOString(),
    };

    products[productIndex] = updatedProduct;

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock helper function
function getCurrentUserId(token: string | null): number | null {
  if (!token) return null;
  return 1; // Mock user ID for testing
}
