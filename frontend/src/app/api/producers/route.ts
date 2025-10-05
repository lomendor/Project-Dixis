import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db/client';
import {QueryParams, ProducerCreate} from '@/lib/validators/producer';

export async function GET(req: Request){
  const {searchParams} = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = QueryParams.safeParse(params);
  if(!parsed.success) return NextResponse.json({error:'Invalid params'}, {status:400});

  const {q, region, category, page, pageSize} = parsed.data;
  const where:any = { isActive: true };
  if(q) where.OR = [{name:{contains:q}},{region:{contains:q}},{category:{contains:q}}];
  if(region) where.region = region;
  if(category) where.category = category;
  const total = await prisma.producer.count({where});
  const items = await prisma.producer.findMany({ where, orderBy: [{name:'asc'}], skip:(page-1)*pageSize, take:pageSize });
  return NextResponse.json({ total, pages: Math.max(1, Math.ceil(total/pageSize)), page, items });
}

export async function POST(req: Request){
  try {
    const body = await req.json();
    const parsed = ProducerCreate.safeParse(body);
    if(!parsed.success) return NextResponse.json({error:'Bad payload', details: parsed.error}, {status:400});

    const created = await prisma.producer.create({ data: parsed.data as any });
    return NextResponse.json(created, {status:201});
  } catch (error) {
    return NextResponse.json({error:'Failed to create producer'}, {status:500});
  }
}
