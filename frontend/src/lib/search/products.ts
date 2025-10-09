import { prisma } from '@/lib/db/client';

export type Filters = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  inStockOnly?: boolean;
  sort?: 'new' | 'price-asc' | 'price-desc';
  page?: number;
  pageSize?: number;
};

export async function searchProducts(f: Filters){
  const page = Math.max(1, Number(f.page||1));
  const pageSize = Math.min(50, Math.max(12, Number(f.pageSize||12)));

  const where:any = { isActive: true };
  if (f.q) where.title = { contains: String(f.q), mode:'insensitive' };
  if (f.category) where.category = String(f.category);
  if (f.min!=null || f.max!=null) where.price = { gte: f.min ?? undefined, lte: f.max ?? undefined };
  if (f.inStockOnly) where.stock = { gt: 0 };

  let orderBy:any = { createdAt: 'desc' };
  if (f.sort === 'price-asc') orderBy = { price: 'asc' };
  if (f.sort === 'price-desc') orderBy = { price: 'desc' };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy,
      select: { id:true, title:true, price:true, unit:true, stock:true, category:true, imageUrl:true, createdAt:true },
      skip: (page-1)*pageSize, take: pageSize
    }),
    prisma.product.count({ where })
  ]);

  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total/pageSize)) };
}
