import { NextResponse } from 'next/server';

/**
 * Mock Products API for CI/E2E Testing
 * Returns minimal product data to prevent ECONNREFUSED errors during Next.js SSR/build
 * Real API calls are mocked by Playwright route stubs in E2E tests
 */

const mockProducts = [
  {
    id: 101,
    name: 'Ελαιόλαδο Κρήτης',
    slug: 'olive-oil-crete',
    price: 15.50,
    currency: 'EUR',
    images: [{ url: '/img/products/olive-oil.jpg', alt: 'Olive Oil' }],
    categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
    producer: { id: 1, name: 'Κρητικός Παραγωγός' },
    brand: 'Dixis',
    stock: 50,
    inStock: true,
    description: 'Premium extra virgin olive oil from Crete'
  },
  {
    id: 102,
    name: 'Μέλι Θυμαριού',
    slug: 'thyme-honey',
    price: 12.00,
    currency: 'EUR',
    images: [{ url: '/img/products/honey.jpg', alt: 'Honey' }],
    categories: [{ id: 2, name: 'Honey', slug: 'honey' }],
    producer: { id: 2, name: 'Μελισσοκόμος Πάρνηθας' },
    brand: 'Dixis',
    stock: 30,
    inStock: true,
    description: 'Pure thyme honey from Greek mountains'
  }
];

export async function GET() {
  // In CI/test mode, return mock data immediately
  // Pass E2E-SEED-01: Also check CI env var (set by GitHub Actions)
  if (process.env.DIXIS_ENV === 'test' || process.env.NODE_ENV === 'test' || process.env.CI === 'true') {
    return NextResponse.json({
      data: mockProducts,
      total: mockProducts.length,
      page: 1,
      per_page: 20
    });
  }

  // In production/development, this route should NOT be used
  // (frontend should call Laravel backend directly via NEXT_PUBLIC_API_BASE_URL)
  return NextResponse.json(
    { error: 'This mock API route is only available in test mode' },
    { status: 503 }
  );
}
