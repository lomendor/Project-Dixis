import { NextResponse } from 'next/server';
import { getLaravelInternalUrl } from '@/env';

export const dynamic = 'force-dynamic';

/**
 * STOREFRONT-LARAVEL-01: Public Product by ID/slug API
 * Proxies to Laravel PublicProductController@show instead of querying Prisma.
 * Used by (storefront)/products/[id]/page.tsx via INTERNAL_API_URL.
 *
 * Laravel is the SSOT for products (see docs/AGENT/research/DUAL-DB-RESEARCH.md).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    const laravelBase = getLaravelInternalUrl();
    const res = await fetch(`${laravelBase}/public/products/${id}`, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'not found' }, { status: 404 });
      }
      console.error('[API] Laravel public/products/', id, 'failed:', res.status);
      return NextResponse.json(
        { error: `Laravel API error: ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = json?.data ?? json;

    if (!p || !p.id) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    // Map Laravel response to format expected by getProductById() in detail page
    const categories = p.categories || [];
    const images = p.images || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const primaryImage = images.find((img: any) => img.is_primary) || images[0];

    const data = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      unit: p.unit || 'kg',
      stock: typeof p.stock === 'number' ? p.stock : 0,
      is_active: p.is_active,
      category: categories[0]?.slug || p.category || null,
      image_url: primaryImage?.url || p.image_url || null,
      producer_id: p.producer_id || p.producer?.id || null,
      producer: p.producer
        ? {
            id: p.producer.id,
            name: p.producer.name,
            slug: p.producer.slug,
          }
        : null,
    };

    return NextResponse.json(
      { data },
      { headers: { 'cache-control': 'no-store' } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error('[API] public/products/[id] proxy error:', message);
    return NextResponse.json(
      { error: 'Proxy error', message },
      { status: 500 }
    );
  }
}
