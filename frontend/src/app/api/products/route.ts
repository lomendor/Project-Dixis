import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ProductQuery } from '@/lib/validators/product';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const parsed = ProductQuery.safeParse(Object.fromEntries(searchParams));
  if(!parsed.success) return NextResponse.json({error:'Bad query'},{status:400});
  const { q, category, producerId, page, pageSize } = parsed.data;
  const where:any = { isActive: true, producer: { isActive: true } };
  if (q) where.OR = [{ title:{ contains:q, mode:'insensitive' } }, { category:{ contains:q, mode:'insensitive' } }];
  if (category) where.category = category;
  if (producerId) where.producerId = producerId;
  const total = await prisma.product.count({ where });
  const items = await prisma.product.findMany({
    where, orderBy:[{updatedAt:'desc'}], skip:(page-1)*pageSize, take:pageSize
  });
  return NextResponse.json({ total, pages: Math.max(1, Math.ceil(total/pageSize)), page, items });
}
