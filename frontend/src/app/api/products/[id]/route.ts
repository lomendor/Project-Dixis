import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLaravelInternalUrl } from '@/env';

/**
 * @deprecated LEGACY ROUTE — used by E2E tests and as fallback.
 * The storefront uses /api/public/products/[id] (Laravel proxy) since Phase 1.
 *
 * Phase 5.4: Tries Laravel first, falls back to Prisma for CI compatibility.
 */

async function fetchFromLaravel(id: string) {
  try {
    const laravelBase = getLaravelInternalUrl();
    const url = `${laravelBase}/public/products/${id}`;

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const p = json?.data ?? json;
    if (!p || !p.id) return null;

    // Map to legacy response format
    return {
      id: String(p.id),
      title: p.name || p.title,
      price: parseFloat(p.price),
      category: p.categories?.[0]?.slug || p.category || null,
      description: p.description,
      unit: p.unit || 'kg',
      stock: typeof p.stock === 'number' ? p.stock : 0,
      isActive: p.is_active !== false,
      createdAt: p.created_at,
      producer: p.producer ? { name: p.producer.name } : null,
    };
  } catch {
    return null;
  }
}

/**
 * @deprecated LEGACY ROUTE — kept for E2E tests only.
 * The storefront uses /api/public/products/[id] (Laravel proxy) since Phase 1.
 * See docs/AGENT/research/DUAL-DB-RESEARCH.md for context.
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  // Try Laravel first (production)
  const laravelProduct = await fetchFromLaravel(id);
  if (laravelProduct) {
    return NextResponse.json(laravelProduct);
  }

  // Fallback to Prisma (CI with SQLite seed data)
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      price: true,
      category: true,
      description: true,
      unit: true,
      stock: true,
      isActive: true,
      createdAt: true,
      producer: { select: { name: true } },
    },
  });

  if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(product);
}
