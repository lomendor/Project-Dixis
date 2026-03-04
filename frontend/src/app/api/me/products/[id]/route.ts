import { NextRequest, NextResponse } from 'next/server';
import { verifySanctumProducer } from '@/lib/auth/verifySanctumProducer';
import { getLaravelInternalUrl } from '@/env';

/**
 * GET /api/me/products/[id]
 * Get a single product by ID (scoped to producer)
 *
 * ARCH-FIX-01: Replaced requireProducer() + Bearer token with verifySanctumProducer()
 * + Sanctum cookie forwarding. Producers use Sanctum session cookies, not dixis_jwt.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  try {
    const { id: productId } = await params;
    const laravelBase = getLaravelInternalUrl();

    const response = await fetch(`${laravelBase}/products/${productId}`, {
      headers: {
        'Accept': 'application/json',
        'Cookie': auth.cookieHeader,
        'Referer': 'https://dixis.gr',
        'Origin': 'https://dixis.gr',
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images: (data.data?.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        isPrimary: !!img.is_primary,
        sortOrder: img.sort_order ?? 0,
      })),
      isActive: data.data?.is_active !== false,
      createdAt: data.data?.created_at || data.data?.createdAt,
      updatedAt: data.data?.updated_at || data.data?.updatedAt,
    };

    return NextResponse.json({ product });

  } catch (error) {
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
 * ARCH-FIX-01: Uses verifySanctumProducer() + cookie forwarding
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  try {
    const { id: productId } = await params;
    const body = await request.json();

    // Map frontend fields to backend API format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendPayload: any = {};
    if (body.title !== undefined) backendPayload.name = body.title;
    if (body.slug !== undefined) backendPayload.slug = body.slug;
    if (body.category !== undefined) backendPayload.category = body.category;
    if (body.price !== undefined) backendPayload.price = parseFloat(body.price);
    if (body.unit !== undefined) backendPayload.unit = body.unit;
    if (body.stock !== undefined) backendPayload.stock = parseInt(body.stock, 10);
    if (body.description !== undefined) backendPayload.description = body.description;
    if (body.imageUrl !== undefined) backendPayload.image_url = body.imageUrl;
    if (body.images !== undefined) backendPayload.images = body.images;
    if (body.isActive !== undefined) backendPayload.is_active = Boolean(body.isActive);

    const laravelBase = getLaravelInternalUrl();

    const response = await fetch(`${laravelBase}/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': auth.cookieHeader,
        'Referer': 'https://dixis.gr',
        'Origin': 'https://dixis.gr',
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

  } catch (error) {
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
 * ARCH-FIX-01: Uses verifySanctumProducer() + cookie forwarding
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  try {
    const { id: productId } = await params;
    const laravelBase = getLaravelInternalUrl();

    const response = await fetch(`${laravelBase}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Cookie': auth.cookieHeader,
        'Referer': 'https://dixis.gr',
        'Origin': 'https://dixis.gr',
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

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη διαγραφή προϊόντος' },
      { status: 500 }
    );
  }
}
