import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/products
 * Returns active products for the public catalog (buyers)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    // Get all active products
    const { products, total } = await getActiveProducts({
      page,
      limit,
      search,
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Products catalog error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getActiveProducts(params: {
  page: number;
  limit: number;
  search: string;
}) {
  // Mock products data
  // In real app: SELECT from products WHERE is_active = true AND status = 'available'

  const allMockProducts = [
    {
      id: 1,
      producer_id: 1,
      name: 'biologikes-tomates',
      title: 'Βιολογικές Ντομάτες Κρήτης',
      slug: 'biologikes-tomates-kritis',
      description: 'Φρέσκες βιολογικές ντομάτες από την Κρήτη, καλλιεργημένες χωρίς χημικά λιπάσματα.',
      price: 3.50,
      price_cents: 350,
      currency: 'EUR',
      unit: 'κιλό',
      stock: 25,
      weight_grams: 1000,
      length_cm: 15,
      width_cm: 10,
      height_cm: 8,
      is_active: true,
      is_organic: true,
      status: 'available',
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
      // Producer relation
      producer: {
        id: 1,
        name: 'Δημήτρης Παπαδόπουλος',
        business_name: 'Παπαδόπουλος Αγρόκτημα',
        location: 'Κρήτη',
      },
      // Images (mock)
      images: [
        {
          id: 1,
          url: '/images/products/tomates-1.jpg',
          alt_text: 'Βιολογικές ντομάτες',
          is_primary: true,
        },
      ],
    },
    {
      id: 2,
      producer_id: 1,
      name: 'elaiólado-extra-partheno',
      title: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
      slug: 'elaiólado-extra-partheno',
      description: 'Εξαιρετικό παρθένο ελαιόλαδο από Κρητικές ελιές, παραδοσιακή παραγωγή.',
      price: 12.80,
      price_cents: 1280,
      currency: 'EUR',
      unit: 'μπουκάλι 500ml',
      stock: 15,
      weight_grams: 500,
      length_cm: 25,
      width_cm: 7,
      height_cm: 7,
      is_active: true,
      is_organic: true,
      status: 'available',
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
      // Producer relation
      producer: {
        id: 1,
        name: 'Δημήτρης Παπαδόπουλος',
        business_name: 'Παπαδόπουλος Αγρόκτημα',
        location: 'Κρήτη',
      },
      // Images (mock)
      images: [
        {
          id: 2,
          url: '/images/products/elaiólado-1.jpg',
          alt_text: 'Εξαιρετικό παρθένο ελαιόλαδο',
          is_primary: true,
        },
      ],
    },
    {
      id: 3,
      producer_id: 2,
      name: 'kremmydia-kozanis',
      title: 'Κρεμμύδια Κοζάνης ΠΟΠ',
      slug: 'kremmydia-kozanis-pop',
      description: 'Γλυκά κρεμμύδια από την Κοζάνη με ΠΟΠ (Προστατευόμενη Ονομασία Προέλευσης).',
      price: 2.90,
      price_cents: 290,
      currency: 'EUR',
      unit: 'κιλό',
      stock: 40,
      weight_grams: 1000,
      length_cm: 12,
      width_cm: 12,
      height_cm: 10,
      is_active: true,
      is_organic: false,
      status: 'available',
      created_at: '2025-09-14T15:30:00.000Z',
      updated_at: '2025-09-15T10:15:00.000Z',
      // Producer relation
      producer: {
        id: 2,
        name: 'Μαρία Γιαννοπούλου',
        business_name: 'Γιαννοπούλου Αγροτικά',
        location: 'Κοζάνη',
      },
      // Images (mock)
      images: [
        {
          id: 3,
          url: '/images/products/kremmydia-1.jpg',
          alt_text: 'Κρεμμύδια Κοζάνης',
          is_primary: true,
        },
      ],
    },
    {
      id: 4,
      producer_id: 1,
      name: 'meli-thymari',
      title: 'Μέλι Θυμαρισιό Κρήτης',
      slug: 'meli-thymari-kritis',
      description: 'Άριστης ποιότητας θυμαρίσιο μέλι από τα βουνά της Κρήτης.',
      price: 8.50,
      price_cents: 850,
      currency: 'EUR',
      unit: 'βάζο 450γρ',
      stock: 20,
      weight_grams: 450,
      length_cm: 10,
      width_cm: 10,
      height_cm: 12,
      is_active: true,
      is_organic: true,
      status: 'available',
      created_at: '2025-09-13T09:00:00.000Z',
      updated_at: '2025-09-15T12:30:00.000Z',
      // Producer relation
      producer: {
        id: 1,
        name: 'Δημήτρης Παπαδόπουλος',
        business_name: 'Παπαδόπουλος Αγρόκτημα',
        location: 'Κρήτη',
      },
      // Images (mock)
      images: [
        {
          id: 4,
          url: '/images/products/meli-1.jpg',
          alt_text: 'Θυμαρίσιο μέλι',
          is_primary: true,
        },
      ],
    },
    {
      id: 5,
      producer_id: 2,
      name: 'patates-naxou',
      title: 'Πατάτες Νάξου',
      slug: 'patates-naxou',
      description: 'Μικρές πατάτες από τη Νάξο, ιδανικές για βράσιμο.',
      price: 1.80,
      price_cents: 180,
      currency: 'EUR',
      unit: 'κιλό',
      stock: 50,
      weight_grams: 1000,
      length_cm: 20,
      width_cm: 15,
      height_cm: 10,
      is_active: true,
      is_organic: false,
      status: 'available',
      created_at: '2025-09-12T14:20:00.000Z',
      updated_at: '2025-09-14T16:45:00.000Z',
      // Producer relation
      producer: {
        id: 2,
        name: 'Μαρία Γιαννοπούλου',
        business_name: 'Γιαννοπούλου Αγροτικά',
        location: 'Νάξος',
      },
      // Images (mock)
      images: [
        {
          id: 5,
          url: '/images/products/patates-1.jpg',
          alt_text: 'Πατάτες Νάξου',
          is_primary: true,
        },
      ],
    },
  ];

  // Filter active products only
  let filteredProducts = allMockProducts.filter(p => p.is_active && p.status === 'available');

  // Apply search filter if provided
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.producer.business_name.toLowerCase().includes(searchLower)
    );
  }

  const total = filteredProducts.length;

  // Apply pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    total,
  };
}