import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @deprecated LEGACY ROUTE — kept for E2E tests only.
 * The storefront uses /api/public/products/[id] (Laravel proxy) since Phase 1.
 * See docs/AGENT/research/DUAL-DB-RESEARCH.md for context.
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

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
