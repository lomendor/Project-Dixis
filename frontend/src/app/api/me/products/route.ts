import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ProductCreate } from '@/lib/validators/product';
import { getSessionPhone } from '@/lib/auth/session';
import { slugify } from '@/lib/utils/slug';
import { Prisma } from '@prisma/client';

export async function GET(){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({ items: [] });
  const items = await prisma.product.findMany({
    where:{ producerId: me.id },
    orderBy:[{updatedAt:'desc'}]
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({error:'Δημιουργήστε πρώτα προφίλ παραγωγού.'},{status:400});

  const body = await req.json().catch(():null=>null);
  const parsed = ProductCreate.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:'Λάθος στοιχεία', details: parsed.error},{status:400});
  const p = parsed.data;

  const baseSlug = slugify(p.title);
  let slug = baseSlug || 'product';
  for(let i=0;i<10;i++){
    const hit = await prisma.product.findUnique({ where:{ slug } }).catch(():null=>null);
    if(!hit) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2,6)}`;
  }

  const data: Prisma.ProductCreateInput = {
    title: p.title,
    slug,
    category: p.category,
    price: typeof p.price === 'number' ? new Prisma.Decimal(p.price) : null,
    unit: p.unit || null,
    stock: (p.stock as any) ?? 0,
    description: p.description || null,
    imageUrl: p.imageUrl || null,
    isActive: true,
    producer: { connect: { id: me.id } }
  };
  const created = await prisma.product.create({ data });
  return NextResponse.json({ item: created }, {status:201});
}
