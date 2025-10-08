import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: Request){
  // Block in production
  if (String(process.env.DIXIS_ENV).toLowerCase() === 'production') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try{
    const body = await req.json();
    const data = {
      title: String(body.title||''),
      category: body.category ? String(body.category) : 'Test',
      price: Number(body.price||0),
      unit: String(body.unit||'τεμ'),
      stock: Number(body.stock||0),
      isActive: body.isActive===false ? false : true,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      producerId: String(body.producerId || 'test-producer-dev'),
    };
    if(!data.title) return NextResponse.json({ error:'title required' }, { status: 400 });
    const item = await prisma.product.create({ data });
    return NextResponse.json({ id: item.id, ...item }, { status: 201 });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || 'seed failed' }, { status: 500 });
  }
}
