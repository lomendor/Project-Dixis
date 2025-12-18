import { NextRequest, NextResponse } from 'next/server';
import { requireProducer } from '@/lib/auth/requireProducer';
import { cookies } from 'next/headers';

/**
 * GET /api/me/products
 * Returns products for the authenticated producer (scoped to producer_id)
 * Query params: ?q=searchterm&category=xyz&status=active|inactive|all
 *
 * Pass 2: Proxies to backend scoped endpoint instead of using Prisma directly
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated producer (throws if not auth'd)
    await requireProducer();

    // Get auth token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Parse query params for search/filter
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all';

    // Build backend API URL
    const backendUrl = new URL(
      '/api/v1/producer/products',
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001'
    );

    // Add query params
    if (q) backendUrl.searchParams.set('search', q);
    if (category) backendUrl.searchParams.set('category', category);
    if (status) backendUrl.searchParams.set('status', status);

    // Call backend scoped endpoint with session token
    const response = await fetch(backendUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch products' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Map backend response to frontend format
    const products = (data.data || []).map((p: any) => ({
      id: p.id,
      title: p.name || p.title,
      name: p.name,
      category: p.category,
      price: parseFloat(p.price),
      unit: p.unit || 'kg',
      stock: p.stock || 0,
      description: p.description,
      imageUrl: p.image_url || p.imageUrl,
      isActive: p.is_active !== false,
      is_active: p.is_active !== false,
      status: p.status || 'available',
      createdAt: p.created_at || p.createdAt,
      updatedAt: p.updated_at || p.updatedAt,
      currency: 'EUR',
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return NextResponse.json({
      products,
      total: products.length,
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
 *
 * Pass 2: Proxies to backend API (producer_id auto-set server-side)
 */
export async function POST(request: NextRequest) {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Map frontend fields to backend API format
    const backendPayload = {
      name: body.title || body.name,
      slug: body.slug,
      category: body.category,
      price: parseFloat(body.price),
      unit: body.unit,
      stock: parseInt(body.stock, 10),
      description: body.description || null,
      image_url: body.imageUrl || null,
      is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
      // Note: producer_id NOT included - backend auto-sets from auth user
    };

    // Call backend API
    const backendUrl = new URL(
      '/api/v1/products',
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001'
    );

    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to create product' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, product: data.data }, { status: 201 });

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
