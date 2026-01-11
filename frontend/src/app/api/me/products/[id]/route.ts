import { NextRequest, NextResponse } from 'next/server';
import { requireProducer } from '@/lib/auth/requireProducer';
import { cookies } from 'next/headers';

/**
 * GET /api/me/products/[id]
 * Get a single product by ID (scoped to producer)
 *
 * Pass 2: Proxies to backend API to enforce ProductPolicy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const productId = params.id;

    // Proxy to backend GET /api/v1/products/{id}
    const backendUrl = new URL(
      `/api/v1/products/${productId}`,
      process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'
    );

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
        { error: errorData.message || 'Δεν βρέθηκε' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Map backend response to frontend format
    const product = {
      id: data.data?.id,
      slug: data.data?.slug,
      title: data.data?.name || data.data?.title,
      category: data.data?.category,
      price: parseFloat(data.data?.price || 0),
      unit: data.data?.unit || 'kg',
      stock: data.data?.stock || 0,
      description: data.data?.description,
      imageUrl: data.data?.image_url || data.data?.imageUrl,
      isActive: data.data?.is_active !== false,
      createdAt: data.data?.created_at || data.data?.createdAt,
      updatedAt: data.data?.updated_at || data.data?.updatedAt,
    };

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
 *
 * Pass 2: Proxies to backend PATCH /api/v1/products/{id} to enforce ProductPolicy
 * This ensures admin override capability and consistent authorization logic
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const productId = params.id;
    const body = await request.json();

    // Map frontend fields to backend API format
    const backendPayload: any = {};
    if (body.title !== undefined) backendPayload.name = body.title;
    if (body.slug !== undefined) backendPayload.slug = body.slug;
    if (body.category !== undefined) backendPayload.category = body.category;
    if (body.price !== undefined) backendPayload.price = parseFloat(body.price);
    if (body.unit !== undefined) backendPayload.unit = body.unit;
    if (body.stock !== undefined) backendPayload.stock = parseInt(body.stock, 10);
    if (body.description !== undefined) backendPayload.description = body.description;
    if (body.imageUrl !== undefined) backendPayload.image_url = body.imageUrl;
    if (body.isActive !== undefined) backendPayload.is_active = Boolean(body.isActive);

    // Proxy to backend PATCH /api/v1/products/{id}
    const backendUrl = new URL(
      `/api/v1/products/${productId}`,
      process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'
    );

    const response = await fetch(backendUrl.toString(), {
      method: 'PATCH',
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
        { error: errorData.message || 'Σφάλμα κατά την ενημέρωση προϊόντος' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Map backend response to frontend format
    const product = {
      id: data.data?.id,
      slug: data.data?.slug,
      title: data.data?.name || data.data?.title,
      category: data.data?.category,
      price: parseFloat(data.data?.price || 0),
      unit: data.data?.unit || 'kg',
      stock: data.data?.stock || 0,
      description: data.data?.description,
      imageUrl: data.data?.image_url || data.data?.imageUrl,
      isActive: data.data?.is_active !== false,
      createdAt: data.data?.created_at || data.data?.createdAt,
      updatedAt: data.data?.updated_at || data.data?.updatedAt,
    };

    return NextResponse.json({ success: true, product });

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
 *
 * Pass 2: Proxies to backend DELETE /api/v1/products/{id} to enforce ProductPolicy
 * This ensures admin override capability and consistent authorization logic
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const productId = params.id;

    // Proxy to backend DELETE /api/v1/products/{id}
    const backendUrl = new URL(
      `/api/v1/products/${productId}`,
      process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'
    );

    const response = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Δεν βρέθηκε' },
        { status: response.status }
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
